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
        const loanedIds = [];
        const loanIds = [];
        async function loadLoaned() {
            const loaneds = await accDb.getLoanedFromAccountId(id);
            if (typeof (loaneds) === "object" && "loaned" in loaneds) {
                const loaned = loaneds.loaned;
                if (typeof (loaned) === "object" && loaned !== null && "loaned" in loaned && Array.isArray(loaned.loaned)) {
                    loanedIds.push(...loaned.loaned);
                }
            }
            if (loanedIds.length < 1) {
                return false;
            }
            return true;
        }
        async function loadLoans() {
            const loans = await accDb.getLoansFromAccountId(id);
            if (typeof (loans) === "object" && "loans" in loans) {
                const loan = loans.loans;
                if (typeof (loan) === "object" && loan !== null && "loans" in loan && Array.isArray(loan.loans)) {
                    loanIds.push(...loan.loans);
                }
            }
            if (loanIds.length < 1) {
                return false;
            }
            return true;
        }
        const successful = await Promise.all([loadLoaned(), loadLoans()]);
        if (!successful[0] || !successful[1]) {
            res.status(404).json({ error: 'Loans not found' });
            return;
        }
        const promises = [];
        const loanedLoans = [];
        const loanLoans = [];
        const couldNotLoad = [];
        if (loanedIds.length > 0) {
            for (const loanedId of loanedIds) {
                promises.push(loansDb.getLoanFromId(loanedId).then((loan) => {
                    if (loan instanceof Error) {
                        return null;
                    }
                    return { loaned: loan };
                }));
            }
        }
        if (loanIds.length > 0) {
            for (const loanId of loanIds) {
                promises.push(loansDb.getLoanFromId(loanId).then((loan) => {
                    if (loan instanceof Error) {
                        return null;
                    }
                    return { loan: loan };
                }));
            }
        }
        const info = await Promise.all(promises);
        for (const loan of info) {
            if (loan !== null) {
                if ("loaned" in loan) {
                    loanedLoans.push(loan.loaned);
                }
                else if ("loan" in loan) {
                    loanLoans.push(loan.loan);
                }
            }
            else {
                couldNotLoad.push(null);
            }
        }
        res.status(200).json({
            loaned: loanedLoans,
            loans: loanLoans,
            couldNotLoad: couldNotLoad
        });
    }
    catch (error) {
        console.error('Error fetching loans:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
export default router;
