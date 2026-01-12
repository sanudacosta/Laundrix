import express from 'express';
import {
  getDashboardStats,
  getRevenueReport,
  getInventoryReport,
  getOrderStatistics,
  getRentalStatistics
} from '../controllers/reportController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require admin authorization
router.use(authenticate, authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/revenue', getRevenueReport);
router.get('/inventory', getInventoryReport);
router.get('/orders', getOrderStatistics);
router.get('/rentals', getRentalStatistics);

export default router;
