import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { accDb, jwtSecret } from '../../app.js';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
    const token = req.token;
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

        let username = decoded;
        if (req.query["username"] && typeof(req.query["username"]) === 'string') {
            username = req.query["username"];
        } else if (req.query["id"] && typeof(req.query["id"]) === 'string') {
            const id = Number(req.query["id"]);
            if (isNaN(id) || id <= 0) {
                res.status(400).json({ error: 'Invalid ID format' });
                return;
            }
            const usernameFromId = await accDb.getUsernameFromID(id);
            if (usernameFromId) {
                username = usernameFromId;
            } else {
                res.status(404).json({ error: 'User not found' });
                return;
            }
        }
        
        const account = await accDb.getAccountFromUsername(username);

        if (!account) {
            res.status(404).json({ error: 'Account not found' });
            return;
        }

        res.json(account);
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            res.status(401).json({ error: 'Invalid token' });
            return;
        }
        console.error('Profile route error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;