import express from 'express';
import {
  getDashboardStats,
  getCustomerDashboardStats,
  getRevenueReport,
  getInventoryReport,
  getOrderStatistics,
  getRentalStatistics
} from '../controllers/reportController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Customer dashboard (authenticated only)
router.get('/dashboard', authenticate, getCustomerDashboardStats);

// Admin-only routes
router.get('/admin/dashboard', authenticate, authorize('admin'), getDashboardStats);
router.get('/revenue', authenticate, authorize('admin'), getRevenueReport);
router.get('/inventory', authenticate, authorize('admin'), getInventoryReport);
router.get('/orders', authenticate, authorize('admin'), getOrderStatistics);
router.get('/rentals', authenticate, authorize('admin'), getRentalStatistics);

export default router;
