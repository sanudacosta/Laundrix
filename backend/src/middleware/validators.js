import { body, validationResult } from 'express-validator';

// Validation middleware
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User registration validation
export const validateRegister = [
  body('full_name').trim().notEmpty().withMessage('Full name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('role')
    .optional()
    .isIn(['customer', 'employee', 'admin'])
    .withMessage('Invalid role'),
];

// User login validation
export const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

// Laundry order validation
export const validateLaundryOrder = [
  body('cleaning_type_id').isInt().withMessage('Cleaning type is required'),
  body('service_time_id').isInt().withMessage('Service time is required'),
  body('item_description').trim().notEmpty().withMessage('Item description is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('order_type')
    .isIn(['walk-in', 'online'])
    .withMessage('Invalid order type'),
];

// Suit rental validation
export const validateSuitRental = [
  body('suit_id').isInt().withMessage('Suit ID is required'),
  body('rental_start_date').isDate().withMessage('Valid start date is required'),
  body('rental_end_date').isDate().withMessage('Valid end date is required'),
];
