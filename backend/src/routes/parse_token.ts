import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { accDb, jwtSecret } from '../app.js';

const router = express.Router();

router.post('/', async (req: Request, res: Response) => {
    const token = req.token;
    const asId = req.query.as_id === 'true';

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

        // If as_id=true, convert username to ID and return it
        if (asId) {
            try {
                const userId = await accDb.getIdFromUsername(decoded);
                if (userId === undefined) {
                    res.status(404).json({ error: 'User not found' });
                    return;
                }
                res.status(200).json({ id: userId });
            } catch (error) {
                console.error('Error getting user ID:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        } else {
            // Otherwise return username as before
            res.status(200).json({ username: decoded });
        }
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            res.status(401).json({ error: 'Invalid token' });
            return;
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
