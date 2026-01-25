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

// Admin routes - must come before /:id route
router.get('/', authenticate, authorize('admin'), getAllPayments);
router.post('/:id/refund', authenticate, authorize('admin'), createRefund);

// Shared routes - parameterized routes must come last
router.get('/:id', authenticate, getPaymentById);

export default router;
