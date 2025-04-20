import express from 'express';
import jwt from 'jsonwebtoken';
import { jwtSecret } from '../app.js';
const router = express.Router();
router.post('/', (req, res) => {
    const token = req.token;
    if (!token) {
        res.status(401).json({ error: 'No token provided' });
        return;
    }
    try {
        const decoded = jwt.verify(token, jwtSecret);
        if (typeof decoded !== 'string') {
            console.log(decoded);
            res.status(401).json({ error: 'Invalid token' });
            return;
        }
        res.status(200).json({ username: decoded });
    }
    catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            res.status(401).json({ error: 'Invalid token' });
            return;
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});
export default router;
