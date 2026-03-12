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
       (user_id, type, title, message) 
       VALUES (?, ?, ?, ?)`,
      [userId, type, title, message]
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
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background-color:#f4f5f7;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f5f7;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border:1px solid #e2e8f0;border-radius:6px;overflow:hidden;">
        <tr><td style="background-color:#1e3a5f;padding:24px 32px;">
          <table width="100%" cellpadding="0" cellspacing="0"><tr>
            <td><span style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:0.5px;">LAUNDRIX</span></td>
            <td align="right"><span style="font-size:12px;color:#94b4d4;letter-spacing:0.5px;text-transform:uppercase;">Professional Laundry Services</span></td>
          </tr></table>
        </td></tr>
        <tr><td style="padding:36px 32px 28px;">
          <h2 style="margin:0 0 20px;font-size:20px;font-weight:700;color:#1e3a5f;">${title}</h2>
          <p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.6;">Dear ${user.full_name},</p>
          <p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.6;">${message}</p>
        </td></tr>
        <tr><td style="padding:0 32px;"><hr style="border:none;border-top:1px solid #e2e8f0;margin:0;"/></td></tr>
        <tr><td style="background-color:#f8fafc;padding:20px 32px;">
          <p style="margin:0 0 4px;font-size:12px;color:#64748b;">This is an automated message from Laundrix. Please do not reply to this email.</p>
          <p style="margin:0;font-size:12px;color:#94a3b8;">Questions? Contact us at support@laundrix.com</p>
        </td></tr>
      </table>
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;margin-top:16px;">
        <tr><td style="text-align:center;font-size:11px;color:#94a3b8;padding:0 16px;">&copy; ${new Date().getFullYear()} Laundrix. All rights reserved.</td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
      `;
      
      await sendEmail(user.email, title, emailHtml);
    }

    // Send SMS if requested
    if (shouldSendSms && user.phone) {
      await sendSMS(user.phone, `${title}: ${message}`);
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
