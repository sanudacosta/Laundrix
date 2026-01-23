import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Package, Calendar, CreditCard, Shirt, TrendingUp, Clock,
  MapPin, Plus, ArrowRight, CheckCircle, AlertCircle
} from 'lucide-react';
import { reportAPI, orderAPI, paymentAPI, rentalAPI } from '../../services/apiService';
import { formatCurrency } from '../../utils/constants';

const CustomerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Use real backend APIs
      const [dashboardResponse, ordersResponse, paymentsResponse, rentalsResponse] = await Promise.all([
        reportAPI.getDashboardStats(),
        orderAPI.getMyOrders(),
        paymentAPI.getMyPayments(),
        rentalAPI.getMyRentals(),
      ]);

      const orders = ordersResponse.data || [];
      const payments = paymentsResponse.data || [];
      const rentals = rentalsResponse.data || [];

      // Calculate stats from real data
      const activeOrders = orders.filter(o => !['Completed', 'Cancelled'].includes(o.status)).length;
      const pendingPayments = payments.filter(p => p.status === 'Pending').length;
      const upcomingRentals = rentals.filter(r => ['Reserved', 'Active'].includes(r.status)).length;
      const totalSpent = payments.filter(p => p.status === 'Paid').reduce((sum, p) => sum + (p.amount || 0), 0);

      setStats({
        activeOrders,
        pendingPayments,
        upcomingRentals,
        totalSpent,
        recentOrders: orders.slice(0, 5), // Latest 5 orders
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set default empty stats on error
      setStats({
        activeOrders: 0,
        pendingPayments: 0,
        upcomingRentals: 0,
        totalSpent: 0,
        recentOrders: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: 'Active Orders',
      value: stats?.activeOrders || 0,
      icon: Package,
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
      link: '/customer/my-orders',
    },
    {
      title: 'Pending Payments',
      value: stats?.pendingPayments || 0,
      icon: CreditCard,
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-600',
      link: '/customer/my-payments',
    },
    {
      title: 'Upcoming Rentals',
      value: stats?.upcomingRentals || 0,
      icon: Shirt,
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600',
      link: '/customer/my-rentals',
    },
    {
      title: 'Total Spent',
      value: formatCurrency(stats?.totalSpent || 0),
      icon: TrendingUp,
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
    },
  ];

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Picked Up': 'bg-blue-100 text-blue-800',
      'Processing': 'bg-purple-100 text-purple-800',
      'Quality Check': 'bg-indigo-100 text-indigo-800',
      'Out for Delivery': 'bg-green-100 text-green-800',
      'Completed': 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-2xl font-bold text-blue-600">Laundrix</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.full_name}</span>
              <button
                onClick={logout}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's your laundry overview.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, index) => (
            <div
              key={index}
              onClick={() => stat.link && navigate(stat.link)}
              className={`bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all ${
                stat.link ? 'cursor-pointer' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
                {stat.link && (
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                )}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-sm text-gray-600">{stat.title}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Side - Recent Orders */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Orders</h2>
            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
              {stats?.recentOrders && stats.recentOrders.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {stats.recentOrders.map((order) => (
                    <div
                      key={order.id}
                      onClick={() => navigate('/customer/my-orders')}
                      className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Package className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{order.orderNumber}</h4>
                            <p className="text-sm text-gray-600">{order.service}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          {new Date(order.date).toLocaleDateString('en-LK', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                        <span className="font-semibold text-gray-900">{formatCurrency(order.total)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">No recent orders</p>
                  <button
                    onClick={() => navigate('/customer/place-order')}
                    className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Place Your First Order
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Quick Actions & Cards */}
          <div className="space-y-6">
            {/* Quick Actions Grid */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/customer/place-order"
                  className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition text-center group"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                    <Plus className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-900">New Order</p>
                </Link>
                <Link
                  to="/customer/browse-suits"
                  className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition text-center group"
                >
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                    <Shirt className="w-5 h-5 text-purple-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-900">Rent Suit</p>
                </Link>
              </div>
            </div>

            {/* Help Card */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-md">
              <h3 className="text-lg font-bold mb-2">Need Help?</h3>
              <p className="text-blue-100 text-sm mb-4">
                Our customer support is available 24/7 to assist you.
              </p>
              <button className="w-full bg-white text-blue-600 font-semibold py-2 px-4 rounded-lg hover:bg-blue-50 transition-colors">
                Contact Support
              </button>
            </div>

            {/* Tips Card */}
            <div className="bg-white rounded-2xl p-6 shadow-md">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Laundry Tips</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-600">Separate whites and colors</p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-600">Check pockets before sending</p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-600">Use express for urgent needs</p>
                </div>
              </div>
            </div>

            {/* Promo Card */}
            <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl p-6 text-white shadow-md">
              <div className="flex items-center space-x-2 mb-2">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm font-semibold">SPECIAL OFFER</span>
              </div>
              <h3 className="text-lg font-bold mb-2">20% Off Suit Rentals</h3>
              <p className="text-purple-100 text-sm mb-4">
                Book a suit rental this week and save 20%!
              </p>
              <button
                onClick={() => navigate('/customer/browse-suits')}
                className="w-full bg-white text-purple-600 font-semibold py-2 px-4 rounded-lg hover:bg-purple-50 transition-colors"
              >
                Browse Suits
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
