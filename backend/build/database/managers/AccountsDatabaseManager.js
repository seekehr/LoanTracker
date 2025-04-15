import { sql } from 'kysely';
export default class AccountsDatabaseManager {
    db;
    constructor(db) {
        this.db = db;
    }
    /**
     * Only function to handle the exception itself.
     */
    async init() {
        const TABLE_QUERY = sql `
            CREATE TABLE IF NOT EXISTS accounts (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(30) NOT NULL,
            password CHAR(172) NOT NULL,
            salt CHAR(172)       NOT NULL,
            displayName VARCHAR(60) NOT NULL,
            country VARCHAR(60) NOT NULL,
            pfp VARCHAR(400),
            ip VARCHAR(45) NOT NULL,
            loans JSON NOT NULL,
            timeCreated BIGINT NOT NULL,
            verified BOOLEAN NOT NULL,
            idVerificationNumber BIGINT NULL
            );`;
        try {
            await TABLE_QUERY.execute(this.db);
            return true;
        }
        catch (error) {
            console.error("Error encountered during creating `accounts` table (invalid connection details?): " + error);
            return false;
        }
    }
    async createAccount(newAccount) {
        try {
            const loans = JSON.stringify({ loans: [] });
            const timeCreated = Date.now();
            const account = {
                username: newAccount.username,
                password: newAccount.password,
                salt: newAccount.salt,
                displayName: newAccount.displayName,
                country: newAccount.country,
                ip: newAccount.ip,
                loans, timeCreated, verified: false, idVerificationNumber: null, pfp: null
            };
            const result = await this.db
                .insertInto("accounts")
                .values(account)
                .executeTakeFirst();
            if (typeof (result.insertId) === "undefined" || result.insertId < 0) {
                throw new Error("Invalid INSERT ID! Account may still be inserted.");
            }
            return result.insertId;
        }
        catch (error) {
            throw error instanceof Error ? error : new Error("\n(Invalid error type, creating error...): \n " + String(error));
        }
    }
    async checkUsername(username) {
        return (await this.db
            .selectFrom("accounts")
            .selectAll()
            .where("username", '=', username)
            .executeTakeFirst()) !== undefined;
    }
    async getAccount(username, password) {
        return await this.db
            .selectFrom("accounts")
            .selectAll()
            .where("username", '=', username).where("password", '=', password)
            .executeTakeFirst();
    }
    async getAccountFromUsername(username) {
        return await this.db
            .selectFrom("accounts")
            .selectAll()
            .where("username", '=', username)
            .executeTakeFirst();
    }
    async getIdFromUsername(username) {
        const result = await this.db
            .selectFrom("accounts")
            .select("id")
            .where("username", '=', username)
            .executeTakeFirst();
        return result?.id;
    }
    async getAccountFromID(id) {
        return await this.db
            .selectFrom("accounts")
            .selectAll()
            .where("id", '=', id)
            .executeTakeFirst();
    }
    async deleteAccount(id) {
        const result = await this.db
            .deleteFrom("accounts")
            .where("id", '=', id)
            .executeTakeFirst();
        return result.numDeletedRows > 0;
    }
    async updateAccount(account, updates) {
        return await this.db
            .updateTable("accounts")
            .set(updates)
            .where("id", '=', account.id)
            .executeTakeFirst();
    }
}
