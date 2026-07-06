import express from 'express';
import { getGoogleUrl, googleCallback, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/google', getGoogleUrl);
router.get('/google/callback', googleCallback);
router.get('/me', protect, getMe);

export default router;
