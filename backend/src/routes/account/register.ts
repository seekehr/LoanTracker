import crypto from "crypto";
import express, { Router } from 'express';
import jwt from 'jsonwebtoken';
import { accDb, jwtSecret } from '../../app.js'; // Import the initialized instance
import { NewAccount } from '../../database/Database.js';
import SecurityGuard from '../../database/SecurityGuard.js';
import { INVALID_IP } from '../middleware/add_ip.js';

const router: Router = express.Router();

router.post('/', async (req: express.Request, res: express.Response) => {
    const username: string = typeof req.headers["username"] === "string" ? req.headers["username"] as string : "Invalid.";
    const password: string = typeof req.headers["password"] === "string" ? req.headers["password"] as string : "Invalid.";
    const displayName: string = typeof req.headers["displayname"] === "string" ? req.headers["displayname"] as string : "Invalid.";
    const country: string = typeof req.headers["country"] === "string" ? req.headers["country"] as string : "Invalid.";

    let ip = req.verifiedIp;
    const errors: string[] = [];
    if (!username || username === "Invalid." || !SecurityGuard.verifyName(username)) errors.push('Missing/invalid header: username');
    if (!password || password === "Invalid." || !SecurityGuard.verifyPassword(password)) errors.push('Missing header/invalid: password');
    if (!displayName || displayName === "Invalid." || !SecurityGuard.verifyDisplayName(displayName)) errors.push('Missing header/invalid: displayname');
    if (!country || country === "Invalid." || country.length > 2) errors.push('Missing header/invalid: country');
    if (ip === undefined || ip === INVALID_IP) errors.push('Could not determine IP address.');

    if (errors.length > 0) {
        res.status(400).json({ error: 'Bad Request', details: errors });
        return;
    } else {
        ip = ip as string;
        const verifiedCountry = ip === "::1" ? "PK" : SecurityGuard.getCountryFromIp(ip);
        if (verifiedCountry === 'Unknown') {
            res.status(401).json({error: "Invalid IP! Country could not be detected."});
            return;
        } else {
            if (country !== verifiedCountry) {
                res.status(401).json({error: `Your entered country ${country} does not match ${verifiedCountry} based on your IP!`});
                return;
            }
        }
    }

    try {
        // --- Check if username already exists ---
        const usernameExists = await accDb.checkUsername(username);
        if (usernameExists) {
            res.status(409).json({ error: 'Conflict', details: 'Username already exists' });
            return;
        }

        console.log("New: " + req.cookies["not-new"]);
        // Check for existing accounts with the same IP
        const existingAccountsWithIP = await accDb.getAccountsByIP(ip);
        if (existingAccountsWithIP.length > 0) {
            res.status(403).json({ 
                error: 'Forbidden', 
                details: 'Multiple accounts from the same IP address are not allowed' 
            });
            return;
        } 

        const salt = Buffer.from(crypto.randomBytes(64)).toString('base64');
        const hashedPassword = await SecurityGuard.getHash(password, salt);

        const newAccount: NewAccount = {
            username,
            password: hashedPassword, // Store the hashed password
            salt,
            displayName,
            country,
            ip
        };

        await accDb.createAccount(newAccount);
        const token = jwt.sign(newAccount.username, jwtSecret); 

        res.status(201).json({ message: 'Account created successfully', token: token });
    } catch (error) {
        console.error('Error during account creation:', error);
        res.status(500).json({ error: 'Internal Server Error', details: 'Failed to create account due to a server error.' });
    }
});

export default router;