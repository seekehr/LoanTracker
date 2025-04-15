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
            paid BOOLEAN NOT NULL DEFAULT FALSE
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

    async createLoan(newLoan: NewLoan): Promise<bigint> {
        try {
            const proofs = JSON.stringify({proofs: []});
            const timeCreated = Date.now();
            const loan = {
                loanerId: newLoan.loanerId,
                loanedId: newLoan.loanedId,
                amount: newLoan.amount,
                currency: newLoan.currency,
                timeExpires: newLoan.timeExpires,
                proofs, timeCreated, paid: false
            };

            const result = await this.db
                .insertInto("loans")
                .values(loan)
                .executeTakeFirst();
            if (typeof(result.insertId) === "undefined" || result.insertId < 0) {
                throw new Error("Invalid INSERT ID! Account may still be inserted.");
            }

            await this.synchroniseAccounts(Number(result.insertId), newLoan.loanerId, newLoan.loanedId);
            return result.insertId;
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

    async getLoansByAccountId(id: number): Promise<Loan[]> {
        return await this.db
            .selectFrom("loans")
            .selectAll()
            .where("loanerId", "=", id)
            .execute();
    }

    private async synchroniseAccounts(id: number, loanerId: number, loanedId: number) {
        const loanedIds = [];
        const loaneds = await this.getLoansByAccountId(loanerId);
        for (const loaned of loaneds) {
            loanedIds.push(loaned.id);
        }

        await accDb.updateAccount(loanerId, { loaned: JSON.stringify(loanedIds) });

        const loanIds = [];
        const loans = await this.getLoansByAccountId(loanedId);
        for (const loan of loans) {
            loanIds.push(loan.id);
        }
        await accDb.updateAccount(loanedId, { loans: JSON.stringify(loanIds) });
    }

    private async synchroniseAccountsDelete(id: number, loanerId: number, loanedId: number) {
        const loanedIds = [];
        const loaneds = await this.getLoansByAccountId(loanerId);
        for (const loaned of loaneds) {
            if (loaned.id === id) continue;
            loanedIds.push(loaned.id);
        }

        await accDb.updateAccount(loanerId, { loaned: JSON.stringify(loanedIds) });

        const loanIds = [];
        const loans = await this.getLoansByAccountId(loanedId);
        for (const loan of loans) {
            if (loan.id === id) continue;
            loanIds.push(loan.id);
        }
        await accDb.updateAccount(loanedId, { loans: JSON.stringify(loanIds) });
    }
}

