import express, { Request, Response } from 'express';
import { loansDb } from '../../app.js';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
    try {
        const loanId = req.query.loanId;
        
        if (!loanId || typeof loanId !== 'string') {
            res.status(400).json({ error: 'Missing required parameter: loanId' });
            return;
        }
        
        const id = Number(loanId);
        
        if (isNaN(id) || id <= 0) {
            res.status(400).json({ error: 'Invalid loanId format' });
            return;
        }
        
        const loan = await loansDb.getLoanFromId(id);
        
        if (loan instanceof Error) {
            res.status(404).json({ error: 'Loan not found' });
            return;
        }
        
        res.status(200).json({ loan });
        
    } catch (error) {
        console.error('Error fetching loan:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
