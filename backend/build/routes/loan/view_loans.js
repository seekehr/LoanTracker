import express from 'express';
import jwt from 'jsonwebtoken';
import { accDb, jwtSecret, loansDb } from '../../app.js';
const router = express.Router();
router.get('/', async (req, res) => {
    try {
        const queryId = req.query["id"];
        const token = req.token;
        if ((!queryId || typeof (queryId) !== 'string') && (!token || typeof (token) !== 'string')) {
            res.status(400).json({ error: 'Missing required info: id or token' });
            return;
        }
        let id = 0;
        if (token) {
            const decoded = jwt.verify(token, jwtSecret);
            console.log("Decoded: " + decoded);
            if (typeof (decoded) === 'string') {
                id = await accDb.getIdFromUsername(decoded) ?? 0;
            }
        }
        else if (queryId) {
            id = Number(queryId);
        }
        if (typeof (id) !== 'number') {
            res.status(400).json({ error: 'Invalid ID format' });
            return;
        }
        if (isNaN(id) || id <= 0) {
            res.status(400).json({ error: 'Invalid ID format' });
            return;
        }
        const account = await accDb.getAccountFromID(id);
        if (!account) {
            res.status(404).json({ error: 'Account not found' });
            return;
        }
        const loans = [];
        const loaned = [];
        for (const loanId of account.loans) {
            if (typeof (loanId) !== 'number')
                continue;
            const loan = await loansDb.getLoanFromId(loanId);
            if (loan) {
                loans.push(loan);
            }
        }
        for (const loanId of account.loaned) {
            if (typeof (loanId) !== 'number')
                continue;
            const loan = await loansDb.getLoanFromId(loanId);
            if (loan) {
                loaned.push(loan);
            }
        }
        res.status(200).json({
            loans, loaned
        });
    }
    catch (error) {
        console.error('Error fetching loans:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
export default router;
