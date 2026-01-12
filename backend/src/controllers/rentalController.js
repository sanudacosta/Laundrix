import db from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { sendRentalNotification } from '../services/notificationService.js';

// Get all suits (available for rental)
export const getAllSuits = async (req, res, next) => {
  try {
    const { category_id, size, is_available, min_price, max_price } = req.query;
    
    let query = `
      SELECT s.*, sc.name as category_name, sc.description as category_description
      FROM suits s
      JOIN suit_categories sc ON s.category_id = sc.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (category_id) {
      query += ' AND s.category_id = ?';
      params.push(category_id);
    }
    
    if (size) {
      query += ' AND s.size = ?';
      params.push(size);
    }
    
    if (is_available !== undefined) {
      query += ' AND s.is_available = ?';
      params.push(is_available === 'true');
    }
    
    if (min_price) {
      query += ' AND s.rental_price_per_day >= ?';
      params.push(min_price);
    }
    
    if (max_price) {
      query += ' AND s.rental_price_per_day <= ?';
      params.push(max_price);
    }
    
    query += ' ORDER BY s.created_at DESC';
    
    const [suits] = await db.query(query, params);
    
    res.json({
      success: true,
      count: suits.length,
      data: suits
    });
  } catch (error) {
    next(error);
  }
};

// Get suit by ID
export const getSuitById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const [suits] = await db.query(
      `SELECT s.*, sc.name as category_name, sc.description as category_description
       FROM suits s
       JOIN suit_categories sc ON s.category_id = sc.id
       WHERE s.id = ?`,
      [id]
    );
    
    if (suits.length === 0) {
      throw new AppError('Suit not found', 404);
    }
    
    res.json({
      success: true,
      data: suits[0]
    });
  } catch (error) {
    next(error);
  }
};

// Create suit rental
export const createRental = async (req, res, next) => {
  try {
    const customerId = req.user.userId;
    const { suit_id, rental_start_date, rental_end_date, notes } = req.body;
    
    // Check if suit exists and is available
    const [suits] = await db.query(
      'SELECT * FROM suits WHERE id = ? AND is_available = TRUE',
      [suit_id]
    );
    
    if (suits.length === 0) {
      throw new AppError('Suit not available', 400);
    }
    
    const suit = suits[0];
    
    // Calculate rental days and amount
    const startDate = new Date(rental_start_date);
    const endDate = new Date(rental_end_date);
    const rentalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    
    if (rentalDays < 1) {
      throw new AppError('Invalid rental period', 400);
    }
    
    const rentalAmount = suit.rental_price_per_day * rentalDays;
    const depositAmount = suit.deposit_amount;
    const totalAmount = rentalAmount + depositAmount;
    
    // Generate rental number
    const rentalNumber = `SR-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    
    // Create rental
    const [result] = await db.query(
      `INSERT INTO suit_rentals 
       (rental_number, customer_id, suit_id, rental_start_date, rental_end_date, 
        rental_days, rental_amount, deposit_amount, total_amount, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [rentalNumber, customerId, suit_id, rental_start_date, rental_end_date,
       rentalDays, rentalAmount, depositAmount, totalAmount, notes]
    );
    
    const rentalId = result.insertId;
    
    // Mark suit as unavailable
    await db.query('UPDATE suits SET is_available = FALSE WHERE id = ?', [suit_id]);
    
    // Add to history
    await db.query(
      'INSERT INTO rental_status_history (rental_id, status, changed_by, notes) VALUES (?, ?, ?, ?)',
      [rentalId, 'reserved', customerId, 'Rental booked']
    );
    
    // Send notification
    await sendRentalNotification(rentalId, 'reserved', customerId);
    
    res.status(201).json({
      success: true,
      message: 'Rental created successfully',
      data: {
        rentalId,
        rentalNumber,
        totalAmount,
        rentalDays
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get customer's rentals
export const getMyRentals = async (req, res, next) => {
  try {
    const customerId = req.user.userId;
    
    const [rentals] = await db.query(
      `SELECT sr.*, s.name as suit_name, s.suit_code, s.size, s.color,
              sc.name as category_name, e.full_name as employee_name
       FROM suit_rentals sr
       JOIN suits s ON sr.suit_id = s.id
       JOIN suit_categories sc ON s.category_id = sc.id
       LEFT JOIN users e ON sr.assigned_employee_id = e.id
       WHERE sr.customer_id = ?
       ORDER BY sr.created_at DESC`,
      [customerId]
    );
    
    res.json({
      success: true,
      count: rentals.length,
      data: rentals
    });
  } catch (error) {
    next(error);
  }
};

// Get all rentals (admin/employee)
export const getAllRentals = async (req, res, next) => {
  try {
    const { status, customer_id, suit_id } = req.query;
    
    let query = `
      SELECT sr.*, u.full_name as customer_name, u.email as customer_email, u.phone as customer_phone,
             s.name as suit_name, s.suit_code, s.size, s.color,
             sc.name as category_name, e.full_name as employee_name
      FROM suit_rentals sr
      JOIN users u ON sr.customer_id = u.id
      JOIN suits s ON sr.suit_id = s.id
      JOIN suit_categories sc ON s.category_id = sc.id
      LEFT JOIN users e ON sr.assigned_employee_id = e.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (status) {
      query += ' AND sr.rental_status = ?';
      params.push(status);
    }
    
    if (customer_id) {
      query += ' AND sr.customer_id = ?';
      params.push(customer_id);
    }
    
    if (suit_id) {
      query += ' AND sr.suit_id = ?';
      params.push(suit_id);
    }
    
    query += ' ORDER BY sr.created_at DESC';
    
    const [rentals] = await db.query(query, params);
    
    res.json({
      success: true,
      count: rentals.length,
      data: rentals
    });
  } catch (error) {
    next(error);
  }
};

// Get rental by ID
export const getRentalById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;
    
    const [rentals] = await db.query(
      `SELECT sr.*, u.full_name as customer_name, u.email as customer_email, u.phone as customer_phone,
              s.name as suit_name, s.suit_code, s.size, s.color, s.brand,
              sc.name as category_name, e.full_name as employee_name
       FROM suit_rentals sr
       JOIN users u ON sr.customer_id = u.id
       JOIN suits s ON sr.suit_id = s.id
       JOIN suit_categories sc ON s.category_id = sc.id
       LEFT JOIN users e ON sr.assigned_employee_id = e.id
       WHERE sr.id = ?`,
      [id]
    );
    
    if (rentals.length === 0) {
      throw new AppError('Rental not found', 404);
    }
    
    const rental = rentals[0];
    
    // Check authorization
    if (userRole === 'customer' && rental.customer_id !== userId) {
      throw new AppError('Unauthorized access', 403);
    }
    
    // Get rental history
    const [history] = await db.query(
      `SELECT rsh.*, u.full_name as changed_by_name
       FROM rental_status_history rsh
       JOIN users u ON rsh.changed_by = u.id
       WHERE rsh.rental_id = ?
       ORDER BY rsh.created_at DESC`,
      [id]
    );
    
    rental.history = history;
    
    res.json({
      success: true,
      data: rental
    });
  } catch (error) {
    next(error);
  }
};

// Update rental status (employee/admin)
export const updateRentalStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, return_condition, damage_fee, late_fee, notes } = req.body;
    const userId = req.user.userId;
    
    // Get rental details
    const [rentals] = await db.query(
      'SELECT customer_id, suit_id, rental_status, deposit_amount FROM suit_rentals WHERE id = ?',
      [id]
    );
    
    if (rentals.length === 0) {
      throw new AppError('Rental not found', 404);
    }
    
    const rental = rentals[0];
    
    // Update rental
    let updateQuery = 'UPDATE suit_rentals SET rental_status = ?';
    const updateParams = [status];
    
    if (status === 'returned') {
      updateQuery += ', actual_return_date = NOW(), return_condition = ?';
      updateParams.push(return_condition || 'good');
      
      if (damage_fee) {
        updateQuery += ', damage_fee = ?';
        updateParams.push(damage_fee);
      }
      
      if (late_fee) {
        updateQuery += ', late_fee = ?';
        updateParams.push(late_fee);
      }
      
      // Make suit available again
      await db.query('UPDATE suits SET is_available = TRUE, last_rented_date = NOW(), total_rentals = total_rentals + 1 WHERE id = ?', [rental.suit_id]);
      
      // Calculate deposit refund
      const depositRefund = rental.deposit_amount - (damage_fee || 0) - (late_fee || 0);
      updateQuery += ', deposit_refunded = ?';
      updateParams.push(depositRefund);
    }
    
    updateQuery += ' WHERE id = ?';
    updateParams.push(id);
    
    await db.query(updateQuery, updateParams);
    
    // Add to history
    await db.query(
      'INSERT INTO rental_status_history (rental_id, status, changed_by, notes) VALUES (?, ?, ?, ?)',
      [id, status, userId, notes || `Status changed to ${status}`]
    );
    
    // Send notification
    await sendRentalNotification(id, status, rental.customer_id);
    
    res.json({
      success: true,
      message: 'Rental status updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get suit categories
export const getCategories = async (req, res, next) => {
  try {
    const [categories] = await db.query(
      'SELECT * FROM suit_categories WHERE is_active = TRUE ORDER BY name'
    );
    
    res.json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getAllSuits,
  getSuitById,
  createRental,
  getMyRentals,
  getAllRentals,
  getRentalById,
  updateRentalStatus,
  getCategories
};
