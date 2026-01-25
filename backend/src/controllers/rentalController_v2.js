import db from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { sendRentalNotification } from '../services/notificationService.js';

// Get all suit products (with available sizes)
export const getAllSuits = async (req, res, next) => {
  try {
    const { category_id, min_price, max_price } = req.query;
    
    let query = `
      SELECT 
        sp.*,
        sc.name as category_name,
        sc.description as category_description,
        GROUP_CONCAT(DISTINCT si.size ORDER BY si.size) as available_sizes,
        COUNT(DISTINCT CASE WHEN si.is_available = TRUE THEN si.size END) as available_size_count
      FROM suit_products sp
      JOIN suit_categories sc ON sp.category_id = sc.id
      LEFT JOIN suit_inventory si ON sp.id = si.product_id
      WHERE sp.is_active = TRUE
    `;
    
    const params = [];
    
    if (category_id) {
      query += ' AND sp.category_id = ?';
      params.push(category_id);
    }
    
    if (min_price) {
      query += ' AND sp.rental_price_per_day >= ?';
      params.push(min_price);
    }
    
    if (max_price) {
      query += ' AND sp.rental_price_per_day <= ?';
      params.push(max_price);
    }
    
    query += ` GROUP BY sp.id
               HAVING available_size_count > 0
               ORDER BY sp.created_at DESC`;
    
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

// Get suit product by ID with size availability
export const getSuitById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const [products] = await db.query(
      `SELECT 
        sp.*,
        sc.name as category_name,
        sc.description as category_description
       FROM suit_products sp
       JOIN suit_categories sc ON sp.category_id = sc.id
       WHERE sp.id = ? AND sp.is_active = TRUE`,
      [id]
    );
    
    if (products.length === 0) {
      throw new AppError('Suit product not found', 404);
    }
    
    // Get available sizes for this product
    const [inventory] = await db.query(
      `SELECT size, suit_code, condition_status, is_available
       FROM suit_inventory
       WHERE product_id = ? AND is_available = TRUE
       ORDER BY size`,
      [id]
    );
    
    const product = products[0];
    product.available_sizes = inventory;
    
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// Get available sizes for a specific product and date range
export const getAvailableSizes = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { start_date, end_date } = req.query;
    
    if (!start_date || !end_date) {
      throw new AppError('Start date and end date are required', 400);
    }
    
    // Get inventory items that are not booked during the requested period
    const [sizes] = await db.query(
      `SELECT si.size, si.suit_code, si.condition_status
       FROM suit_inventory si
       WHERE si.product_id = ? 
       AND si.is_available = TRUE
       AND si.id NOT IN (
         SELECT sr.inventory_id
         FROM suit_rentals sr
         WHERE sr.rental_status IN ('reserved', 'active')
         AND (
           (sr.rental_start_date <= ? AND sr.rental_end_date >= ?)
           OR (sr.rental_start_date <= ? AND sr.rental_end_date >= ?)
           OR (sr.rental_start_date >= ? AND sr.rental_end_date <= ?)
         )
       )
       ORDER BY si.size`,
      [productId, start_date, start_date, end_date, end_date, start_date, end_date]
    );
    
    res.json({
      success: true,
      data: sizes
    });
  } catch (error) {
    next(error);
  }
};

// Add item to cart
export const addToCart = async (req, res, next) => {
  try {
    const customerId = req.user.userId;
    const {
      product_id,
      size,
      rental_start_date,
      rental_end_date,
      occasion,
      delivery_address,
      special_instructions
    } = req.body;
    
    // Validate dates
    const startDate = new Date(rental_start_date);
    const endDate = new Date(rental_end_date);
    const rentalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    
    if (rentalDays <= 0) {
      throw new AppError('Invalid date range', 400);
    }
    
    // Get product details
    const [products] = await db.query(
      'SELECT * FROM suit_products WHERE id = ? AND is_active = TRUE',
      [product_id]
    );
    
    if (products.length === 0) {
      throw new AppError('Product not found', 404);
    }
    
    const product = products[0];
    
    // Check if size is available for the date range
    const [available] = await db.query(
      `SELECT si.id
       FROM suit_inventory si
       WHERE si.product_id = ? AND si.size = ? AND si.is_available = TRUE
       AND si.id NOT IN (
         SELECT sr.inventory_id
         FROM suit_rentals sr
         WHERE sr.rental_status IN ('reserved', 'active')
         AND (
           (sr.rental_start_date <= ? AND sr.rental_end_date >= ?)
           OR (sr.rental_start_date <= ? AND sr.rental_end_date >= ?)
           OR (sr.rental_start_date >= ? AND sr.rental_end_date <= ?)
         )
       )
       LIMIT 1`,
      [product_id, size, rental_start_date, rental_start_date, rental_end_date, rental_end_date, rental_start_date, rental_end_date]
    );
    
    if (available.length === 0) {
      throw new AppError('This size is not available for the selected dates', 400);
    }
    
    // Calculate amounts
    const rentalAmount = product.rental_price_per_day * rentalDays;
    const depositAmount = product.deposit_amount;
    
    // Check if item already in cart
    const [existing] = await db.query(
      'SELECT id FROM rental_cart WHERE customer_id = ? AND product_id = ? AND size = ?',
      [customerId, product_id, size]
    );
    
    if (existing.length > 0) {
      // Update existing cart item
      await db.query(
        `UPDATE rental_cart 
         SET rental_start_date = ?, rental_end_date = ?, rental_days = ?, 
             rental_amount = ?, deposit_amount = ?, occasion = ?, 
             delivery_address = ?, special_instructions = ?, updated_at = NOW()
         WHERE id = ?`,
        [rental_start_date, rental_end_date, rentalDays, rentalAmount, depositAmount,
         occasion, delivery_address, special_instructions, existing[0].id]
      );
    } else {
      // Insert new cart item
      await db.query(
        `INSERT INTO rental_cart 
         (customer_id, product_id, size, rental_start_date, rental_end_date, rental_days,
          rental_amount, deposit_amount, occasion, delivery_address, special_instructions)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [customerId, product_id, size, rental_start_date, rental_end_date, rentalDays,
         rentalAmount, depositAmount, occasion, delivery_address, special_instructions]
      );
    }
    
    res.status(201).json({
      success: true,
      message: 'Item added to cart successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get cart items
export const getCart = async (req, res, next) => {
  try {
    const customerId = req.user.userId;
    
    const [cartItems] = await db.query(
      `SELECT 
        rc.*,
        sp.name, sp.brand, sp.color, sp.image_url,
        sc.name as category_name
       FROM rental_cart rc
       JOIN suit_products sp ON rc.product_id = sp.id
       JOIN suit_categories sc ON sp.category_id = sc.id
       WHERE rc.customer_id = ?
       ORDER BY rc.created_at DESC`,
      [customerId]
    );
    
    const totalAmount = cartItems.reduce((sum, item) => 
      sum + parseFloat(item.rental_amount) + parseFloat(item.deposit_amount), 0
    );
    
    res.json({
      success: true,
      count: cartItems.length,
      data: cartItems,
      total_amount: totalAmount
    });
  } catch (error) {
    next(error);
  }
};

// Remove item from cart
export const removeFromCart = async (req, res, next) => {
  try {
    const customerId = req.user.userId;
    const { id } = req.params;
    
    const [result] = await db.query(
      'DELETE FROM rental_cart WHERE id = ? AND customer_id = ?',
      [id, customerId]
    );
    
    if (result.affectedRows === 0) {
      throw new AppError('Cart item not found', 404);
    }
    
    res.json({
      success: true,
      message: 'Item removed from cart'
    });
  } catch (error) {
    next(error);
  }
};

// Clear cart
export const clearCart = async (req, res, next) => {
  try {
    const customerId = req.user.userId;
    
    await db.query('DELETE FROM rental_cart WHERE customer_id = ?', [customerId]);
    
    res.json({
      success: true,
      message: 'Cart cleared successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Checkout - Convert cart to rentals
export const checkout = async (req, res, next) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const customerId = req.user.userId;
    
    // Get cart items
    const [cartItems] = await connection.query(
      `SELECT rc.*, sp.rental_price_per_day, sp.deposit_amount
       FROM rental_cart rc
       JOIN suit_products sp ON rc.product_id = sp.id
       WHERE rc.customer_id = ?`,
      [customerId]
    );
    
    if (cartItems.length === 0) {
      throw new AppError('Cart is empty', 400);
    }
    
    const rentals = [];
    
    for (const item of cartItems) {
      // Find available inventory for this product and size
      const [available] = await connection.query(
        `SELECT si.id
         FROM suit_inventory si
         WHERE si.product_id = ? AND si.size = ? AND si.is_available = TRUE
         AND si.id NOT IN (
           SELECT sr.inventory_id
           FROM suit_rentals sr
           WHERE sr.rental_status IN ('reserved', 'active')
           AND (
             (sr.rental_start_date <= ? AND sr.rental_end_date >= ?)
             OR (sr.rental_start_date <= ? AND sr.rental_end_date >= ?)
             OR (sr.rental_start_date >= ? AND sr.rental_end_date <= ?)
           )
         )
         LIMIT 1`,
        [item.product_id, item.size, item.rental_start_date, item.rental_start_date,
         item.rental_end_date, item.rental_end_date, item.rental_start_date, item.rental_end_date]
      );
      
      if (available.length === 0) {
        throw new AppError(`Size ${item.size} is no longer available for the selected dates`, 400);
      }
      
      const inventoryId = available[0].id;
      
      // Generate rental number
      const rentalNumber = `SR-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
      
      const totalAmount = parseFloat(item.rental_amount) + parseFloat(item.deposit_amount);
      
      // Create rental
      const [result] = await connection.query(
        `INSERT INTO suit_rentals 
         (rental_number, customer_id, inventory_id, rental_start_date, rental_end_date,
          rental_days, rental_amount, deposit_amount, total_amount, payment_status,
          rental_status, occasion, delivery_address, special_instructions)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'reserved', ?, ?, ?)`,
        [rentalNumber, customerId, inventoryId, item.rental_start_date, item.rental_end_date,
         item.rental_days, item.rental_amount, item.deposit_amount, totalAmount,
         item.occasion, item.delivery_address, item.special_instructions]
      );
      
      rentals.push({
        id: result.insertId,
        rental_number: rentalNumber,
        amount: totalAmount
      });
    }
    
    // Clear cart
    await connection.query('DELETE FROM rental_cart WHERE customer_id = ?', [customerId]);
    
    await connection.commit();
    
    res.status(201).json({
      success: true,
      message: 'Rentals created successfully',
      data: rentals
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

// Create single rental (direct booking without cart)
export const createRental = async (req, res, next) => {
  try {
    const customerId = req.user.userId;
    const {
      product_id,
      size,
      start_date,
      end_date,
      occasion,
      delivery_address,
      special_instructions
    } = req.body;
    
    // Validate dates
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    const rentalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    
    if (rentalDays <= 0) {
      throw new AppError('Invalid date range', 400);
    }
    
    // Get product
    const [products] = await db.query(
      'SELECT * FROM suit_products WHERE id = ? AND is_active = TRUE',
      [product_id]
    );
    
    if (products.length === 0) {
      throw new AppError('Product not found', 404);
    }
    
    const product = products[0];
    
    // Find available inventory
    const [available] = await db.query(
      `SELECT si.id
       FROM suit_inventory si
       WHERE si.product_id = ? AND si.size = ? AND si.is_available = TRUE
       AND si.id NOT IN (
         SELECT sr.inventory_id
         FROM suit_rentals sr
         WHERE sr.rental_status IN ('reserved', 'active')
         AND (
           (sr.rental_start_date <= ? AND sr.rental_end_date >= ?)
           OR (sr.rental_start_date <= ? AND sr.rental_end_date >= ?)
           OR (sr.rental_start_date >= ? AND sr.rental_end_date <= ?)
         )
       )
       LIMIT 1`,
      [product_id, size, start_date, start_date, end_date, end_date, start_date, end_date]
    );
    
    if (available.length === 0) {
      throw new AppError('This size is not available for the selected dates', 400);
    }
    
    const inventoryId = available[0].id;
    
    // Calculate amounts
    const rentalAmount = product.rental_price_per_day * rentalDays;
    const depositAmount = product.deposit_amount;
    const totalAmount = rentalAmount + depositAmount;
    
    // Generate rental number
    const rentalNumber = `SR-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    
    // Create rental
    const [result] = await db.query(
      `INSERT INTO suit_rentals 
       (rental_number, customer_id, inventory_id, rental_start_date, rental_end_date,
        rental_days, rental_amount, deposit_amount, total_amount, payment_status,
        rental_status, occasion, delivery_address, special_instructions)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'reserved', ?, ?, ?)`,
      [rentalNumber, customerId, inventoryId, start_date, end_date, rentalDays,
       rentalAmount, depositAmount, totalAmount, occasion, delivery_address, special_instructions]
    );
    
    res.status(201).json({
      success: true,
      message: 'Rental created successfully',
      data: {
        id: result.insertId,
        rental_number: rentalNumber,
        total_amount: totalAmount
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get my rentals
export const getMyRentals = async (req, res, next) => {
  try {
    const customerId = req.user.userId;
    
    const [rentals] = await db.query(
      `SELECT 
        sr.*,
        sp.name, sp.brand, sp.color, sp.image_url,
        si.size, si.suit_code,
        sc.name as category_name
       FROM suit_rentals sr
       JOIN suit_inventory si ON sr.inventory_id = si.id
       JOIN suit_products sp ON si.product_id = sp.id
       JOIN suit_categories sc ON sp.category_id = sc.id
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

// Get all categories
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
  getAvailableSizes,
  addToCart,
  getCart,
  removeFromCart,
  clearCart,
  checkout,
  createRental,
  getMyRentals,
  getCategories
};
