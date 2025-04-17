import { Kysely, sql } from "kysely";
import { accDb } from "../../app.js";
import { Database, Loan, NewLoan } from "../Database.js";
import IDatabaseManager from "./IDatabaseManager.js";

export default class LoansDatabaseManager implements IDatabaseManager {
    db: Kysely<Database>;

    constructor(db: Kysely<Database>) {
        this.db = db;
    }

    async init(): Promise<boolean> {
        const TABLE_QUERY = sql`
            CREATE TABLE IF NOT EXISTS loans
            (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            loanerId INT UNSIGNED NOT NULL,
            loanedId INT UNSIGNED NOT NULL,
            amount DECIMAL(10,2) NOT NULL,
            currency VARCHAR(10) NOT NULL,
            timeExpires BIGINT NOT NULL,
            timeCreated BIGINT NOT NULL,
            proofs JSON NOT NULL,
            paid BOOLEAN NOT NULL DEFAULT FALSE,
            approved BOOLEAN NOT NULL DEFAULT FALSE
            );
        `;

        try {
            await TABLE_QUERY.execute(this.db);
            return true;
        } catch (error) {
            console.error("Error encountered during creating `loans` table (invalid connection details?): " + error);
            return false;
        }
    }

    async createLoan(newLoan: NewLoan, creatorId: number): Promise<boolean> {
        try {
            const proofs = JSON.stringify({proofs: []});
            const timeCreated = Date.now();
            const loan = {
                loanerId: newLoan.loanerId,
                loanedId: newLoan.loanedId,
                amount: newLoan.amount,
                currency: newLoan.currency,
                timeExpires: newLoan.timeExpires,
                proofs, timeCreated, paid: false, approved: false
            };

            const result = await this.db
                .insertInto("loans")
                .values(loan)
                .executeTakeFirst();
            if (typeof(result.insertId) === "undefined" || result.insertId < 0) {
                throw new Error("Invalid INSERT ID! Account may still be inserted.");
            }

            await Promise.all([
                this.synchroniseAccounts(Number(result.insertId), newLoan.loanerId, newLoan.loanedId),
                this.addApprove(creatorId, Number(result.insertId))
            ]);

            // If Promise.all failed, it would have thrown so it's successful if we got here anyways
            return result.insertId > 0;
        } catch (error) {
            throw error instanceof Error ? error : new Error("\n(Invalid error type, creating error...): \n " + String(error));
        }
    }

    async getLoanFromId(id: number): Promise<Loan | Error> {
        return await this.db
            .selectFrom("loans")
            .selectAll()
            .where("id", '=', id)
            .executeTakeFirst() ?? new Error("No loan found for {" + id + "}.")
    }

    async markPaid(loan: Loan): Promise<boolean> {
        try {
            const result = await this.db
                .updateTable("loans")
                .set({ paid: true })
                .where("id", "=", loan.id)
                .executeTakeFirst();
            await this.synchroniseAccountsDelete(loan.id, loan.loanerId, loan.loanedId);
            return result.numUpdatedRows > 0;
        } catch (error) {
            throw error instanceof Error ? "Could not update loan: " + error : new Error("Could not update loan!?!: " + String(error));
        }
    }

    async approveLoan(id: number, loanerId: number, loanedId: number): Promise<void> {
        const result = await this.db
            .updateTable("loans")
            .set({ approved: true })
            .where("id", '=', id)
            .executeTakeFirst();
        if (result.numUpdatedRows > 0) {
            await this.removeApprove(loanerId, id);
            await this.removeApprove(loanedId, id);
        }
    }

    private async synchroniseAccounts(id: number, loanerId: number, loanedId: number) {
        const loanedIds = [];
        const loaneds = await accDb.getLoanedFromAccountId(loanerId);
        if (typeof(loaneds) === "object" && "loaned" in loaneds) {
            const loaned = loaneds.loaned;
            if (typeof(loaned) === "object" && loaned !== null && "loaned" in loaned && Array.isArray(loaned.loaned)) {
                loanedIds.push(...loaned.loaned);
            }
        }
        loanedIds.push(id);
        accDb.updateAccount(loanerId, { loaned: JSON.stringify({ loaned: loanedIds }) });

        const loanIds = [];
        const loans = await accDb.getLoansFromAccountId(loanedId);
        if (typeof(loans) === "object" && "loans" in loans) {
            const loan = loans.loans;
            if (typeof(loan) === "object" && loan !== null && "loans" in loan && Array.isArray(loan.loans)) {
                loanIds.push(...loan.loans);
            }
        }

        loanIds.push(id);
        accDb.updateAccount(loanedId, { loans: JSON.stringify({ loans: loanIds }) });
    }

    private async synchroniseAccountsDelete(id: number, loanerId: number, loanedId: number) {
        const loanedIds = [];
        const loaneds = await accDb.getLoanedFromAccountId(loanerId);
        if (typeof(loaneds) === "object" && "loaned" in loaneds) {
            const loaned = loaneds.loaned;
            if (typeof(loaned) === "object" && loaned !== null && "loaned" in loaned && Array.isArray(loaned.loaned)) {
                loanedIds.push(...loaned.loaned);
            }
        }
        
        accDb.updateAccount(loanerId, { loaned: JSON.stringify({ loaned: loanedIds.filter((loanedId: number) => loanedId !== id) }) });

        const loanIds = [];
        const loans = await accDb.getLoansFromAccountId(loanedId);
        if (typeof(loans) === "object" && "loans" in loans) {
            const loan = loans.loans;
            if (typeof(loan) === "object" && loan !== null && "loans" in loan && Array.isArray(loan.loans)) {
                loanIds.push(...loan.loans);
            }
        }

        accDb.updateAccount(loanedId, { loans: JSON.stringify({ loans: loanIds.filter((loanId: number) => loanId !== id) }) });
    }

    // ====================
    //      Approves/Accounts DB
    // ====================

    private async addApprove(id: number, loanId: number) {
        return await this.db
            .updateTable("accounts")
            .set({ toApprove: JSON.stringify({ toApprove: [loanId] }) })
            .where("id", '=', id)
            .executeTakeFirst();
    }

    private async getToApproves(id: number): Promise<string|undefined> {
        const result = await this.db
            .selectFrom("accounts")
            .select("toApprove")
            .where("id", '=', id)
            .executeTakeFirst();
        return result?.toApprove;
    }

    private async removeApprove(id: number, loanId: number): Promise<boolean> {
        const currentApproves = await this.getToApproves(id);
        if (!currentApproves) return false;

        const approves = JSON.parse(currentApproves);
        const filteredApproves = approves.toApprove.filter((id: number) => id !== loanId);

        const result = await this.db
            .updateTable("accounts")
            .set({ toApprove: JSON.stringify({ toApprove: filteredApproves }) })
            .where("id", '=', id)
            .executeTakeFirst();
        if (result.numUpdatedRows > 0) {
            return true;
        }

        return false;
    }
}

