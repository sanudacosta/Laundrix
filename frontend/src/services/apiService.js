import api from './api';

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// Order APIs
export const orderAPI = {
  getAllOrders: (params) => api.get('/orders', { params }),
  getMyOrders: () => api.get('/orders/my-orders'),
  getOrderById: (id) => api.get(`/orders/${id}`),
  createOrder: (data) => api.post('/orders', data),
  updateOrderStatus: (id, data) => api.put(`/orders/${id}/status`, data),
  assignOrder: (id, data) => api.put(`/orders/${id}/assign`, data),
  getAssignedOrders: () => api.get('/orders/assigned'),
  deleteOrder: (id) => api.delete(`/orders/${id}`),
};

// Rental APIs
export const rentalAPI = {
  getAllSuits: (params) => api.get('/rental/suits', { params }),
  getSuitById: (id) => api.get(`/rental/suits/${id}`),
  getCategories: () => api.get('/rental/categories'),
  createRental: (data) => api.post('/rental/rentals', data),
  getMyRentals: () => api.get('/rental/my-rentals'),
  getAllRentals: (params) => api.get('/rental/rentals', { params }),
  getRentalById: (id) => api.get(`/rental/rentals/${id}`),
  updateRentalStatus: (id, data) => api.put(`/rental/rentals/${id}/status`, data),
};

// Payment APIs
export const paymentAPI = {
  createPayment: (data) => api.post('/payments', data),
  getMyPayments: () => api.get('/payments/my-payments'),
  getAllPayments: (params) => api.get('/payments', { params }),
  getPaymentById: (id) => api.get(`/payments/${id}`),
  createRefund: (id, data) => api.post(`/payments/${id}/refund`, data),
};

// Admin APIs
export const adminAPI = {
  getAllUsers: (params) => api.get('/admin/users', { params }),
  getUserById: (id) => api.get(`/admin/users/${id}`),
  createUser: (data) => api.post('/admin/users', data),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getCleaningTypes: () => api.get('/admin/cleaning-types'),
  updateCleaningType: (id, data) => api.put(`/admin/cleaning-types/${id}`, data),
  getServiceTimes: () => api.get('/admin/service-times'),
  updateServiceTime: (id, data) => api.put(`/admin/service-times/${id}`, data),
  createSuit: (data) => api.post('/admin/suits', data),
  updateSuit: (id, data) => api.put(`/admin/suits/${id}`, data),
  deleteSuit: (id) => api.delete(`/admin/suits/${id}`),
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data) => api.put('/admin/settings', data),
};

// Notification APIs
export const notificationAPI = {
  getNotifications: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/mark-all-read'),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
  sendBulkNotification: (data) => api.post('/notifications/bulk', data),
};

// Report APIs
export const reportAPI = {
  getDashboardStats: () => api.get('/reports/dashboard'),
  getRevenueReport: (params) => api.get('/reports/revenue', { params }),
  getInventoryReport: () => api.get('/reports/inventory'),
  getOrderStatistics: (params) => api.get('/reports/orders', { params }),
  getRentalStatistics: (params) => api.get('/reports/rentals', { params }),
};

export default {
  authAPI,
  orderAPI,
  rentalAPI,
  paymentAPI,
  adminAPI,
  notificationAPI,
  reportAPI,
};
