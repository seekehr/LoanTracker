import express from 'express';
import jwt from 'jsonwebtoken';
import { accDb, jwtSecret, loansDb } from '../../app.js';
import currencies from '../../util/currencies.js';
import { translateCurrency } from '../../util/currency_translator.js';
const router = express.Router();
router.post('/', async (req, res) => {
    const token = req.token;
    if (!token) {
        res.status(401).json({ error: 'No token provided' });
        return;
    }
    try {
        // Validate required query parameters
        const { loanerUsername, loanedUsername, amount, currency, timeExpires } = req.query;
        if (!loanerUsername || !loanedUsername || !amount || !currency || !timeExpires) {
            res.status(400).json({
                error: 'Missing required parameters',
                required: ['loanerUsername', 'loanedId', 'amount', 'currency', 'timeExpires']
            });
            return;
        }
        const expiryTime = BigInt(String(timeExpires));
        if (expiryTime < 1) {
            res.status(400).json({ error: 'Invalid expiry time format' });
            return;
        }
        const decoded = jwt.verify(token, jwtSecret);
        if (typeof decoded !== 'string') {
            res.status(401).json({ error: 'Invalid token' });
            return;
        }
        let isLoaning = false;
        if (decoded === loanerUsername) {
            isLoaning = true;
        }
        let loanerId;
        let loanedId;
        if (isLoaning) {
            loanerId = await accDb.getIdFromUsername(String(decoded));
            loanedId = await accDb.getIdFromUsername(String(loanedUsername));
        }
        else {
            loanerId = await accDb.getIdFromUsername(String(loanerUsername));
            loanedId = await accDb.getIdFromUsername(String(decoded));
        }
        if (loanerId === undefined || loanedId === undefined) {
            res.status(400).json({ error: 'Invalid username for loaner or loaned.' });
            return;
        }
        const newLoan = {
            loanerId: Number(loanerId),
            loanedId: Number(loanedId),
            amount: Number(amount),
            currency: String(currency),
            timeExpires: expiryTime
        };
        if (isNaN(newLoan.loanedId) || isNaN(newLoan.amount)) {
            res.status(400).json({ error: 'Invalid numeric parameters' });
            return;
        }
        if (!currencies.includes(newLoan.currency)) {
            res.status(400).json({ error: 'Invalid currency' });
            return;
        }
        const usdAmount = newLoan.currency === "USD" ? newLoan.amount : await translateCurrency(newLoan.amount, newLoan.currency, "USD");
        //console.log("Currency: " + newLoan.currency + " to USD: " + usdAmount);
        if (usdAmount <= 1) {
            res.status(400).json({ error: 'Amount must be over 1 USD.' });
            return;
        }
        // Validate timeExpires is in the future
        if (newLoan.timeExpires <= BigInt(Date.now())) {
            res.status(400).json({ error: 'Expiry time must be in the future' });
            return;
        }
        const loanId = await loansDb.createLoan(newLoan, loanerId);
        res.status(201).json({
            message: 'Loan created successfully',
            loanId: loanId
        });
    }
    catch (error) {
        console.error('Error creating loan:', error);
        if (error instanceof jwt.JsonWebTokenError) {
            res.status(401).json({ error: 'Invalid token' });
            return;
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});
export default router;
