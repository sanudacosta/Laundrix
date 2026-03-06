import express from 'express';
import {
  getDashboardStats,
  getCustomerDashboardStats,
  getRevenueReport,
  getInventoryReport,
  getOrderStatistics,
  getRentalStatistics,
  exportRevenueCSV,
  exportOrdersCSV,
  exportRentalsCSV,
  exportInventoryCSV
} from '../controllers/reportController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Customer dashboard (authenticated only)
router.get('/dashboard', authenticate, getCustomerDashboardStats);

// Admin-only report routes
router.get('/admin/dashboard', authenticate, authorize('admin'), getDashboardStats);
router.get('/revenue', authenticate, authorize('admin'), getRevenueReport);
router.get('/inventory', authenticate, authorize('admin'), getInventoryReport);
router.get('/orders', authenticate, authorize('admin'), getOrderStatistics);
router.get('/rentals', authenticate, authorize('admin'), getRentalStatistics);

// Export / Download routes
router.get('/export/revenue', authenticate, authorize('admin'), exportRevenueCSV);
router.get('/export/orders', authenticate, authorize('admin'), exportOrdersCSV);
router.get('/export/rentals', authenticate, authorize('admin'), exportRentalsCSV);
router.get('/export/inventory', authenticate, authorize('admin'), exportInventoryCSV);

export default router;
