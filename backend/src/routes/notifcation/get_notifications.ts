import express, { Router } from 'express';
import jwt from 'jsonwebtoken'; // Import JwtPayload
import { inspect } from 'util';
import { accDb, jwtSecret, notifsDb } from '../../app.js';
// Removed DecodedToken import as we will decode here

const router: Router = express.Router();

router.get('/', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        console.log("get notifications called!");
        if (!req.token) {
            console.error('Authentication error: Token string missing from request');
            res.status(401).json({ error: 'Authentication required.' });
            return;
        }

        let username: string;
        try {
            const jwtPayload = jwt.verify(req.token, jwtSecret);
            if (typeof jwtPayload === 'string') {
                username = jwtPayload;
            } else {
                throw new Error('Invalid token payload.');
            }
        } catch (verifyError) {
            console.error('Token verification failed:', verifyError);
            if (verifyError instanceof jwt.JsonWebTokenError) {
                res.status(401).json({ error: 'Invalid or expired token.' });
                return;
            }
            console.error('Unexpected token verification error:', verifyError);
            res.status(500).json({ error: 'Internal server error during token verification.' });
            return;
        }

        const accountId = await accDb.getIdFromUsername(username);

        if (accountId === undefined) {
            console.error(`Account ID not found for username: ${username}`);
            res.status(404).json({ error: 'User account not found.' });
            return;
        }

        console.log("accountId: ", accountId);
        const notifications = await notifsDb.getNotificationsForAccount(accountId);

        console.log("notifications successful!");
        console.log(inspect(notifications));
        res.status(200).json(notifications);

    } catch (error) {
        console.error('Error fetching notifications:', error);

        if (!res.headersSent) {
            res.status(500).json({ error: 'An internal server error occurred while fetching notifications.' });
        }
    }
});

export default router;
