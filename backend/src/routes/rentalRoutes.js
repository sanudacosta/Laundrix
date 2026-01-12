import express from 'express';
import {
  getAllSuits,
  getSuitById,
  createRental,
  getMyRentals,
  getAllRentals,
  getRentalById,
  updateRentalStatus,
  getCategories
} from '../controllers/rentalController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateSuitRental, validate } from '../middleware/validators.js';

const router = express.Router();

// Public/Customer routes
router.get('/suits', getAllSuits);
router.get('/suits/:id', getSuitById);
router.get('/categories', getCategories);

// Customer routes
router.post('/rentals', authenticate, authorize('customer'), validateSuitRental, validate, createRental);
router.get('/my-rentals', authenticate, authorize('customer'), getMyRentals);

// Admin/Employee routes
router.get('/rentals', authenticate, authorize('admin', 'employee'), getAllRentals);
router.get('/rentals/:id', authenticate, getRentalById);
router.put('/rentals/:id/status', authenticate, authorize('admin', 'employee'), updateRentalStatus);

export default router;
