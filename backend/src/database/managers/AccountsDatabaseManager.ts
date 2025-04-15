import { Kysely, sql } from 'kysely';
import { Account, Database, NewAccount } from "../Database.js";
import IDatabaseManager from "./IDatabaseManager.js";

export default class AccountsDatabaseManager implements IDatabaseManager {
    db: Kysely<Database>

    constructor(db: Kysely<Database>) {
        this.db = db;
    }

    /**
     * Only function to handle the exception itself.
     */
    async init(): Promise<boolean> {
        const TABLE_QUERY = sql`
            CREATE TABLE IF NOT EXISTS accounts (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(30) NOT NULL,
            password CHAR(172) NOT NULL,
            salt CHAR(172)       NOT NULL,
            displayName VARCHAR(60) NOT NULL,
            country VARCHAR(60) NOT NULL,
            pfp VARCHAR(400),
            ip VARCHAR(45) NOT NULL,
            loaned JSON NOT NULL,
            loans JSON NOT NULL,
            timeCreated BIGINT NOT NULL,
            verified BOOLEAN NOT NULL,
            idVerificationNumber BIGINT NULL
            );`;

        try {
            await TABLE_QUERY.execute(this.db);
            return true;
        } catch (error) {
            console.error("Error encountered during creating `accounts` table (invalid connection details?): " + error);
            return false;
        }
    }

    async createAccount(newAccount: NewAccount): Promise<bigint> {
        try {
            const loans = JSON.stringify({loans: []});
            const loaned = JSON.stringify({loaned: []});
            const timeCreated = Date.now();
            const account = {
                username: newAccount.username,
                password: newAccount.password,
                salt: newAccount.salt,
                displayName: newAccount.displayName,
                country: newAccount.country,
                ip: newAccount.ip,
                loans, loaned, timeCreated, verified: false, idVerificationNumber: null, pfp: null
            };

            const result = await this.db
                .insertInto("accounts")
                .values(account)
                .executeTakeFirst();
            if (typeof(result.insertId) === "undefined" || result.insertId < 0) {
                throw new Error("Invalid INSERT ID! Account may still be inserted.");
            }

            return result.insertId;
        } catch (error) {
            throw error instanceof Error ? error : new Error("\n(Invalid error type, creating error...): \n " + String(error));
        }
    }

    async checkUsername(username: string): Promise<boolean> {
        return (await this.db
            .selectFrom("accounts")
            .selectAll()
            .where("username", '=', username)
            .executeTakeFirst()) !== undefined;
    }

    async getAccount(username: string, password: string): Promise<Account|undefined> {
        return await this.db
            .selectFrom("accounts")
            .selectAll()
            .where("username", '=', username).where("password", '=', password)
            .executeTakeFirst();
    }

    async getAccountFromUsername(username: string): Promise<Account|undefined> {
        return await this.db
            .selectFrom("accounts")
            .selectAll()
            .where("username", '=', username)
            .executeTakeFirst();
    }

    async getUsernameFromID(id: number): Promise<string | undefined> {
        const result = await this.db
            .selectFrom("accounts")
            .select("username")
            .where("id", '=', id)
            .executeTakeFirst();
        return result?.username;
    }
    
    async getIdFromUsername(username: string): Promise<number | undefined> {
        const result = await this.db
            .selectFrom("accounts")
            .select("id")
            .where("username", '=', username)
            .executeTakeFirst();

        return result?.id;
    }


    async getAccountFromID(id: number): Promise<Account|undefined> {
        return await this.db
            .selectFrom("accounts")
            .selectAll()
            .where("id", '=', id)
            .executeTakeFirst();
    }

    async deleteAccount(id: number): Promise<boolean> {
        const result = await this.db
            .deleteFrom("accounts")
            .where("id", '=', id)
            .executeTakeFirst()
        return result.numDeletedRows > 0;
    }

    async updateAccount(id: number, updates: object) {
        return await this.db
            .updateTable("accounts")
            .set(updates)
            .where("id", '=', id)
            .executeTakeFirst();
    }

    async getAccountsByIP(ip: string): Promise<Account[]> {
        return await this.db
            .selectFrom("accounts")
            .selectAll()
            .where("ip", '=', ip)
            .execute();
    }

    async getAllAccounts(): Promise<Account[]> {
        return await this.db
            .selectFrom("accounts")
            .selectAll()
            .execute();
    }
}