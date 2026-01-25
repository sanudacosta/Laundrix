import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import { 
  Package, Calendar, MapPin, Clock, CheckCircle, XCircle,
  TrendingUp, RefreshCw, Eye, Truck
} from 'lucide-react';
import { orderAPI } from '../../services/apiService';
import { formatCurrency } from '../../utils/constants';

const MyOrders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await orderAPI.getMyOrders();
      console.log('Full orders response:', JSON.stringify(response, null, 2));
      // Handle different response structures
      const ordersData = response?.data?.data || response?.data || [];
      console.log('Extracted orders:', ordersData);
      setOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Confirmed': 'bg-blue-100 text-blue-800',
      'Picked Up': 'bg-purple-100 text-purple-800',
      'Processing': 'bg-indigo-100 text-indigo-800',
      'Quality Check': 'bg-cyan-100 text-cyan-800',
      'Out for Delivery': 'bg-green-100 text-green-800',
      'Completed': 'bg-gray-100 text-gray-800',
      'Cancelled': 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'Pending': Clock,
      'Confirmed': CheckCircle,
      'Picked Up': Package,
      'Processing': RefreshCw,
      'Quality Check': CheckCircle,
      'Out for Delivery': Truck,
      'Completed': CheckCircle,
      'Cancelled': XCircle,
    };
    const Icon = icons[status] || Package;
    return <Icon className="w-5 h-5" />;
  };

  const filteredOrders = (Array.isArray(orders) ? orders : []).filter(order => {
    if (filter === 'all') return true;
    if (filter === 'active') return !['Completed', 'Cancelled'].includes(order.status);
    if (filter === 'completed') return order.status === 'Completed';
    return true;
  });

  const getOrderProgress = (status) => {
    const stages = ['Pending', 'Picked Up', 'Processing', 'Quality Check', 'Out for Delivery', 'Completed'];
    const currentIndex = stages.indexOf(status);
    return ((currentIndex + 1) / stages.length) * 100;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Package className="w-8 h-8 text-blue-600 mr-3" />
            My Orders
          </h1>
          <p className="text-gray-600 mt-2">Track and manage your laundry orders</p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 inline-flex space-x-2 bg-white rounded-lg p-1 shadow-sm border border-gray-100">
          {[
            { key: 'all', label: 'All Orders', count: orders.length },
            { key: 'active', label: 'Active', count: orders.filter(o => !['Completed', 'Cancelled'].includes(o.status)).length },
            { key: 'completed', label: 'Completed', count: orders.filter(o => o.status === 'Completed').length },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                filter === tab.key
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">Order #{order.id?.toString().padStart(6, '0')}</h3>
                    <p className="text-sm text-gray-600">{order.cleaning_type?.name || 'Laundry Service'}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Placed on {new Date(order.created_at).toLocaleDateString('en-LK', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2 ${
                  getStatusColor(order.status)
                }`}>
                  {getStatusIcon(order.status)}
                  <span>{order.status}</span>
                </span>
              </div>

              {/* Progress Bar */}
              {!['Completed', 'Cancelled'].includes(order.status) && (
                <div className="mb-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${getOrderProgress(order.status)}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-gray-500">Pickup</p>
                    <p className="font-medium text-gray-900">{new Date(order.pickup_date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Truck className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-gray-500">Delivery</p>
                    <p className="font-medium text-gray-900">{new Date(order.delivery_date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-gray-500">Amount</p>
                    <p className="font-medium text-gray-900">{formatCurrency(order.total_amount)}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <button
                  onClick={() => setSelectedOrder(order)}
                  className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Details</span>
                </button>
                {order.status === 'Completed' && (
                  <button
                    onClick={() => navigate('/customer/place-order')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Reorder
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600 mb-6">Start by placing your first order</p>
            <button
              onClick={() => navigate('/customer/place-order')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Place New Order
            </button>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Order Number & Status */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-gray-900 text-lg">Order #{selectedOrder.order_number || selectedOrder.id?.toString().padStart(6, '0')}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold inline-flex items-center space-x-1 ${
                    getStatusColor(selectedOrder.status)
                  }`}>
                    {getStatusIcon(selectedOrder.status)}
                    <span>{selectedOrder.status}</span>
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  Placed on {new Date(selectedOrder.created_at).toLocaleDateString('en-US', { 
                    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                  })}
                </div>
              </div>

              {/* Service Details */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide text-blue-600">Service Details</h4>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Cleaning Type</p>
                    <p className="font-semibold text-gray-900">{selectedOrder.cleaning_type || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Service Speed</p>
                    <p className="font-semibold text-gray-900">{selectedOrder.service_time || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Quantity</p>
                    <p className="font-semibold text-gray-900">{selectedOrder.quantity} items</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Weight</p>
                    <p className="font-semibold text-gray-900">{selectedOrder.weight_kg} kg</p>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide text-green-600">Payment Information</h4>
                <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-700 font-medium">Order Amount</span>
                    <span className="font-bold text-2xl text-green-700">{formatCurrency(selectedOrder.total_amount)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 font-medium">Payment Status</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      selectedOrder.payment_status === 'paid' ? 'bg-green-600 text-white' : 
                      selectedOrder.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {selectedOrder.payment_status?.toUpperCase() || 'PENDING'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Schedule Details */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide text-purple-600">Schedule</h4>
                <div className="grid grid-cols-2 gap-4 bg-purple-50 p-4 rounded-xl border border-purple-200">
                  <div>
                    <p className="text-sm text-gray-600 mb-1 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      Pickup Date
                    </p>
                    <p className="font-semibold text-gray-900">
                      {selectedOrder.pickup_date ? new Date(selectedOrder.pickup_date).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      }) : 'Not scheduled'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1 flex items-center">
                      <Truck className="w-3 h-3 mr-1" />
                      Expected Delivery
                    </p>
                    <p className="font-semibold text-gray-900">
                      {selectedOrder.expected_delivery_date ? new Date(selectedOrder.expected_delivery_date).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric'
                      }) : 'TBD'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Addresses */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide text-orange-600">Addresses</h4>
                <div className="space-y-3">
                  <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
                    <p className="text-sm text-gray-600 mb-2 font-semibold flex items-center">
                      <MapPin className="w-4 h-4 mr-1 text-orange-600" />
                      Pickup Address
                    </p>
                    <p className="text-gray-900 pl-5">{selectedOrder.pickup_address || 'N/A'}</p>
                  </div>

                  <div className="bg-teal-50 p-4 rounded-xl border border-teal-200">
                    <p className="text-sm text-gray-600 mb-2 font-semibold flex items-center">
                      <Truck className="w-4 h-4 mr-1 text-teal-600" />
                      Delivery Address
                    </p>
                    <p className="text-gray-900 pl-5">{selectedOrder.delivery_address || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {selectedOrder.special_instructions && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm uppercase tracking-wide text-amber-600">Special Instructions</h4>
                  <p className="text-gray-900 bg-amber-50 border border-amber-200 p-4 rounded-xl text-sm leading-relaxed">{selectedOrder.special_instructions}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrders;
