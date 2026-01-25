import express from 'express';
import { authenticate } from '../middleware/auth.js';
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
  getMyRentals,
  getCategories
} from '../controllers/rentalController_v2.js';

const router = express.Router();

// Public routes (customers can access)
router.get('/suits', authenticate, getAllSuits);
router.get('/suits/:id', authenticate, getSuitById);
router.get('/suits/:productId/sizes', authenticate, getAvailableSizes);
router.get('/categories', authenticate, getCategories);

// Cart routes
router.post('/cart', authenticate, addToCart);
router.get('/cart', authenticate, getCart);
router.delete('/cart/:id', authenticate, removeFromCart);
router.delete('/cart', authenticate, clearCart);
router.post('/cart/checkout', authenticate, checkout);

// Rental routes
router.post('/rentals', authenticate, createRental);
router.get('/my-rentals', authenticate, getMyRentals);

export default router;
