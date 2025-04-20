import express, { Request, Response, Router } from 'express';
import jwt from 'jsonwebtoken';
import { notifsDb } from '../../app.js'; // Corrected: notifDb -> notifsDb
import { NewNotification } from '../../database/Database.js';

const router: Router = express.Router();

router.post('/', async (req: Request, res: Response) => {
    try {
        const { accountId, type, message } = req.query;

        if (!accountId || !type || !message) {
            res.status(400).json({ 
                error: 'Missing required parameters',
                required: ['accountId', 'type', 'message']
            });
            return;
        }

        const targetAccountId = Number(accountId);
        if (isNaN(targetAccountId)) {
            res.status(400).json({ error: 'Invalid accountId format. Must be a number.'});
            return;
        }

        const notificationType = String(type);
        if (!['approval', 'message', 'system'].includes(notificationType)) {
            res.status(400).json({ error: 'Invalid notification type. Must be one of: approval, message, system' });
            return;
        }

        const notificationMessage = String(message);
        if (notificationMessage.length === 0 || notificationMessage.length > 500) {
            res.status(400).json({ error: 'Invalid message length. Must be between 1 and 500 characters.'});
            return;
        }

        const newNotification: NewNotification = {
            accountId: targetAccountId,
            type: notificationType as 'approval' | 'message' | 'system', // Type assertion after validation
            message: notificationMessage,
        };

        const notificationId = await notifsDb.createNotification(newNotification);

        res.status(201).json({
            message: 'Notification created successfully',
            notificationId: notificationId
        });

    } catch (error) {
        console.error('Error creating notification:', error);
        
        if (error instanceof jwt.JsonWebTokenError) {
            res.status(401).json({ error: 'Invalid token' });
        }

        // Handle potential errors from createNotification (e.g., database errors)
        else if (error instanceof Error) {
            res.status(500).json({ error: `Internal server error: ${error.message}` });
        }
        else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});

export default router;
