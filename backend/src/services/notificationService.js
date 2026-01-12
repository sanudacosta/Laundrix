import db from '../config/database.js';
import { sendEmail, emailTemplates } from './emailService.js';
import { sendSMS, smsTemplates } from './smsService.js';

// Create notification
export const createNotification = async (notificationData) => {
  try {
    const {
      userId,
      type,
      title,
      message,
      sendEmail: shouldSendEmail = false,
      sendSms: shouldSendSms = false,
      relatedOrderId = null,
      relatedRentalId = null
    } = notificationData;

    const [result] = await db.query(
      `INSERT INTO notifications 
       (user_id, type, title, message, send_email, send_sms, related_order_id, related_rental_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, type, title, message, shouldSendEmail, shouldSendSms, relatedOrderId, relatedRentalId]
    );

    const notificationId = result.insertId;

    // Get user details for email/SMS
    const [users] = await db.query(
      'SELECT email, phone, full_name FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return { success: false, message: 'User not found' };
    }

    const user = users[0];

    // Send email if requested
    if (shouldSendEmail && user.email) {
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
          <h2 style="color: #1890ff;">${title}</h2>
          <p>${message}</p>
          <hr style="margin: 20px 0;">
          <p style="font-size: 12px; color: #666;">
            This is an automated message from Laundrix.
          </p>
        </div>
      `;
      
      const emailResult = await sendEmail(user.email, title, emailHtml);
      
      if (emailResult.success) {
        await db.query(
          'UPDATE notifications SET email_sent = TRUE WHERE id = ?',
          [notificationId]
        );
      }
    }

    // Send SMS if requested
    if (shouldSendSms && user.phone) {
      const smsResult = await sendSMS(user.phone, `${title}: ${message}`);
      
      if (smsResult.success) {
        await db.query(
          'UPDATE notifications SET sms_sent = TRUE WHERE id = ?',
          [notificationId]
        );
      }
    }

    return {
      success: true,
      notificationId,
      emailSent: shouldSendEmail,
      smsSent: shouldSendSms
    };
  } catch (error) {
    console.error('Error creating notification:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Get user notifications
export const getUserNotifications = async (userId, limit = 50) => {
  try {
    const [notifications] = await db.query(
      `SELECT * FROM notifications 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT ?`,
      [userId, limit]
    );

    return { success: true, notifications };
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return { success: false, error: error.message };
  }
};

// Mark notification as read
export const markAsRead = async (notificationId, userId) => {
  try {
    await db.query(
      `UPDATE notifications 
       SET is_read = TRUE, read_at = NOW() 
       WHERE id = ? AND user_id = ?`,
      [notificationId, userId]
    );

    return { success: true };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return { success: false, error: error.message };
  }
};

// Send order status notification
export const sendOrderNotification = async (orderId, status, userId) => {
  const statusMessages = {
    pending: { title: 'Order Received', message: 'Your laundry order has been received and is pending processing.' },
    'in-progress': { title: 'Order In Progress', message: 'Your laundry order is now being processed.' },
    ready: { title: 'Order Ready', message: 'Your laundry order is ready for pickup!' },
    completed: { title: 'Order Completed', message: 'Your laundry order has been completed. Thank you!' },
    cancelled: { title: 'Order Cancelled', message: 'Your laundry order has been cancelled.' }
  };

  const { title, message } = statusMessages[status] || statusMessages.pending;

  return await createNotification({
    userId,
    type: 'order',
    title,
    message,
    sendEmail: true,
    sendSms: status === 'ready',
    relatedOrderId: orderId
  });
};

// Send rental notification
export const sendRentalNotification = async (rentalId, status, userId) => {
  const statusMessages = {
    reserved: { title: 'Rental Confirmed', message: 'Your suit rental has been confirmed.' },
    active: { title: 'Rental Active', message: 'Your suit rental is now active. Enjoy!' },
    returned: { title: 'Rental Returned', message: 'Thank you for returning the suit.' },
    overdue: { title: 'Rental Overdue', message: 'Your suit rental is overdue. Please return it as soon as possible.' }
  };

  const { title, message } = statusMessages[status] || statusMessages.reserved;

  return await createNotification({
    userId,
    type: 'rental',
    title,
    message,
    sendEmail: true,
    sendSms: status === 'overdue',
    relatedRentalId: rentalId
  });
};

export default {
  createNotification,
  getUserNotifications,
  markAsRead,
  sendOrderNotification,
  sendRentalNotification
};
