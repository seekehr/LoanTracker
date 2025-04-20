import express from 'express';
import cookieParser from 'cookie-parser';
import cors from "cors";
import "dotenv/config";
import * as console from "node:console";
import * as process from "node:process";
import DatabaseCreator from './database/DatabaseCreator.js';
import loginRouter from './routes/account/login.js';
import profileRouter from "./routes/account/profile.js";
import registerRouter from "./routes/account/register.js";
import checkUsernameRouter from "./routes/check_username.js";
import approveLoanRouter from './routes/loan/approve_loan.js';
import createLoanRouter from './routes/loan/create_loan.js';
import viewLoansRouter from './routes/loan/view_loans.js';
import { add_ip } from './routes/middleware/add_ip.js';
import auth from './routes/middleware/auth.js';
import RateLimiter from './routes/middleware/ratelimiter.js';
import getNotificationsRouter from './routes/notification/get_notifications.js';
import markNotificationRouter from './routes/notification/mark_notification.js';
import sendNotificationRouter from './routes/notification/send_notification.js';
import parseTokenRouter from './routes/parse_token.js';
import "./util/polyfills.js";
const dbCreator = new DatabaseCreator();
let db;
let redisDb;
export let accDb;
export let loansDb;
export let notifsDb;
let rateLimiter;
export const jwtSecret = process.env["JWT_SECRET"] ?? "";
if (jwtSecret === "") {
    console.log("Invalid session secret.");
    process.exit(1);
}
try {
    db = dbCreator.createDb();
    const connectToRedis = async () => {
        redisDb = dbCreator.createRedisDb();
        await redisDb.connect();
        if (!redisDb.isOpen) {
            throw new Error("Redis connection failed.");
        }
        redisDb.on('error', (err) => {
            console.error('Redis Client Error:', err);
            setTimeout(connectToRedis, 10000);
        });
        rateLimiter = new RateLimiter(redisDb);
        console.log("Redis Client Connected");
    };
    await connectToRedis();
    [accDb, loansDb, notifsDb] = await dbCreator.initDatabase(db);
}
catch (error) {
    console.log("Error during DB init: " + error);
    process.exit(1);
}
export const app = express();
app.use(cors({
    origin: 'http://localhost:8080', // Frontend origin
    credentials: true,
}));
app.use(cookieParser());
app.use(express.json());
if (rateLimiter instanceof RateLimiter) {
    // ===================== LOGIN ========================
    app.use('/register', rateLimiter.getRateLimitMiddleware("/register", 1440, 2 * 1000), add_ip, registerRouter);
    app.use('/check-username', rateLimiter.getRateLimitMiddleware("/check-username", 1440, 300 * 1000), checkUsernameRouter);
    app.use('/login', rateLimiter.getRateLimitMiddleware("/login", 10, 5 * 1000), add_ip, loginRouter);
    // -
    app.use('/profile', rateLimiter.getRateLimitMiddleware("/profile", 10, 5 * 1000), auth, profileRouter);
    app.use('/loans', rateLimiter.getRateLimitMiddleware("/loans", 10, 5 * 1000), auth, viewLoansRouter);
    app.use('/create-loan', rateLimiter.getRateLimitMiddleware("/create-loan", 10, 5 * 1000), auth, createLoanRouter);
    // -
    app.use('/parse-token', rateLimiter.getRateLimitMiddleware("/parse-token", 10, 5 * 1000), auth, parseTokenRouter);
    app.use('/approve-loan', rateLimiter.getRateLimitMiddleware("/approve-loan", 10, 5 * 1000), auth, approveLoanRouter);
    // -
    app.use('/send-notification', rateLimiter.getRateLimitMiddleware("/send-notification", 10, 5 * 1000), auth, sendNotificationRouter);
    app.use('/get-notifications', rateLimiter.getRateLimitMiddleware("/get-notifications", 20, 5 * 1000), auth, getNotificationsRouter);
    app.use('/mark-notification', rateLimiter.getRateLimitMiddleware("/mark-notification", 20, 5 * 1000), auth, markNotificationRouter);
}
