import express from 'express';
import { accDb } from "../app.js";
import SecurityGuard from '../database/SecurityGuard.js';
const router = express.Router();
/* GET home page. */
router.get('/', async function (req, res, next) {
    if ("username" in req.query && typeof (req.query["username"]) === "string" && SecurityGuard.verifyName(req.query["username"])) {
        const usernameExists = await accDb.checkUsername(req.query["username"]);
        if (usernameExists) {
            res.status(401).json({ error: "Username already in use." });
        }
        else {
            res.status(200).json({ message: "Username not in use." });
        }
    }
    else {
        res.status(400).json({ error: "Invalid request." });
    }
});
export default router;
