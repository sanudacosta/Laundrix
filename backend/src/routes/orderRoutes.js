import express from 'express';
import {
  getAllOrders,
  getMyOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  assignOrder,
  getAssignedOrders,
  deleteOrder
} from '../controllers/orderController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateLaundryOrder, validate } from '../middleware/validators.js';

const router = express.Router();

// Customer routes
router.get('/my-orders', authenticate, authorize('customer'), getMyOrders);
router.post('/', authenticate, authorize('customer'), validateLaundryOrder, validate, createOrder);

// Employee routes
router.get('/assigned', authenticate, authorize('employee', 'admin'), getAssignedOrders);

// Admin/Employee routes
router.get('/', authenticate, authorize('admin', 'employee'), getAllOrders);
router.get('/:id', authenticate, getOrderById);
router.put('/:id/status', authenticate, authorize('admin', 'employee'), updateOrderStatus);
router.put('/:id/assign', authenticate, authorize('admin'), assignOrder);
router.delete('/:id', authenticate, authorize('admin'), deleteOrder);

export default router;
