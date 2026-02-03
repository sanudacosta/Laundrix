import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  getAllSuits,
  getSuitById,
  getAvailableSizes,
  addToCart,
  getCart,
  removeFromCart,
  clearCart,
  checkout,
  createRental,
  getAllRentals,
  getMyRentals,
  getCategories,
  updateRentalStatus
} from '../controllers/rentalController.js';

const router = express.Router();

// Public routes (available to all authenticated users)
router.get('/suits', getAllSuits);
router.get('/categories', getCategories);

// Specific routes must come before parameterized routes
router.get('/suits/:productId/sizes', authenticate, getAvailableSizes);
router.get('/suits/:id', getSuitById);

// Cart routes (customer only)
router.post('/cart', authenticate, authorize('customer'), addToCart);
router.get('/cart', authenticate, authorize('customer'), getCart);
router.delete('/cart/:id', authenticate, authorize('customer'), removeFromCart);
router.delete('/cart', authenticate, authorize('customer'), clearCart);
router.post('/cart/checkout', authenticate, authorize('customer'), checkout);

// Rental routes (customer only)
router.post('/rentals', authenticate, authorize('customer'), createRental);
router.get('/my-rentals', authenticate, authorize('customer'), getMyRentals);

// Admin routes
router.get('/rentals', authenticate, authorize('admin', 'employee'), getAllRentals);
router.put('/rentals/:id/status', authenticate, authorize('admin', 'employee'), updateRentalStatus);

export default router;
