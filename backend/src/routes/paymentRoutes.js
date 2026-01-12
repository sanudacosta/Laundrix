import express from 'express';
import {
  createPayment,
  getMyPayments,
  getAllPayments,
  getPaymentById,
  createRefund
} from '../controllers/paymentController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Customer routes
router.post('/', authenticate, createPayment);
router.get('/my-payments', authenticate, authorize('customer'), getMyPayments);
router.get('/:id', authenticate, getPaymentById);

// Admin routes
router.get('/', authenticate, authorize('admin'), getAllPayments);
router.post('/:id/refund', authenticate, authorize('admin'), createRefund);

export default router;
