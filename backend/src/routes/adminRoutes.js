import express from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getCleaningTypes,
  updateCleaningType,
  getServiceTimes,
  updateServiceTime,
  createSuit,
  updateSuit,
  deleteSuit,
  getSettings,
  updateSettings
} from '../controllers/adminController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Allow employees to get customer list for POS system
router.get('/users', authenticate, authorize('admin', 'employee'), getAllUsers);

// All other routes require admin authorization
router.use(authenticate, authorize('admin'));

// User management (admin only)
router.get('/users/:id', getUserById);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Cleaning types management
router.get('/cleaning-types', getCleaningTypes);
router.put('/cleaning-types/:id', updateCleaningType);

// Service times management
router.get('/service-times', getServiceTimes);
router.put('/service-times/:id', updateServiceTime);

// Suit inventory management
router.post('/suits', createSuit);
router.put('/suits/:id', updateSuit);
router.delete('/suits/:id', deleteSuit);

// System settings
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

export default router;
