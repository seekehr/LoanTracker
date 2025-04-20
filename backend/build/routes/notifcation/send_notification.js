import express from 'express';
import jwt from 'jsonwebtoken';
import { accDb, notifsDb } from '../../app.js'; // Corrected: notifDb -> notifsDb
const router = express.Router();
router.post('/', async (req, res) => {
    try {
        console.log("send notification called!");
        const { username, type, message } = req.query;
        if (!username || !type || !message || typeof username !== 'string' || typeof type !== 'string' || typeof message !== 'string') {
            res.status(400).json({
                error: 'Missing required parameters',
                required: ['username', 'type', 'message']
            });
            return;
        }
        const targetAccountId = await accDb.getIdFromUsername(username);
        if (targetAccountId === undefined) {
            res.status(400).json({ error: 'Invalid accountId format. Must be a number.' });
            return;
        }
        const notificationType = String(type);
        if (!['approval', 'message', 'system'].includes(notificationType)) {
            res.status(400).json({ error: 'Invalid notification type. Must be one of: approval, message, system' });
            return;
        }
        const notificationMessage = String(message);
        if (notificationMessage.length === 0 || notificationMessage.length > 500) {
            res.status(400).json({ error: 'Invalid message length. Must be between 1 and 500 characters.' });
            return;
        }
        const newNotification = {
            accountId: targetAccountId,
            type: notificationType, // Type assertion after validation
            message: notificationMessage,
        };
        const notificationId = await notifsDb.createNotification(newNotification);
        console.log("notification created successfully!");
        res.status(201).json({
            message: 'Notification created successfully',
            notificationId: notificationId
        });
    }
    catch (error) {
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
