import express from 'express';
import { connectGmail, gmailCallback, syncTransactions } from '../controllers/gmailController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/connect', protect, connectGmail);
router.get('/callback', gmailCallback);
router.post('/sync', protect, syncTransactions);

export default router;
