import db from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';

// Get customer dashboard statistics
export const getCustomerDashboardStats = async (req, res, next) => {
  try {
    const customerId = req.user.userId;
    
    // If admin, return admin stats
    if (req.user.role === 'admin') {
      return getDashboardStats(req, res, next);
    }
    
    // Active orders count
    const [activeOrders] = await db.query(
      'SELECT COUNT(*) as count FROM laundry_orders WHERE customer_id = ? AND status NOT IN (?, ?)',
      [customerId, 'completed', 'cancelled']
    );
    
    // Pending payments count
    const [pendingPayments] = await db.query(
      'SELECT COUNT(*) as count FROM payments WHERE user_id = ? AND payment_status = ?',
      [customerId, 'pending']
    );
    
    // Upcoming rentals count
    const [upcomingRentals] = await db.query(
      'SELECT COUNT(*) as count FROM suit_rentals WHERE customer_id = ? AND rental_status IN (?, ?)',
      [customerId, 'reserved', 'active']
    );
    
    // Total spent
    const [totalSpent] = await db.query(
      'SELECT SUM(amount) as total FROM payments WHERE user_id = ? AND payment_status = ?',
      [customerId, 'completed']
    );
    
    res.json({
      success: true,
      data: {
        activeOrders: activeOrders[0].count,
        pendingPayments: pendingPayments[0].count,
        upcomingRentals: upcomingRentals[0].count,
        totalSpent: totalSpent[0].total || 0
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get dashboard statistics (admin)
export const getDashboardStats = async (req, res, next) => {
  try {
    // Total counts
    const [customerCount] = await db.query('SELECT COUNT(*) as count FROM users WHERE role = ?', ['customer']);
    const [employeeCount] = await db.query('SELECT COUNT(*) as count FROM users WHERE role = ?', ['employee']);
    const [orderCount] = await db.query('SELECT COUNT(*) as count FROM laundry_orders');
    const [rentalCount] = await db.query('SELECT COUNT(*) as count FROM suit_rentals');
    
    // Active orders/rentals
    const [activeOrders] = await db.query('SELECT COUNT(*) as count FROM laundry_orders WHERE status IN (?, ?)', ['pending', 'in-progress']);
    const [activeRentals] = await db.query('SELECT COUNT(*) as count FROM suit_rentals WHERE rental_status IN (?, ?)', ['reserved', 'active']);
    
    // Revenue
    const [totalRevenue] = await db.query('SELECT SUM(amount) as total FROM payments WHERE payment_status = ?', ['completed']);
    const [monthlyRevenue] = await db.query(
      'SELECT SUM(amount) as total FROM payments WHERE payment_status = ? AND MONTH(payment_date) = MONTH(NOW()) AND YEAR(payment_date) = YEAR(NOW())',
      ['completed']
    );
    
    // Recent activities
    const [recentOrders] = await db.query(
      `SELECT lo.id, lo.order_number, lo.status, lo.total_amount, lo.created_at,
              u.full_name as customer_name
       FROM laundry_orders lo
       JOIN users u ON lo.customer_id = u.id
       ORDER BY lo.created_at DESC
       LIMIT 5`
    );
    
    const [recentRentals] = await db.query(
      `SELECT sr.id, sr.rental_number, sr.rental_status, sr.total_amount, sr.created_at,
              u.full_name as customer_name, s.name as suit_name
       FROM suit_rentals sr
       JOIN users u ON sr.customer_id = u.id
       JOIN suits s ON sr.suit_id = s.id
       ORDER BY sr.created_at DESC
       LIMIT 5`
    );
    
    res.json({
      success: true,
      data: {
        counts: {
          customers: customerCount[0].count,
          employees: employeeCount[0].count,
          orders: orderCount[0].count,
          rentals: rentalCount[0].count,
          activeOrders: activeOrders[0].count,
          activeRentals: activeRentals[0].count
        },
        revenue: {
          total: totalRevenue[0].total || 0,
          monthly: monthlyRevenue[0].total || 0
        },
        recentActivities: {
          orders: recentOrders,
          rentals: recentRentals
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Revenue report
export const getRevenueReport = async (req, res, next) => {
  try {
    const { start_date, end_date, group_by = 'day' } = req.query;
    
    let dateFormat;
    switch (group_by) {
      case 'month':
        dateFormat = '%Y-%m';
        break;
      case 'year':
        dateFormat = '%Y';
        break;
      default:
        dateFormat = '%Y-%m-%d';
    }
    
    let query = `
      SELECT 
        DATE_FORMAT(payment_date, ?) as period,
        payment_type,
        COUNT(*) as transaction_count,
        SUM(amount) as total_amount
      FROM payments
      WHERE payment_status = 'completed'
    `;
    
    const params = [dateFormat];
    
    if (start_date) {
      query += ' AND payment_date >= ?';
      params.push(start_date);
    }
    
    if (end_date) {
      query += ' AND payment_date <= ?';
      params.push(end_date);
    }
    
    query += ' GROUP BY period, payment_type ORDER BY period DESC';
    
    const [report] = await db.query(query, params);
    
    // Summary
    const [summary] = await db.query(
      `SELECT 
         payment_type,
         COUNT(*) as count,
         SUM(amount) as total
       FROM payments
       WHERE payment_status = 'completed'
       ${start_date ? 'AND payment_date >= ?' : ''}
       ${end_date ? 'AND payment_date <= ?' : ''}
       GROUP BY payment_type`,
      [...(start_date ? [start_date] : []), ...(end_date ? [end_date] : [])]
    );
    
    res.json({
      success: true,
      data: {
        details: report,
        summary
      }
    });
  } catch (error) {
    next(error);
  }
};

// Inventory report
export const getInventoryReport = async (req, res, next) => {
  try {
    // Suit availability
    const [availability] = await db.query(
      `SELECT 
         is_available,
         COUNT(*) as count
       FROM suits
       GROUP BY is_available`
    );
    
    // Category distribution
    const [categories] = await db.query(
      `SELECT 
         sc.name as category,
         COUNT(s.id) as total_suits,
         SUM(CASE WHEN s.is_available = TRUE THEN 1 ELSE 0 END) as available_suits
       FROM suit_categories sc
       LEFT JOIN suits s ON sc.id = s.category_id
       GROUP BY sc.id, sc.name`
    );
    
    // Condition status
    const [conditions] = await db.query(
      `SELECT 
         condition_status,
         COUNT(*) as count
       FROM suits
       GROUP BY condition_status`
    );
    
    // Most rented suits
    const [topRented] = await db.query(
      `SELECT 
         s.id, s.name, s.suit_code, s.total_rentals,
         sc.name as category,
         COUNT(sr.id) as active_rentals
       FROM suits s
       JOIN suit_categories sc ON s.category_id = sc.id
       LEFT JOIN suit_rentals sr ON s.id = sr.suit_id AND sr.rental_status IN ('reserved', 'active')
       GROUP BY s.id
       ORDER BY s.total_rentals DESC
       LIMIT 10`
    );
    
    // Low activity suits (slow-moving)
    const [lowActivity] = await db.query(
      `SELECT 
         s.id, s.name, s.suit_code, s.total_rentals, s.last_rented_date,
         sc.name as category,
         DATEDIFF(NOW(), COALESCE(s.last_rented_date, s.created_at)) as days_since_last_rental
       FROM suits s
       JOIN suit_categories sc ON s.category_id = sc.id
       WHERE s.is_available = TRUE
       ORDER BY s.total_rentals ASC, days_since_last_rental DESC
       LIMIT 10`
    );
    
    res.json({
      success: true,
      data: {
        availability,
        categories,
        conditions,
        fastMoving: topRented,
        slowMoving: lowActivity
      }
    });
  } catch (error) {
    next(error);
  }
};

// Order statistics
export const getOrderStatistics = async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;
    
    let dateFilter = '';
    const params = [];
    
    if (start_date) {
      dateFilter += ' AND created_at >= ?';
      params.push(start_date);
    }
    
    if (end_date) {
      dateFilter += ' AND created_at <= ?';
      params.push(end_date);
    }
    
    // Status distribution
    const [statusDist] = await db.query(
      `SELECT status, COUNT(*) as count FROM laundry_orders WHERE 1=1 ${dateFilter} GROUP BY status`,
      params
    );
    
    // Order type distribution
    const [typeDist] = await db.query(
      `SELECT order_type, COUNT(*) as count FROM laundry_orders WHERE 1=1 ${dateFilter} GROUP BY order_type`,
      params
    );
    
    // Popular cleaning types
    const [popularTypes] = await db.query(
      `SELECT ct.name, COUNT(lo.id) as count, SUM(lo.total_amount) as revenue
       FROM laundry_orders lo
       JOIN cleaning_types ct ON lo.cleaning_type_id = ct.id
       WHERE 1=1 ${dateFilter}
       GROUP BY ct.id, ct.name
       ORDER BY count DESC`,
      params
    );
    
    // Service time preferences
    const [servicePreferences] = await db.query(
      `SELECT st.name, COUNT(lo.id) as count
       FROM laundry_orders lo
       JOIN service_times st ON lo.service_time_id = st.id
       WHERE 1=1 ${dateFilter}
       GROUP BY st.id, st.name
       ORDER BY count DESC`,
      params
    );
    
    // Top customers
    const [topCustomers] = await db.query(
      `SELECT u.id, u.full_name, u.email,
              COUNT(lo.id) as order_count,
              SUM(lo.total_amount) as total_spent
       FROM users u
       JOIN laundry_orders lo ON u.id = lo.customer_id
       WHERE 1=1 ${dateFilter}
       GROUP BY u.id
       ORDER BY total_spent DESC
       LIMIT 10`,
      params
    );
    
    res.json({
      success: true,
      data: {
        statusDistribution: statusDist,
        typeDistribution: typeDist,
        popularCleaningTypes: popularTypes,
        serviceTimePreferences: servicePreferences,
        topCustomers
      }
    });
  } catch (error) {
    next(error);
  }
};

// Rental statistics
export const getRentalStatistics = async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;
    
    let dateFilter = '';
    const params = [];
    
    if (start_date) {
      dateFilter += ' AND created_at >= ?';
      params.push(start_date);
    }
    
    if (end_date) {
      dateFilter += ' AND created_at <= ?';
      params.push(end_date);
    }
    
    // Status distribution
    const [statusDist] = await db.query(
      `SELECT rental_status, COUNT(*) as count FROM suit_rentals WHERE 1=1 ${dateFilter} GROUP BY rental_status`,
      params
    );
    
    // Overdue rentals
    const [overdueRentals] = await db.query(
      `SELECT sr.*, u.full_name as customer_name, u.phone as customer_phone, s.name as suit_name
       FROM suit_rentals sr
       JOIN users u ON sr.customer_id = u.id
       JOIN suits s ON sr.suit_id = s.id
       WHERE sr.rental_status = 'active' AND sr.rental_end_date < NOW()
       ORDER BY sr.rental_end_date ASC`
    );
    
    // Average rental duration
    const [avgDuration] = await db.query(
      `SELECT AVG(rental_days) as avg_days FROM suit_rentals WHERE 1=1 ${dateFilter}`,
      params
    );
    
    res.json({
      success: true,
      data: {
        statusDistribution: statusDist,
        overdueRentals,
        averageRentalDays: avgDuration[0].avg_days || 0
      }
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getDashboardStats,
  getCustomerDashboardStats,
  getRevenueReport,
  getInventoryReport,
  getOrderStatistics,
  getRentalStatistics
};
