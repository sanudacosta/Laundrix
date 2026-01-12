import db from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { processPayment, processRefund } from '../services/paymentService.js';

// Create payment
export const createPayment = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const {
      order_id,
      rental_id,
      payment_type,
      payment_method,
      amount,
      card_details
    } = req.body;
    
    // Validate payment type and reference
    if (payment_type === 'laundry' && !order_id) {
      throw new AppError('Order ID required for laundry payment', 400);
    }
    
    if ((payment_type === 'rental' || payment_type === 'deposit') && !rental_id) {
      throw new AppError('Rental ID required for rental payment', 400);
    }
    
    // Process payment
    const paymentResult = await processPayment({
      amount,
      paymentMethod: payment_method,
      cardDetails: card_details,
      customerInfo: { userId }
    });
    
    if (!paymentResult.success) {
      throw new AppError(paymentResult.error || 'Payment processing failed', 400);
    }
    
    // Generate payment number
    const paymentNumber = `PAY-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    
    // Save payment to database
    const [result] = await db.query(
      `INSERT INTO payments 
       (payment_number, user_id, order_id, rental_id, payment_type, payment_method, 
        amount, transaction_id, payment_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [paymentNumber, userId, order_id, rental_id, payment_type, payment_method,
       amount, paymentResult.transactionId, 'completed']
    );
    
    const paymentId = result.insertId;
    
    // Update order/rental payment status
    if (order_id) {
      await db.query(
        'UPDATE laundry_orders SET payment_status = ? WHERE id = ?',
        ['paid', order_id]
      );
    }
    
    if (rental_id) {
      await db.query(
        'UPDATE suit_rentals SET payment_status = ? WHERE id = ?',
        ['paid', rental_id]
      );
    }
    
    res.status(201).json({
      success: true,
      message: 'Payment processed successfully',
      data: {
        paymentId,
        paymentNumber,
        transactionId: paymentResult.transactionId,
        amount
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get user's payments
export const getMyPayments = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    
    const [payments] = await db.query(
      `SELECT p.*, lo.order_number, sr.rental_number
       FROM payments p
       LEFT JOIN laundry_orders lo ON p.order_id = lo.id
       LEFT JOIN suit_rentals sr ON p.rental_id = sr.id
       WHERE p.user_id = ?
       ORDER BY p.created_at DESC`,
      [userId]
    );
    
    res.json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    next(error);
  }
};

// Get all payments (admin)
export const getAllPayments = async (req, res, next) => {
  try {
    const { payment_type, payment_status, date_from, date_to } = req.query;
    
    let query = `
      SELECT p.*, u.full_name as customer_name, u.email as customer_email,
             lo.order_number, sr.rental_number
      FROM payments p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN laundry_orders lo ON p.order_id = lo.id
      LEFT JOIN suit_rentals sr ON p.rental_id = sr.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (payment_type) {
      query += ' AND p.payment_type = ?';
      params.push(payment_type);
    }
    
    if (payment_status) {
      query += ' AND p.payment_status = ?';
      params.push(payment_status);
    }
    
    if (date_from) {
      query += ' AND p.payment_date >= ?';
      params.push(date_from);
    }
    
    if (date_to) {
      query += ' AND p.payment_date <= ?';
      params.push(date_to);
    }
    
    query += ' ORDER BY p.payment_date DESC';
    
    const [payments] = await db.query(query, params);
    
    res.json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    next(error);
  }
};

// Get payment by ID
export const getPaymentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;
    
    const [payments] = await db.query(
      `SELECT p.*, u.full_name as customer_name, u.email as customer_email,
              lo.order_number, sr.rental_number
       FROM payments p
       JOIN users u ON p.user_id = u.id
       LEFT JOIN laundry_orders lo ON p.order_id = lo.id
       LEFT JOIN suit_rentals sr ON p.rental_id = sr.id
       WHERE p.id = ?`,
      [id]
    );
    
    if (payments.length === 0) {
      throw new AppError('Payment not found', 404);
    }
    
    const payment = payments[0];
    
    // Check authorization
    if (userRole === 'customer' && payment.user_id !== userId) {
      throw new AppError('Unauthorized access', 403);
    }
    
    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    next(error);
  }
};

// Process refund (admin)
export const createRefund = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amount, reason } = req.body;
    
    // Get original payment
    const [payments] = await db.query('SELECT * FROM payments WHERE id = ?', [id]);
    
    if (payments.length === 0) {
      throw new AppError('Payment not found', 404);
    }
    
    const payment = payments[0];
    
    if (payment.payment_status === 'refunded') {
      throw new AppError('Payment already refunded', 400);
    }
    
    // Process refund
    const refundResult = await processRefund(payment.transaction_id, amount);
    
    if (!refundResult.success) {
      throw new AppError(refundResult.error || 'Refund processing failed', 400);
    }
    
    // Update payment status
    await db.query(
      'UPDATE payments SET payment_status = ?, notes = ? WHERE id = ?',
      ['refunded', reason, id]
    );
    
    res.json({
      success: true,
      message: 'Refund processed successfully',
      data: {
        refundId: refundResult.refundId,
        amount
      }
    });
  } catch (error) {
    next(error);
  }
};

export default {
  createPayment,
  getMyPayments,
  getAllPayments,
  getPaymentById,
  createRefund
};
