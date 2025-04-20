import express from "express";
import jwt from "jsonwebtoken";
import { jwtSecret, loansDb } from "../../app.js";

const router = express.Router();

router.post("/", async (req, res) => {
    const token = req.token;
    if (!token) {
        res.status(401).json({ error: 'No token provided' });
        return;
    }

    try {
        const { loanId, loanerId, loanedId, paid, approved, proofs } = req.query;

        if (!loanId || typeof(loanId) !== 'string') {
            res.status(400).json({ error: 'Loan ID is required' });
            return;
        }

        if (!loanerId || !loanedId || typeof(loanerId) !== 'string' || typeof(loanedId) !== 'string') {
            res.status(400).json({ error: 'Loaner ID and loaned ID are required' });
            return;
        }

        if (Number(loanId) <= 0 || Number(loanerId) <= 0 || Number(loanedId) <= 0) {
            res.status(400).json({ error: 'Loan ID and IDs must be positive integers' });
            return;
        }

        const decoded = jwt.verify(token, jwtSecret);
        if (typeof(decoded) !== 'string') {
            res.status(401).json({ error: 'Invalid token' });
            return;
        }

        if (proofs) {
            if (typeof(proofs) !== 'string') {
                res.status(400).json({ error: 'Proofs must be a string' });
                return;
            }
        }

        const updates: Record<string, any> = {};

        if (paid && paid === "true") {
            updates.paid = true;
        }

        if (approved && approved === "true") {
            updates.approved = true;
        }

        if (proofs) {
            updates.proofs = proofs;
        }

        await loansDb.updateLoan(Number(loanId), Number(loanerId), Number(loanedId), updates);
    } catch (error) {
        console.error("Error approving loan:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

export default router;
