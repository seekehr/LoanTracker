import express from 'express';
import jwt from 'jsonwebtoken';
import { accDb, jwtSecret } from '../app.js';
const router = express.Router();
router.get('/', async (req, res) => {
    const token = req.token;
    console.log("Token: " + token);
    if (!token) {
        res.status(401).json({ error: 'No token provided' });
        return;
    }
    try {
        const decoded = jwt.verify(token, jwtSecret);
        if (typeof decoded !== 'string') {
            res.status(401).json({ error: 'Invalid token' });
            return;
        }
        const account = await accDb.getAccountFromUsername(decoded);
        if (!account) {
            res.status(404).json({ error: 'Account not found' });
            return;
        }
        res.json(account);
    }
    catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            res.status(401).json({ error: 'Invalid token' });
            return;
        }
        console.error('Profile route error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
export default router;
