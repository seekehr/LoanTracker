import express from "express";
import jwt from "jsonwebtoken";
import { accDb, jwtSecret, loansDb } from "../../app.js";
const router = express.Router();
router.post("/", async (req, res) => {
    const token = req.token;
    if (!token) {
        res.status(401).json({ error: 'No token provided' });
        return;
    }
    try {
        const { loanId, username } = req.query;
        if (!loanId || typeof (loanId) !== 'string') {
            res.status(400).json({ error: 'Loan ID is required' });
            return;
        }
        if (!username || typeof (username) !== 'string' || Number(loanId) <= 0) {
            res.status(400).json({ error: 'Username is required' });
            return;
        }
        const decoded = jwt.verify(token, jwtSecret);
        if (typeof (decoded) !== 'string') {
            res.status(401).json({ error: 'Invalid token' });
            return;
        }
        const idOne = await accDb.getIdFromUsername(username);
        const idTwo = await accDb.getIdFromUsername(decoded);
        if (!idOne || !idTwo) {
            console.log(idOne, idTwo);
            res.status(400).json({ error: 'Invalid usernames?' });
            return;
        }
        await loansDb.approveLoan(Number(loanId), idOne, idTwo);
    }
    catch (error) {
        console.error("Error approving loan:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
export default router;
