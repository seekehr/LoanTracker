import "dotenv/config";
import { Kysely, MysqlDialect } from "kysely";
import { createPool } from "mysql2";
import console from "node:console";
import process from "node:process";
import redis from "redis";
import AccountsDatabaseManager from "./managers/AccountsDatabaseManager.js";
import LoansDatabaseManager from "./managers/LoansDatabaseManager.js";
const DB_NAME = "loantracker";
const DB_PORT = 3306;
const DB_HOST = "localhost";
const user = process.env["DB_USER"];
const password = process.env["DB_PASSWORD"];
if (typeof (user) !== 'string' || typeof (password) !== 'string') {
    console.log("Invalid username/password/session secret.");
    process.exit(1);
}
export default class DatabaseCreator {
    createDb() {
        const dialect = new MysqlDialect({
            pool: createPool({
                database: DB_NAME,
                host: DB_HOST,
                user: user,
                password: password,
                port: DB_PORT,
                connectionLimit: 10,
            }),
        });
        return new Kysely({
            dialect
        });
    }
    createRedisDb() {
        return redis.createClient({
            url: `redis://${process.env["REDIS_USER"]}:${process.env["REDIS_PASSWORD"]}@${process.env["REDIS_HOST"]}:${process.env["REDIS_PORT"]}`,
        });
    }
    async initDatabase(db) {
        // TODO: Dynamic loading of managers
        const accDb = new AccountsDatabaseManager(db);
        const loansDb = new LoansDatabaseManager(db);
        try {
            await Promise.all([
                accDb.init().then((result) => {
                    if (!result) {
                        throw new Error("Accounts Database cannot be initialised.");
                    }
                }),
                loansDb.init().then((result) => {
                    if (!result) {
                        throw new Error("Loans Database cannot be initialised.");
                    }
                }),
            ]);
            return [accDb, loansDb];
        }
        catch (error) {
            throw new Error("Error caught during initialisation: " + error);
        }
    }
    async synchronoseDatabases(accDb, loansDb) {
        const accounts = await accDb.getAllAccounts();
        for (const account of accounts) {
            const loans = await loansDb.getLoansByAccountId(account.id);
            const loaned = await loansDb.getLoansByAccountId(account.id);
            await accDb.updateAccount(account.id, { loans: JSON.stringify(loans), loaned: JSON.stringify(loaned) });
        }
        console.log("Databases synchronised.");
    }
}
