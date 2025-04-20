import "dotenv/config";
import { Kysely, MysqlDialect } from "kysely";
import { createPool } from "mysql2";
import console from "node:console";
import process from "node:process";
import redis from "redis";
import { Database } from "./Database.js";
import AccountsDatabaseManager from "./managers/AccountsDatabaseManager.js";
import LoansDatabaseManager from "./managers/LoansDatabaseManager.js";
import NotificationsDatabaseManager from './managers/NotificationsDatabaseManager.js';

const DB_NAME = "loantracker";
const DB_PORT = 3306;
const DB_HOST = "localhost";

const user = process.env["DB_USER"];
const password = process.env["DB_PASSWORD"];

if (typeof(user) !== 'string' || typeof(password) !== 'string') {
    console.log("Invalid username/password/session secret.")
    process.exit(1);
}

export default class DatabaseCreator {

    createDb(): Kysely<Database> {
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
        return new Kysely<Database>({
            dialect
        });
    }

    createRedisDb(): redis.RedisClientType {
        return redis.createClient({
            url: `redis://${process.env["REDIS_USER"]}:${process.env["REDIS_PASSWORD"]}@${process.env["REDIS_HOST"]}:${process.env["REDIS_PORT"]}`,
        });
    }

    async initDatabase(db: Kysely<Database>): Promise<[AccountsDatabaseManager, LoansDatabaseManager, NotificationsDatabaseManager]> {
        // TODO: Dynamic loading of managers
        const accDb = new AccountsDatabaseManager(db);
        const loansDb = new LoansDatabaseManager(db);
        const notifDb = new NotificationsDatabaseManager(db);
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
                notifDb.init().then((result) => {
                    if (!result) {
                        throw new Error("Notifications Database cannot be initialised.");
                    }
                }),
            ]);
            return [accDb, loansDb, notifDb];
        } catch (error) {
            throw new Error("Error caught during initialisation: " + error);
        }
    }
}
