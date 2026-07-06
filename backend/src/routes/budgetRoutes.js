import express from 'express';
import { getBudgets, setBudget } from '../controllers/budgetController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getBudgets);
router.post('/', protect, setBudget);

export default router;
