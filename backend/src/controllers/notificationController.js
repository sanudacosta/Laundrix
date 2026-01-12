import db from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { createNotification, getUserNotifications, markAsRead } from '../services/notificationService.js';

// Get user's notifications
export const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { limit = 50, is_read } = req.query;
    
    let query = 'SELECT * FROM notifications WHERE user_id = ?';
    const params = [userId];
    
    if (is_read !== undefined) {
      query += ' AND is_read = ?';
      params.push(is_read === 'true');
    }
    
    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(parseInt(limit));
    
    const [notifications] = await db.query(query, params);
    
    // Get unread count
    const [unreadCount] = await db.query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE',
      [userId]
    );
    
    res.json({
      success: true,
      count: notifications.length,
      unreadCount: unreadCount[0].count,
      data: notifications
    });
  } catch (error) {
    next(error);
  }
};

// Mark notification as read
export const markNotificationAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    // Verify notification belongs to user
    const [notifications] = await db.query(
      'SELECT id FROM notifications WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    
    if (notifications.length === 0) {
      throw new AppError('Notification not found', 404);
    }
    
    await markAsRead(id, userId);
    
    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    next(error);
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    
    await db.query(
      'UPDATE notifications SET is_read = TRUE, read_at = NOW() WHERE user_id = ? AND is_read = FALSE',
      [userId]
    );
    
    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    next(error);
  }
};

// Delete notification
export const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    // Verify notification belongs to user
    const [notifications] = await db.query(
      'SELECT id FROM notifications WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    
    if (notifications.length === 0) {
      throw new AppError('Notification not found', 404);
    }
    
    await db.query('DELETE FROM notifications WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    next(error);
  }
};

// Send bulk notification (admin)
export const sendBulkNotification = async (req, res, next) => {
  try {
    const { user_ids, role, title, message, send_email, send_sms } = req.body;
    
    let targetUsers = [];
    
    if (user_ids && user_ids.length > 0) {
      // Send to specific users
      const [users] = await db.query('SELECT id FROM users WHERE id IN (?)', [user_ids]);
      targetUsers = users.map(u => u.id);
    } else if (role) {
      // Send to all users with specific role
      const [users] = await db.query('SELECT id FROM users WHERE role = ?', [role]);
      targetUsers = users.map(u => u.id);
    } else {
      throw new AppError('Either user_ids or role must be specified', 400);
    }
    
    // Create notifications for all target users
    const promises = targetUsers.map(userId => 
      createNotification({
        userId,
        type: 'general',
        title,
        message,
        sendEmail: send_email,
        sendSms: send_sms
      })
    );
    
    await Promise.all(promises);
    
    res.json({
      success: true,
      message: `Notification sent to ${targetUsers.length} users`
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getNotifications,
  markNotificationAsRead,
  markAllAsRead,
  deleteNotification,
  sendBulkNotification
};
