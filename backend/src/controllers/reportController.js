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
      'SELECT COUNT(*) as count FROM payments WHERE customer_id = ? AND payment_status = ?',
      [customerId, 'pending']
    );
    
    // Upcoming rentals count
    const [upcomingRentals] = await db.query(
      'SELECT COUNT(*) as count FROM suit_rentals WHERE customer_id = ? AND rental_status IN (?, ?)',
      [customerId, 'reserved', 'active']
    );
    
    // Total spent
    const [totalSpent] = await db.query(
      'SELECT SUM(amount) as total FROM payments WHERE customer_id = ? AND payment_status = ?',
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
              u.full_name as customer_name, sp.name as suit_name
       FROM suit_rentals sr
       JOIN users u ON sr.customer_id = u.id
       JOIN suit_inventory si ON sr.inventory_id = si.id
       JOIN suit_products sp ON si.product_id = sp.id
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
        CASE 
          WHEN order_id IS NOT NULL THEN 'laundry'
          WHEN rental_id IS NOT NULL THEN 'rental'
          ELSE 'other'
        END as payment_type,
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
         CASE 
           WHEN order_id IS NOT NULL THEN 'laundry'
           WHEN rental_id IS NOT NULL THEN 'rental'
           ELSE 'other'
         END as payment_type,
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
       FROM suit_inventory
       GROUP BY is_available`
    );
    
    // Category distribution
    const [categories] = await db.query(
      `SELECT 
         sc.name as category,
         COUNT(DISTINCT si.product_id) as total_products,
         COUNT(si.id) as total_units,
         SUM(CASE WHEN si.is_available = TRUE THEN 1 ELSE 0 END) as available_units
       FROM suit_categories sc
       LEFT JOIN suit_products sp ON sc.id = sp.category_id
       LEFT JOIN suit_inventory si ON sp.id = si.product_id
       GROUP BY sc.id, sc.name`
    );
    
    // Condition status
    const [conditions] = await db.query(
      `SELECT 
         condition_status,
         COUNT(*) as count
       FROM suit_inventory
       GROUP BY condition_status`
    );
    
    // Most rented products
    const [topRented] = await db.query(
      `SELECT 
         sp.id, sp.name, sp.brand, sp.color,
         sc.name as category,
         SUM(si.total_rentals) as total_rentals,
         COUNT(DISTINCT sr.id) as active_rentals
       FROM suit_products sp
       JOIN suit_categories sc ON sp.category_id = sc.id
       JOIN suit_inventory si ON sp.id = si.product_id
       LEFT JOIN suit_rentals sr ON si.id = sr.inventory_id AND sr.rental_status IN ('reserved', 'active')
       GROUP BY sp.id
       ORDER BY total_rentals DESC
       LIMIT 10`
    );
    
    // Low activity products (slow-moving)
    const [lowActivity] = await db.query(
      `SELECT 
         sp.id, sp.name, sp.brand, sp.color,
         sc.name as category,
         SUM(si.total_rentals) as total_rentals,
         MAX(si.last_rented_date) as last_rented_date,
         DATEDIFF(NOW(), COALESCE(MAX(si.last_rented_date), sp.created_at)) as days_since_last_rental
       FROM suit_products sp
       JOIN suit_categories sc ON sp.category_id = sc.id
       JOIN suit_inventory si ON sp.id = si.product_id
       WHERE si.is_available = TRUE AND sp.is_active = TRUE
       GROUP BY sp.id
       ORDER BY total_rentals ASC, days_since_last_rental DESC
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
    let loDateFilter = '';
    const params = [];
    
    if (start_date) {
      dateFilter   += ' AND created_at >= ?';
      loDateFilter += ' AND lo.created_at >= ?';
      params.push(start_date);
    }
    
    if (end_date) {
      dateFilter   += ' AND created_at <= ?';
      loDateFilter += ' AND lo.created_at <= ?';
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
       WHERE 1=1 ${loDateFilter}
       GROUP BY ct.id, ct.name
       ORDER BY count DESC`,
      params
    );
    
    // Service time preferences
    const [servicePreferences] = await db.query(
      `SELECT st.name, COUNT(lo.id) as count
       FROM laundry_orders lo
       JOIN service_times st ON lo.service_time_id = st.id
       WHERE 1=1 ${loDateFilter}
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
       WHERE 1=1 ${loDateFilter}
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
      `SELECT sr.*, u.full_name as customer_name, u.phone as customer_phone, 
              sp.name as suit_name, sp.brand as suit_brand, sp.color as suit_color
       FROM suit_rentals sr
       JOIN users u ON sr.customer_id = u.id
       JOIN suit_inventory si ON sr.inventory_id = si.id
       JOIN suit_products sp ON si.product_id = sp.id
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

// Helper: build CSV string from array of objects
const toCSV = (rows, columns) => {
  const header = columns.map(c => `"${c.label}"`).join(',');
  const body = rows.map(row =>
    columns.map(c => {
      const val = row[c.key] ?? '';
      return `"${String(val).replace(/"/g, '""')}"`;
    }).join(',')
  );
  return [header, ...body].join('\r\n');
};

// Export Revenue Report as CSV
export const exportRevenueCSV = async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;
    const params = [];
    let dateFilter = "WHERE p.payment_status = 'completed'";

    if (start_date) { dateFilter += ' AND p.payment_date >= ?'; params.push(start_date); }
    if (end_date)   { dateFilter += ' AND p.payment_date <= ?'; params.push(end_date + ' 23:59:59'); }

    const [rows] = await db.query(
      `SELECT 
         p.payment_number,
         DATE_FORMAT(p.payment_date, '%Y-%m-%d %H:%i') AS payment_date,
         u.full_name AS customer_name,
         u.email AS customer_email,
         p.payment_method,
         CASE WHEN p.order_id IS NOT NULL THEN 'Laundry Order' WHEN p.rental_id IS NOT NULL THEN 'Suit Rental' ELSE 'Other' END AS payment_type,
         COALESCE(lo.order_number, '') AS order_number,
         COALESCE(sr.rental_number, '') AS rental_number,
         p.amount,
         p.payment_status,
         COALESCE(p.notes, '') AS notes
       FROM payments p
       JOIN users u ON p.customer_id = u.id
       LEFT JOIN laundry_orders lo ON p.order_id = lo.id
       LEFT JOIN suit_rentals sr ON p.rental_id = sr.id
       ${dateFilter}
       ORDER BY p.payment_date DESC`,
      params
    );

    const columns = [
      { key: 'payment_number',  label: 'Payment #' },
      { key: 'payment_date',    label: 'Date' },
      { key: 'customer_name',   label: 'Customer' },
      { key: 'customer_email',  label: 'Email' },
      { key: 'payment_type',    label: 'Type' },
      { key: 'order_number',    label: 'Order #' },
      { key: 'rental_number',   label: 'Rental #' },
      { key: 'payment_method',  label: 'Payment Method' },
      { key: 'amount',          label: 'Amount (LKR)' },
      { key: 'payment_status',  label: 'Status' },
      { key: 'notes',           label: 'Notes' },
    ];

    const csv = toCSV(rows, columns);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="revenue_report_${Date.now()}.csv"`);
    return res.send(csv);
  } catch (error) {
    next(error);
  }
};

// Export Orders Report as CSV
export const exportOrdersCSV = async (req, res, next) => {
  try {
    const { start_date, end_date, status } = req.query;
    const params = [];
    let dateFilter = 'WHERE 1=1';

    if (start_date) { dateFilter += ' AND lo.created_at >= ?'; params.push(start_date); }
    if (end_date)   { dateFilter += ' AND lo.created_at <= ?'; params.push(end_date + ' 23:59:59'); }
    if (status)     { dateFilter += ' AND lo.status = ?'; params.push(status); }

    const [rows] = await db.query(
      `SELECT 
         lo.order_number,
         DATE_FORMAT(lo.created_at, '%Y-%m-%d %H:%i') AS created_at,
         u.full_name AS customer_name,
         u.phone AS customer_phone,
         ct.name AS cleaning_type,
         st.name AS service_time,
         lo.item_description,
         lo.quantity,
         lo.weight_kg,
         lo.order_type,
         lo.status,
         lo.subtotal,
         lo.tax,
         lo.total_amount,
         lo.payment_status,
         DATE_FORMAT(lo.pickup_date, '%Y-%m-%d') AS pickup_date,
         DATE_FORMAT(lo.delivery_date, '%Y-%m-%d') AS delivery_date,
         COALESCE(e.full_name, 'Unassigned') AS assigned_employee,
         COALESCE(lo.special_instructions, '') AS special_instructions
       FROM laundry_orders lo
       JOIN users u ON lo.customer_id = u.id
       JOIN cleaning_types ct ON lo.cleaning_type_id = ct.id
       JOIN service_times st ON lo.service_time_id = st.id
       LEFT JOIN users e ON lo.assigned_employee_id = e.id
       ${dateFilter}
       ORDER BY lo.created_at DESC`,
      params
    );

    const columns = [
      { key: 'order_number',        label: 'Order #' },
      { key: 'created_at',          label: 'Date' },
      { key: 'customer_name',       label: 'Customer' },
      { key: 'customer_phone',      label: 'Phone' },
      { key: 'cleaning_type',       label: 'Cleaning Type' },
      { key: 'service_time',        label: 'Service Time' },
      { key: 'item_description',    label: 'Items' },
      { key: 'quantity',            label: 'Quantity' },
      { key: 'weight_kg',           label: 'Weight (kg)' },
      { key: 'order_type',          label: 'Order Type' },
      { key: 'status',              label: 'Status' },
      { key: 'subtotal',            label: 'Subtotal (LKR)' },
      { key: 'tax',                 label: 'Tax (LKR)' },
      { key: 'total_amount',        label: 'Total (LKR)' },
      { key: 'payment_status',      label: 'Payment Status' },
      { key: 'pickup_date',         label: 'Pickup Date' },
      { key: 'delivery_date',       label: 'Delivery Date' },
      { key: 'assigned_employee',   label: 'Assigned Employee' },
      { key: 'special_instructions',label: 'Instructions' },
    ];

    const csv = toCSV(rows, columns);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="orders_report_${Date.now()}.csv"`);
    return res.send(csv);
  } catch (error) {
    next(error);
  }
};

// Export Rentals Report as CSV
export const exportRentalsCSV = async (req, res, next) => {
  try {
    const { start_date, end_date, rental_status } = req.query;
    const params = [];
    let dateFilter = 'WHERE 1=1';

    if (start_date)     { dateFilter += ' AND sr.created_at >= ?'; params.push(start_date); }
    if (end_date)       { dateFilter += ' AND sr.created_at <= ?'; params.push(end_date + ' 23:59:59'); }
    if (rental_status)  { dateFilter += ' AND sr.rental_status = ?'; params.push(rental_status); }

    const [rows] = await db.query(
      `SELECT 
         sr.rental_number,
         DATE_FORMAT(sr.created_at, '%Y-%m-%d %H:%i') AS created_at,
         u.full_name AS customer_name,
         u.phone AS customer_phone,
         sp.name AS suit_name,
         sp.brand AS suit_brand,
         sp.color AS suit_color,
         si.size AS suit_size,
         sc.name AS category,
         DATE_FORMAT(sr.rental_start_date, '%Y-%m-%d') AS rental_start_date,
         DATE_FORMAT(sr.rental_end_date, '%Y-%m-%d') AS rental_end_date,
         sr.rental_days,
         sr.rental_amount,
         sr.deposit_amount,
         sr.late_fee,
         sr.damage_fee,
         sr.total_amount,
         sr.payment_status,
         sr.rental_status,
         COALESCE(sr.occasion, '') AS occasion,
         COALESCE(e.full_name, 'Unassigned') AS assigned_employee,
         COALESCE(sr.notes, '') AS notes
       FROM suit_rentals sr
       JOIN users u ON sr.customer_id = u.id
       JOIN suit_inventory si ON sr.inventory_id = si.id
       JOIN suit_products sp ON si.product_id = sp.id
       JOIN suit_categories sc ON sp.category_id = sc.id
       LEFT JOIN users e ON sr.assigned_employee_id = e.id
       ${dateFilter}
       ORDER BY sr.created_at DESC`,
      params
    );

    const columns = [
      { key: 'rental_number',     label: 'Rental #' },
      { key: 'created_at',        label: 'Date' },
      { key: 'customer_name',     label: 'Customer' },
      { key: 'customer_phone',    label: 'Phone' },
      { key: 'suit_name',         label: 'Suit' },
      { key: 'suit_brand',        label: 'Brand' },
      { key: 'suit_color',        label: 'Color' },
      { key: 'suit_size',         label: 'Size' },
      { key: 'category',          label: 'Category' },
      { key: 'rental_start_date', label: 'Start Date' },
      { key: 'rental_end_date',   label: 'End Date' },
      { key: 'rental_days',       label: 'Days' },
      { key: 'rental_amount',     label: 'Rental Amount (LKR)' },
      { key: 'deposit_amount',    label: 'Deposit (LKR)' },
      { key: 'late_fee',          label: 'Late Fee (LKR)' },
      { key: 'damage_fee',        label: 'Damage Fee (LKR)' },
      { key: 'total_amount',      label: 'Total (LKR)' },
      { key: 'payment_status',    label: 'Payment Status' },
      { key: 'rental_status',     label: 'Rental Status' },
      { key: 'occasion',          label: 'Occasion' },
      { key: 'assigned_employee', label: 'Assigned Employee' },
      { key: 'notes',             label: 'Notes' },
    ];

    const csv = toCSV(rows, columns);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="rentals_report_${Date.now()}.csv"`);
    return res.send(csv);
  } catch (error) {
    next(error);
  }
};

// Export Inventory Report as CSV
export const exportInventoryCSV = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT 
         sp.product_code,
         sp.name AS product_name,
         sp.brand,
         sp.color,
         sc.name AS category,
         si.size,
         si.suit_code,
         si.condition_status,
         CASE WHEN si.is_available THEN 'Available' ELSE 'Rented Out' END AS availability,
         si.total_rentals,
         DATE_FORMAT(si.last_rented_date, '%Y-%m-%d') AS last_rented_date,
         sp.rental_price_per_day,
         sp.deposit_amount,
         COALESCE(si.notes, '') AS notes
       FROM suit_inventory si
       JOIN suit_products sp ON si.product_id = sp.id
       JOIN suit_categories sc ON sp.category_id = sc.id
       ORDER BY sc.name, sp.name, si.size`
    );

    const columns = [
      { key: 'product_code',        label: 'Product Code' },
      { key: 'product_name',        label: 'Name' },
      { key: 'brand',               label: 'Brand' },
      { key: 'color',               label: 'Color' },
      { key: 'category',            label: 'Category' },
      { key: 'size',                label: 'Size' },
      { key: 'suit_code',           label: 'Suit Code' },
      { key: 'condition_status',    label: 'Condition' },
      { key: 'availability',        label: 'Availability' },
      { key: 'total_rentals',       label: 'Total Rentals' },
      { key: 'last_rented_date',    label: 'Last Rented' },
      { key: 'rental_price_per_day',label: 'Price/Day (LKR)' },
      { key: 'deposit_amount',      label: 'Deposit (LKR)' },
      { key: 'notes',               label: 'Notes' },
    ];

    const csv = toCSV(rows, columns);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="inventory_report_${Date.now()}.csv"`);
    return res.send(csv);
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
  getRentalStatistics,
  exportRevenueCSV,
  exportOrdersCSV,
  exportRentalsCSV,
  exportInventoryCSV
};
