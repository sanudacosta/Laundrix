import express from 'express';
import {
  getNotifications,
  markNotificationAsRead,
  markAllAsRead,
  deleteNotification,
  sendBulkNotification
} from '../controllers/notificationController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// User routes
router.get('/', authenticate, getNotifications);
router.put('/:id/read', authenticate, markNotificationAsRead);
router.put('/mark-all-read', authenticate, markAllAsRead);
router.delete('/:id', authenticate, deleteNotification);

// Admin routes
router.post('/bulk', authenticate, authorize('admin'), sendBulkNotification);

export default router;
