import express, { Router } from 'express';
import jwt from 'jsonwebtoken';
import { accDb, jwtSecret } from '../../app.js'; // Assuming index.js exports these
import SecurityGuard from '../../database/SecurityGuard.js'; // Adjusted path based on register.ts
import { INVALID_IP } from '../middleware/add_ip.js';

const router: Router = express.Router();

router.post('/', async (req: express.Request, res: express.Response) => {
    const username: string = typeof(req.headers["username"]) === "string" ? req.headers["username"] as string : "";
    const password: string = typeof(req.headers["password"]) === "string" ? req.headers["password"] as string : "";
    let ip = req.verifiedIp;

    // --- Header Validation ---
    const errors: string[] = [];
    if (!username) errors.push('Missing/invalid header: username');
    if (!password) errors.push('Missing/invalid header: password');

    // --- Input Format Validation ---
    if (username && !SecurityGuard.verifyName(username)) {
        errors.push("Invalid username format (<= 30 characters, only a-z, 0-9, no spaces)");
    }
    if (password && !SecurityGuard.verifyPassword(password)) {
        errors.push("Invalid password format (8-30 characters, one number, one special character, one letter minimum)");
    }

    if (ip === undefined || ip === INVALID_IP) errors.push('Could not determine IP address.');

    if (errors.length > 0) {
        res.status(400).json({ error: 'Bad Request', details: errors });
        return;
    }

    ip = ip as string;

    try {
        const account = await accDb.getAccountFromUsername(username);

        if (account === undefined) {
            res.status(401).json({ error: 'Unauthorized', details: 'Invalid username or password. Account not found.' });
            return;
        }

        const newHash = await SecurityGuard.getHash(password, account.salt);
    
        if (newHash !== account.password) {
            res.status(401).json({ error: 'Unauthorized', details: 'Invalid username or password.' });
            return;
        }


        const token = jwt.sign(account.username, jwtSecret);

        res.status(200).json({ message: 'Login successful', token: token });

    } catch (error) {
        console.error('Error during login:', error);
        // Log the detailed error but return a generic message to the client
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        res.status(500).json({ error: 'Internal Server Error', details: `Login failed due to a server error.` });
    }
});

export default router;