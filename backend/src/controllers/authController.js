import bcrypt from 'bcryptjs';
import db from '../config/database.js';
import { generateToken } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

// Register new user
export const register = async (req, res, next) => {
  try {
    const { full_name, email, password, phone, address, role = 'customer' } = req.body;

    // Check if user already exists
    const [existingUsers] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    
    if (existingUsers.length > 0) {
      throw new AppError('Email already registered', 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const [result] = await db.query(
      `INSERT INTO users (full_name, email, password, phone, address, role) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [full_name, email, hashedPassword, phone, address, role]
    );

    const userId = result.insertId;

    // Generate token
    const token = generateToken(userId, role);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        userId,
        full_name,
        email,
        phone,
        address,
        role,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// Login user
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user
    const [users] = await db.query(
      'SELECT id, full_name, email, password, phone, role, address, is_active FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      throw new AppError('Invalid email or password', 401);
    }

    const user = users[0];

    // Check if account is active
    if (!user.is_active) {
      throw new AppError('Account is deactivated. Please contact support.', 403);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    // Generate token
    const token = generateToken(user.id, user.role);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        userId: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        address: user.address,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get current user profile
export const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const [users] = await db.query(
      `SELECT id, full_name, email, phone, role, address, profile_image, 
              is_active, email_verified, created_at 
       FROM users WHERE id = ?`,
      [userId]
    );

    if (users.length === 0) {
      throw new AppError('User not found', 404);
    }

    res.json({
      success: true,
      data: users[0]
    });
  } catch (error) {
    next(error);
  }
};

// Update user profile
export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { full_name, phone, address } = req.body;

    await db.query(
      'UPDATE users SET full_name = ?, phone = ?, address = ? WHERE id = ?',
      [full_name, phone, address, userId]
    );

    res.json({
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Change password
export const changePassword = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    // Get current password
    const [users] = await db.query('SELECT password FROM users WHERE id = ?', [userId]);
    
    if (users.length === 0) {
      throw new AppError('User not found', 404);
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, users[0].password);
    
    if (!isPasswordValid) {
      throw new AppError('Current password is incorrect', 401);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};

export default {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword
};
