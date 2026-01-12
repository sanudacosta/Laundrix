import db from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import bcrypt from 'bcryptjs';

// Get all users (admin)
export const getAllUsers = async (req, res, next) => {
  try {
    const { role, is_active, search } = req.query;
    
    let query = `
      SELECT id, full_name, email, phone, role, address, is_active, 
             email_verified, created_at, updated_at
      FROM users
      WHERE 1=1
    `;
    
    const params = [];
    
    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }
    
    if (is_active !== undefined) {
      query += ' AND is_active = ?';
      params.push(is_active === 'true');
    }
    
    if (search) {
      query += ' AND (full_name LIKE ? OR email LIKE ? OR phone LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const [users] = await db.query(query, params);
    
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// Get user by ID (admin)
export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const [users] = await db.query(
      `SELECT id, full_name, email, phone, role, address, profile_image,
              is_active, email_verified, created_at, updated_at
       FROM users WHERE id = ?`,
      [id]
    );
    
    if (users.length === 0) {
      throw new AppError('User not found', 404);
    }
    
    // Get user statistics
    const [orderStats] = await db.query(
      'SELECT COUNT(*) as total_orders, SUM(total_amount) as total_spent FROM laundry_orders WHERE customer_id = ?',
      [id]
    );
    
    const [rentalStats] = await db.query(
      'SELECT COUNT(*) as total_rentals, SUM(total_amount) as total_rental_amount FROM suit_rentals WHERE customer_id = ?',
      [id]
    );
    
    const user = users[0];
    user.statistics = {
      orders: orderStats[0],
      rentals: rentalStats[0]
    };
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// Create user (admin)
export const createUser = async (req, res, next) => {
  try {
    const { full_name, email, password, phone, role, address } = req.body;
    
    // Check if email exists
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      throw new AppError('Email already exists', 400);
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const [result] = await db.query(
      'INSERT INTO users (full_name, email, password, phone, role, address) VALUES (?, ?, ?, ?, ?, ?)',
      [full_name, email, hashedPassword, phone, role, address]
    );
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: { userId: result.insertId }
    });
  } catch (error) {
    next(error);
  }
};

// Update user (admin)
export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { full_name, email, phone, role, address, is_active } = req.body;
    
    // Check if user exists
    const [users] = await db.query('SELECT id FROM users WHERE id = ?', [id]);
    if (users.length === 0) {
      throw new AppError('User not found', 404);
    }
    
    // Check if email is taken by another user
    if (email) {
      const [existing] = await db.query('SELECT id FROM users WHERE email = ? AND id != ?', [email, id]);
      if (existing.length > 0) {
        throw new AppError('Email already in use', 400);
      }
    }
    
    // Update user
    await db.query(
      `UPDATE users 
       SET full_name = COALESCE(?, full_name),
           email = COALESCE(?, email),
           phone = COALESCE(?, phone),
           role = COALESCE(?, role),
           address = COALESCE(?, address),
           is_active = COALESCE(?, is_active)
       WHERE id = ?`,
      [full_name, email, phone, role, address, is_active, id]
    );
    
    res.json({
      success: true,
      message: 'User updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Delete user (admin)
export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Prevent deleting yourself
    if (parseInt(id) === req.user.userId) {
      throw new AppError('Cannot delete your own account', 400);
    }
    
    await db.query('DELETE FROM users WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get all cleaning types
export const getCleaningTypes = async (req, res, next) => {
  try {
    const [types] = await db.query('SELECT * FROM cleaning_types WHERE is_active = TRUE ORDER BY name');
    
    res.json({
      success: true,
      count: types.length,
      data: types
    });
  } catch (error) {
    next(error);
  }
};

// Update cleaning type (admin)
export const updateCleaningType = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, base_price, is_active } = req.body;
    
    await db.query(
      `UPDATE cleaning_types 
       SET name = COALESCE(?, name),
           description = COALESCE(?, description),
           base_price = COALESCE(?, base_price),
           is_active = COALESCE(?, is_active)
       WHERE id = ?`,
      [name, description, base_price, is_active, id]
    );
    
    res.json({
      success: true,
      message: 'Cleaning type updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get all service times
export const getServiceTimes = async (req, res, next) => {
  try {
    const [times] = await db.query('SELECT * FROM service_times WHERE is_active = TRUE ORDER BY duration_hours');
    
    res.json({
      success: true,
      count: times.length,
      data: times
    });
  } catch (error) {
    next(error);
  }
};

// Update service time (admin)
export const updateServiceTime = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, duration_hours, price_multiplier, is_active } = req.body;
    
    await db.query(
      `UPDATE service_times 
       SET name = COALESCE(?, name),
           description = COALESCE(?, description),
           duration_hours = COALESCE(?, duration_hours),
           price_multiplier = COALESCE(?, price_multiplier),
           is_active = COALESCE(?, is_active)
       WHERE id = ?`,
      [name, description, duration_hours, price_multiplier, is_active, id]
    );
    
    res.json({
      success: true,
      message: 'Service time updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Manage suit inventory (admin)
export const createSuit = async (req, res, next) => {
  try {
    const {
      suit_code, category_id, name, description, size, color, brand,
      condition_status, rental_price_per_day, deposit_amount, purchase_price, image_url
    } = req.body;
    
    const [result] = await db.query(
      `INSERT INTO suits 
       (suit_code, category_id, name, description, size, color, brand, condition_status,
        rental_price_per_day, deposit_amount, purchase_price, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [suit_code, category_id, name, description, size, color, brand, condition_status,
       rental_price_per_day, deposit_amount, purchase_price, image_url]
    );
    
    res.status(201).json({
      success: true,
      message: 'Suit added to inventory successfully',
      data: { suitId: result.insertId }
    });
  } catch (error) {
    next(error);
  }
};

export const updateSuit = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name, description, size, color, brand, condition_status,
      rental_price_per_day, deposit_amount, is_available
    } = req.body;
    
    await db.query(
      `UPDATE suits 
       SET name = COALESCE(?, name),
           description = COALESCE(?, description),
           size = COALESCE(?, size),
           color = COALESCE(?, color),
           brand = COALESCE(?, brand),
           condition_status = COALESCE(?, condition_status),
           rental_price_per_day = COALESCE(?, rental_price_per_day),
           deposit_amount = COALESCE(?, deposit_amount),
           is_available = COALESCE(?, is_available)
       WHERE id = ?`,
      [name, description, size, color, brand, condition_status,
       rental_price_per_day, deposit_amount, is_available, id]
    );
    
    res.json({
      success: true,
      message: 'Suit updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSuit = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if suit has active rentals
    const [activeRentals] = await db.query(
      'SELECT id FROM suit_rentals WHERE suit_id = ? AND rental_status IN (?, ?)',
      [id, 'reserved', 'active']
    );
    
    if (activeRentals.length > 0) {
      throw new AppError('Cannot delete suit with active rentals', 400);
    }
    
    await db.query('DELETE FROM suits WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'Suit deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get system settings
export const getSettings = async (req, res, next) => {
  try {
    const [settings] = await db.query('SELECT * FROM system_settings ORDER BY setting_key');
    
    const settingsObject = settings.reduce((acc, setting) => {
      acc[setting.setting_key] = setting.setting_value;
      return acc;
    }, {});
    
    res.json({
      success: true,
      data: settingsObject
    });
  } catch (error) {
    next(error);
  }
};

// Update system settings
export const updateSettings = async (req, res, next) => {
  try {
    const settings = req.body;
    
    for (const [key, value] of Object.entries(settings)) {
      await db.query(
        'UPDATE system_settings SET setting_value = ? WHERE setting_key = ?',
        [value, key]
      );
    }
    
    res.json({
      success: true,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

export default {
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
};
