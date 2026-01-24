import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { Shirt, Calendar, MapPin, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { rentalAPI } from '../../services/apiService';

const MyRentals = () => {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedRental, setSelectedRental] = useState(null);

  useEffect(() => {
    fetchRentals();
  }, []);

  const fetchRentals = async () => {
    try {
      setLoading(true);
      const response = await rentalAPI.getMyRentals();
      console.log('Full rentals response:', JSON.stringify(response, null, 2));
      const rentalsData = response?.data?.data || response?.data || [];
      console.log('Extracted rentals:', rentalsData);
      setRentals(Array.isArray(rentalsData) ? rentalsData : []);
    } catch (error) {
      console.error('Error fetching rentals:', error);
      setRentals([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Active': 'bg-green-100 text-green-700',
      'Pending': 'bg-yellow-100 text-yellow-700',
      'Completed': 'bg-gray-100 text-gray-700',
      'Overdue': 'bg-red-100 text-red-700',
      'Cancelled': 'bg-gray-100 text-gray-500'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'Active': CheckCircle,
      'Pending': Clock,
      'Completed': CheckCircle,
      'Overdue': AlertCircle,
      'Cancelled': XCircle
    };
    const Icon = icons[status] || Shirt;
    return <Icon className="w-5 h-5" />;
  };

  const calculateDaysRemaining = (endDate) => {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatCurrency = (amount) => {
    return `LKR ${parseFloat(amount).toFixed(2)}`;
  };

  const filteredRentals = (Array.isArray(rentals) ? rentals : []).filter(rental => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'active') return rental.rental_status === 'Active' || rental.rental_status === 'Pending';
    if (activeFilter === 'past') return rental.rental_status === 'Completed' || rental.rental_status === 'Cancelled';
    return true;
  });

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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Rentals</h1>
          <p className="text-gray-600">Track your suit rentals and returns</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-2 mb-8 bg-white rounded-xl p-2 shadow-sm border border-gray-100">
          {[
            { id: 'all', label: 'All Rentals' },
            { id: 'active', label: 'Active' },
            { id: 'past', label: 'Past' }
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

        {/* Rentals List */}
        {filteredRentals.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl">
            <Shirt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No rentals found</h3>
            <p className="text-gray-600 mb-6">You haven't rented any suits yet</p>
            <a
              href="/browse-suits"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
            >
              Browse Suits
            </a>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRentals.map(rental => {
              const daysRemaining = calculateDaysRemaining(rental.end_date);
              const isOverdue = daysRemaining < 0 && rental.rental_status === 'Active';

              return (
                <div
                  key={rental.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => setSelectedRental(rental)}
                >
                  {rental.suit?.image_url ? (
                    <img
                      src={rental.suit.image_url}
                      alt={rental.suit.brand}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                      <Shirt className="w-20 h-20 text-blue-400" />
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-bold text-lg text-gray-900">
                        {rental.suit?.brand || 'Suit'}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium inline-flex items-center space-x-1 ${
                        getStatusColor(isOverdue ? 'Overdue' : rental.rental_status)
                      }`}>
                        {getStatusIcon(isOverdue ? 'Overdue' : rental.rental_status)}
                        <span>{isOverdue ? 'Overdue' : rental.rental_status}</span>
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>
                          {new Date(rental.start_date).toLocaleDateString()} - {new Date(rental.end_date).toLocaleDateString()}
                        </span>
                      </div>

                      {rental.rental_status === 'Active' && (
                        <div className="flex items-center text-sm">
                          <Clock className="w-4 h-4 mr-2" />
                          <span className={daysRemaining < 3 ? 'text-red-600 font-medium' : 'text-gray-600'}>
                            {daysRemaining > 0 
                              ? `${daysRemaining} days remaining`
                              : `${Math.abs(daysRemaining)} days overdue`
                            }
                          </span>
                        </div>
                      )}

                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span className="truncate">{rental.delivery_address}</span>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Rental Amount</span>
                        <span className="font-bold text-gray-900">
                          {formatCurrency(rental.rental_amount)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Deposit</span>
                        <span className={`font-medium ${
                          rental.deposit_status === 'Refunded' ? 'text-green-600' : 'text-gray-900'
                        }`}>
                          {formatCurrency(rental.deposit_amount)}
                          {rental.deposit_status === 'Refunded' && (
                            <span className="text-xs ml-1">(Refunded)</span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Rental Details Modal */}
      {selectedRental && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  Rental #{selectedRental.id?.toString().padStart(6, '0')}
                </h2>
                <button
                  onClick={() => setSelectedRental(null)}
                  className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Suit Info */}
              {selectedRental.suit?.image_url && (
                <img
                  src={selectedRental.suit.image_url}
                  alt={selectedRental.suit.brand}
                  className="w-full h-64 object-cover rounded-xl"
                />
              )}

              <div>
                <h3 className="font-bold text-gray-900 mb-2">
                  {selectedRental.suit?.brand || 'Suit'}
                </h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium inline-flex items-center space-x-1 ${
                  getStatusColor(selectedRental.rental_status)
                }`}>
                  {getStatusIcon(selectedRental.rental_status)}
                  <span>{selectedRental.rental_status}</span>
                </span>
              </div>

              {/* Rental Details */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-bold text-gray-900 mb-3">Rental Period</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Start Date</p>
                    <p className="font-medium">{new Date(selectedRental.start_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">End Date</p>
                    <p className="font-medium">{new Date(selectedRental.end_date).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Occasion & Address */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Occasion</p>
                  <p className="font-medium">{selectedRental.occasion}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Suit Size</p>
                  <p className="font-medium">{selectedRental.suit?.size || 'N/A'}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Delivery Address</p>
                <p className="font-medium">{selectedRental.delivery_address}</p>
              </div>

              {selectedRental.special_instructions && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Special Instructions</p>
                  <p className="font-medium">{selectedRental.special_instructions}</p>
                </div>
              )}

              {/* Financial Summary */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-bold text-gray-900 mb-3">Financial Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rental Amount</span>
                    <span className="font-medium">{formatCurrency(selectedRental.rental_amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Security Deposit</span>
                    <span className="font-medium">{formatCurrency(selectedRental.deposit_amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Deposit Status</span>
                    <span className={`font-medium ${
                      selectedRental.deposit_status === 'Refunded' ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {selectedRental.deposit_status}
                    </span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>Total Paid</span>
                    <span className="text-blue-600">
                      {formatCurrency(
                        parseFloat(selectedRental.rental_amount) + 
                        (selectedRental.deposit_status !== 'Refunded' ? parseFloat(selectedRental.deposit_amount) : 0)
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              {selectedRental.rental_status === 'Completed' && (
                <button
                  onClick={() => {
                    window.location.href = '/browse-suits';
                  }}
                  className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700"
                >
                  Rent Again
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyRentals;
