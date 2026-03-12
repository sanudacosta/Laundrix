import db from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { sendOrderNotification } from '../services/notificationService.js';

// Get all laundry orders (admin/employee)
export const getAllOrders = async (req, res, next) => {
  try {
    const { status, customer_id, date_from, date_to } = req.query;
    
    let query = `
      SELECT lo.*, u.full_name as customer_name, u.email as customer_email, u.phone as customer_phone,
             ct.name as cleaning_type, st.name as service_time,
             e.full_name as employee_name
      FROM laundry_orders lo
      JOIN users u ON lo.customer_id = u.id
      JOIN cleaning_types ct ON lo.cleaning_type_id = ct.id
      JOIN service_times st ON lo.service_time_id = st.id
      LEFT JOIN users e ON lo.assigned_employee_id = e.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (status) {
      query += ' AND lo.status = ?';
      params.push(status);
    }
    
    if (customer_id) {
      query += ' AND lo.customer_id = ?';
      params.push(customer_id);
    }
    
    if (date_from) {
      query += ' AND lo.created_at >= ?';
      params.push(date_from);
    }
    
    if (date_to) {
      query += ' AND lo.created_at <= ?';
      params.push(date_to);
    }
    
    query += ' ORDER BY lo.created_at DESC';
    
    const [orders] = await db.query(query, params);
    
    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

// Get customer's own orders
export const getMyOrders = async (req, res, next) => {
  try {
    const customerId = req.user.userId;
    
    const [orders] = await db.query(
      `SELECT lo.*, ct.name as cleaning_type, st.name as service_time,
              e.full_name as employee_name
       FROM laundry_orders lo
       JOIN cleaning_types ct ON lo.cleaning_type_id = ct.id
       JOIN service_times st ON lo.service_time_id = st.id
       LEFT JOIN users e ON lo.assigned_employee_id = e.id
       WHERE lo.customer_id = ?
       ORDER BY lo.created_at DESC`,
      [customerId]
    );
    
    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

// Get single order by ID
export const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;
    
    const [orders] = await db.query(
      `SELECT lo.*, u.full_name as customer_name, u.email as customer_email, u.phone as customer_phone,
              ct.name as cleaning_type, ct.description as cleaning_description,
              st.name as service_time, st.duration_hours,
              e.full_name as employee_name, e.email as employee_email
       FROM laundry_orders lo
       JOIN users u ON lo.customer_id = u.id
       JOIN cleaning_types ct ON lo.cleaning_type_id = ct.id
       JOIN service_times st ON lo.service_time_id = st.id
       LEFT JOIN users e ON lo.assigned_employee_id = e.id
       WHERE lo.id = ?`,
      [id]
    );
    
    if (orders.length === 0) {
      throw new AppError('Order not found', 404);
    }
    
    const order = orders[0];
    
    // Check authorization
    if (userRole === 'customer' && order.customer_id !== userId) {
      throw new AppError('Unauthorized access', 403);
    }
    
    // Get order history
    const [history] = await db.query(
      `SELECT osh.*, u.full_name as changed_by_name
       FROM order_status_history osh
       JOIN users u ON osh.changed_by = u.id
       WHERE osh.order_id = ?
       ORDER BY osh.created_at DESC`,
      [id]
    );
    
    order.history = history;
    
    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// Create new laundry order
export const createOrder = async (req, res, next) => {
  try {
    // Allow employees to create orders for customers (POS)
    // If employee is creating order, customer_id must be provided in body
    // If customer is creating own order, use their userId from token
    const userRole = req.user.role;
    const {
      customer_id,
      cleaning_type_id,
      service_time_id,
      item_description,
      quantity,
      weight_kg,
      special_instructions,
      pickup_address,
      delivery_address,
      order_type,
      pickup_date
    } = req.body;

    // Determine the actual customer ID and if this is a POS order
    let customerId;
    let isPOSOrder = false;
    let assignedEmployeeId = null;
    let initialStatus = 'pending';
    let paymentStatus = 'pending';
    
    if (userRole === 'employee' && customer_id) {
      // Employee creating order for a customer via POS
      customerId = customer_id;
      isPOSOrder = true;
      assignedEmployeeId = req.user.userId; // Auto-assign to employee creating the order
      initialStatus = 'in-progress'; // POS orders start as in-progress (payment collected, ready to process)
      paymentStatus = 'paid'; // POS orders have payment collected upfront
      
      console.log('POS ORDER DETECTED:', {
        userRole,
        customer_id,
        assignedEmployeeId,
        initialStatus,
        paymentStatus
      });
    } else {
      // Customer creating their own order
      customerId = req.user.userId;
      console.log('REGULAR ORDER:', {
        userRole,
        customerId,
        initialStatus,
        paymentStatus
      });
    }
    
    // Get pricing info
    const [cleaningTypes] = await db.query('SELECT base_price FROM cleaning_types WHERE id = ?', [cleaning_type_id]);
    const [serviceTimes] = await db.query('SELECT price_multiplier, duration_hours FROM service_times WHERE id = ?', [service_time_id]);
    
    if (cleaningTypes.length === 0 || serviceTimes.length === 0) {
      throw new AppError('Invalid cleaning type or service time', 400);
    }
    
    const basePrice = cleaningTypes[0].base_price;
    const multiplier = serviceTimes[0].price_multiplier;
    const durationHours = serviceTimes[0].duration_hours;
    
    // Calculate pricing (price per kg × weight × service multiplier)
    const subtotal = parseFloat(basePrice) * parseFloat(weight_kg || 1) * parseFloat(multiplier);
    const tax = subtotal * 0.08; // 8% tax
    const totalAmount = subtotal + tax;
    
    // Calculate delivery date
    const pickupDateTime = pickup_date ? new Date(pickup_date) : new Date();
    const deliveryDate = new Date(pickupDateTime.getTime() + durationHours * 60 * 60 * 1000);
    
    // Generate order number
    const orderNumber = `LO-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    
    console.log('BEFORE INSERT - Status Values:', {
      initialStatus,
      paymentStatus,
      isPOSOrder,
      assignedEmployeeId
    });
    
    // Insert order with assigned employee if POS order
    const [result] = await db.query(
      `INSERT INTO laundry_orders 
       (order_number, customer_id, cleaning_type_id, service_time_id, assigned_employee_id, item_description, 
        quantity, weight_kg, special_instructions, pickup_address, delivery_address, order_type, 
        status, payment_status, subtotal, tax, total_amount, pickup_date, delivery_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [orderNumber, customerId, cleaning_type_id, service_time_id, assignedEmployeeId, item_description,
       quantity, weight_kg, special_instructions, pickup_address, delivery_address, order_type, 
       initialStatus, paymentStatus, subtotal, tax, totalAmount, pickupDateTime, deliveryDate]
    );
    
    console.log('AFTER INSERT - Order ID:', result.insertId);
    
    const orderId = result.insertId;
    
    // Add to history (use the employee's ID if they created it, otherwise the customer)
    const changedBy = isPOSOrder ? req.user.userId : customerId;
    const historyNote = isPOSOrder 
      ? 'POS order created - payment collected, ready to process' 
      : 'Order placed';
    
    await db.query(
      'INSERT INTO order_status_history (order_id, old_status, new_status, changed_by, notes) VALUES (?, ?, ?, ?, ?)',
      [orderId, null, initialStatus, changedBy, historyNote]
    );
    
    // Send notification
    await sendOrderNotification(orderId, 'pending', customerId);
    
    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        orderId,
        orderNumber,
        totalAmount,
        deliveryDate
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update order status (admin/employee)
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const userId = req.user.userId;
    
    // Get order details
    const [orders] = await db.query('SELECT customer_id, status FROM laundry_orders WHERE id = ?', [id]);
    
    if (orders.length === 0) {
      throw new AppError('Order not found', 404);
    }
    
    const customerId = orders[0].customer_id;
    const oldStatus = orders[0].status;
    
    // Update order
    await db.query('UPDATE laundry_orders SET status = ? WHERE id = ?', [status, id]);
    
    // Add to history
    await db.query(
      'INSERT INTO order_status_history (order_id, old_status, new_status, changed_by, notes) VALUES (?, ?, ?, ?, ?)',
      [id, oldStatus, status, userId, notes || `Status changed from ${oldStatus} to ${status}`]
    );
    
    // Send notification
    await sendOrderNotification(id, status, customerId);
    
    res.json({
      success: true,
      message: 'Order status updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Assign order to employee (admin)
export const assignOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { employee_id } = req.body;
    
    // Verify employee exists and has correct role
    const [employees] = await db.query('SELECT id FROM users WHERE id = ? AND role = ?', [employee_id, 'employee']);
    
    if (employees.length === 0) {
      throw new AppError('Employee not found', 404);
    }
    
    // Update order
    await db.query('UPDATE laundry_orders SET assigned_employee_id = ? WHERE id = ?', [employee_id, id]);
    
    res.json({
      success: true,
      message: 'Order assigned successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get employee's assigned orders
export const getAssignedOrders = async (req, res, next) => {
  try {
    const employeeId = req.user.userId;
    
    const [orders] = await db.query(
      `SELECT lo.*, u.full_name as customer_name, u.phone as customer_phone,
              ct.name as cleaning_type, st.name as service_time
       FROM laundry_orders lo
       JOIN users u ON lo.customer_id = u.id
       JOIN cleaning_types ct ON lo.cleaning_type_id = ct.id
       JOIN service_times st ON lo.service_time_id = st.id
       WHERE lo.assigned_employee_id = ?
       ORDER BY lo.delivery_date ASC, lo.created_at DESC`,
      [employeeId]
    );
    
    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

// Delete order (admin only)
export const deleteOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    await db.query('DELETE FROM laundry_orders WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get cleaning types (public/authenticated)
export const getCleaningTypes = async (req, res, next) => {
  try {
    const [cleaningTypes] = await db.query(
      'SELECT * FROM cleaning_types WHERE is_active = TRUE ORDER BY name'
    );
    
    res.json({
      success: true,
      count: cleaningTypes.length,
      data: cleaningTypes
    });
  } catch (error) {
    next(error);
  }
};

// Get service times (public/authenticated)
export const getServiceTimes = async (req, res, next) => {
  try {
    const [serviceTimes] = await db.query(
      'SELECT * FROM service_times WHERE is_active = TRUE ORDER BY duration_hours'
    );
    
    res.json({
      success: true,
      count: serviceTimes.length,
      data: serviceTimes
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getAllOrders,
  getMyOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  assignOrder,
  getAssignedOrders,
  deleteOrder,
  getCleaningTypes,
  getServiceTimes
};
