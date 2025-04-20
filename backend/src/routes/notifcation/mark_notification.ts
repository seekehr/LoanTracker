import express, { Router } from 'express';
import { notifsDb } from '../../app.js';

const router: Router = express.Router();

router.post('/', async (req: express.Request, res: express.Response) => {
    try {
        // Get notification ID
        const { id } = req.query;
        if (!id || typeof id !== 'string') {
            res.status(400).json({ error: 'Notification ID is required' });
            return;
        }

        const notificationId = parseInt(id, 10);
        if (isNaN(notificationId)) {
            res.status(400).json({ error: 'Invalid notification ID format' });
            return;
        }

        // Get the specific notification by ID
        const targetNotification = await notifsDb.getNotificationById(notificationId);
        
        if (!targetNotification) {
            res.status(404).json({ error: 'Notification not found' });
            return;
        }

        // Mark the notification as read
        const success = await notifsDb.markNotificationAsRead(notificationId);
        
        if (success) {
            res.status(200).json({ message: 'Notification marked as read' });
        } else {
            res.status(500).json({ error: 'Failed to mark notification as read' });
        }

    } catch (error) {
        console.error('Error marking notification as read:', error);
        
        if (!res.headersSent) {
            res.status(500).json({ error: 'An internal server error occurred.' });
        }
    }
});

export default router;
