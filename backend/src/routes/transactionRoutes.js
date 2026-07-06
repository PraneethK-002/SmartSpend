import express from 'express';
import { 
  getTransactions, 
  updateTransactionCategory, 
  getDashboardStats, 
  getRecurringPayments, 
  exportTransactionsPDF 
} from '../controllers/transactionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getTransactions);
router.put('/:id/category', protect, updateTransactionCategory);
router.get('/stats', protect, getDashboardStats);
router.get('/recurring', protect, getRecurringPayments);
router.get('/pdf', protect, exportTransactionsPDF);

export default router;
