import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { CreditCard, DollarSign, CheckCircle, Clock, XCircle, Download, AlertCircle } from 'lucide-react';
import { paymentAPI } from '../../services/apiService';

const MyPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await paymentAPI.getMyPayments();
      console.log('Full payments response:', JSON.stringify(response, null, 2));
      const paymentsData = response?.data?.data || response?.data || [];
      console.log('Extracted payments:', paymentsData);
      setPayments(Array.isArray(paymentsData) ? paymentsData : []);
    } catch (error) {
      console.error('Error fetching payments:', error);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Completed': 'bg-green-100 text-green-700',
      'Pending': 'bg-yellow-100 text-yellow-700',
      'Failed': 'bg-red-100 text-red-700',
      'Refunded': 'bg-blue-100 text-blue-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'Completed': CheckCircle,
      'Pending': Clock,
      'Failed': XCircle,
      'Refunded': DollarSign
    };
    const Icon = icons[status] || CreditCard;
    return <Icon className="w-5 h-5" />;
  };

  const getPaymentMethodIcon = (method) => {
    if (!method) return <CreditCard className="w-6 h-6 text-gray-400" />;
    
    const methodLower = method.toLowerCase();
    if (methodLower.includes('card') || methodLower.includes('credit') || methodLower.includes('debit')) {
      return <CreditCard className="w-6 h-6 text-blue-600" />;
    }
    if (methodLower.includes('cash')) {
      return <DollarSign className="w-6 h-6 text-green-600" />;
    }
    return <CreditCard className="w-6 h-6 text-gray-600" />;
  };

  const formatCurrency = (amount) => {
    return `LKR ${parseFloat(amount).toFixed(2)}`;
  };

  const calculateStats = () => {
    const paymentsArray = Array.isArray(payments) ? payments : [];
    const completed = paymentsArray.filter(p => p.payment_status === 'Completed');
    const pending = paymentsArray.filter(p => p.payment_status === 'Pending');
    
    const totalSpent = completed.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
    const pendingAmount = pending.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
    
    return {
      totalSpent: totalSpent.toFixed(2),
      pendingAmount: pendingAmount.toFixed(2),
      completedCount: completed.length
    };
  };

  const filteredPayments = (Array.isArray(payments) ? payments : []).filter(payment => {
    if (activeFilter === 'all') return true;
    return payment.payment_status.toLowerCase() === activeFilter.toLowerCase();
  });

  const stats = calculateStats();

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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Payments</h1>
          <p className="text-gray-600">Track your payment history and transactions</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-500">Total Spent</h3>
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.totalSpent)}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-500">Pending Amount</h3>
              <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.pendingAmount)}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-500">Completed Payments</h3>
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.completedCount}</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-2 mb-8 bg-white rounded-xl p-2 shadow-sm border border-gray-100">
          {[
            { id: 'all', label: 'All Payments' },
            { id: 'pending', label: 'Pending' },
            { id: 'completed', label: 'Completed' },
            { id: 'failed', label: 'Failed' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
                activeFilter === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Payments List */}
        <div className="space-y-4">
          {filteredPayments.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl">
              <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No payments found</h3>
              <p className="text-gray-600">Your payment history will appear here</p>
            </div>
          ) : (
            filteredPayments.map(payment => (
              <div
                key={payment.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      payment.payment_status === 'Completed' ? 'bg-green-50' : 
                      payment.payment_status === 'Pending' ? 'bg-yellow-50' : 'bg-red-50'
                    }`}>
                      {getPaymentMethodIcon(payment.payment_method)}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">
                        Payment #{payment.id?.toString().padStart(6, '0')}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {payment.order_id ? `Order #${payment.order_id}` : payment.rental_id ? `Rental #${payment.rental_id}` : 'Payment'}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium inline-flex items-center space-x-1 ${
                    getStatusColor(payment.payment_status)
                  }`}>
                    {getStatusIcon(payment.payment_status)}
                    <span>{payment.payment_status}</span>
                  </span>
                </div>

                <div className="grid md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Amount</p>
                    <p className="font-bold text-xl text-gray-900">{formatCurrency(payment.amount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Payment Method</p>
                    <p className="font-medium capitalize">{payment.payment_method || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Date</p>
                    <p className="font-medium">
                      {new Date(payment.payment_date || payment.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {payment.transaction_id && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Transaction ID</p>
                      <p className="font-medium font-mono text-sm truncate">{payment.transaction_id}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <button
                    onClick={() => setSelectedPayment(payment)}
                    className="text-blue-600 font-semibold hover:text-blue-700"
                  >
                    View Details
                  </button>
                  {payment.payment_status === 'Pending' && (
                    <button
                      onClick={() => alert('Payment processing coming soon!')}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700"
                    >
                      Pay Now
                    </button>
                  )}
                  {payment.payment_status === 'Completed' && (
                    <button
                      onClick={() => alert('Receipt download coming soon!')}
                      className="bg-white border-2 border-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Receipt</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Payment Details Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Payment Details</h2>
                <button
                  onClick={() => setSelectedPayment(null)}
                  className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Payment #{selectedPayment.id?.toString().padStart(6, '0')}</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium inline-flex items-center space-x-1 ${
                  getStatusColor(selectedPayment.payment_status)
                }`}>
                  {getStatusIcon(selectedPayment.payment_status)}
                  <span>{selectedPayment.payment_status}</span>
                </span>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Amount</span>
                  <span className="font-bold text-2xl text-gray-900">{formatCurrency(selectedPayment.amount)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Payment Method</p>
                  <p className="font-medium capitalize">{selectedPayment.payment_method || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Payment Date</p>
                  <p className="font-medium">{new Date(selectedPayment.payment_date || selectedPayment.created_at).toLocaleDateString()}</p>
                </div>
                {selectedPayment.transaction_id && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500 mb-1">Transaction ID</p>
                    <p className="font-medium font-mono text-sm">{selectedPayment.transaction_id}</p>
                  </div>
                )}
                {selectedPayment.order_id && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Related Order</p>
                    <p className="font-medium">Order #{selectedPayment.order_id}</p>
                  </div>
                )}
                {selectedPayment.rental_id && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Related Rental</p>
                    <p className="font-medium">Rental #{selectedPayment.rental_id}</p>
                  </div>
                )}
              </div>

              {selectedPayment.payment_status === 'Completed' && (
                <button
                  onClick={() => alert('Receipt download coming soon!')}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Download className="w-5 h-5" />
                  <span>Download Receipt</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPayments;
