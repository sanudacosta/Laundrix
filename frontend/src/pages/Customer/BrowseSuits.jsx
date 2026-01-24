import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { Search, Filter, Shirt, Calendar, MapPin, X, ChevronLeft, ChevronRight, XCircle } from 'lucide-react';
import { rentalAPI } from '../../services/apiService';

const BrowseSuits = () => {
  const [suits, setSuits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState([5000, 14000]);
  const [selectedSuit, setSelectedSuit] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingData, setBookingData] = useState({
    start_date: '',
    end_date: '',
    occasion: '',
    delivery_address: '',
    special_instructions: ''
  });

  useEffect(() => {
    fetchSuits();
  }, []);

  const fetchSuits = async () => {
    try {
      setLoading(true);
      const response = await rentalAPI.getAllSuits();
      console.log('Full suits response:', JSON.stringify(response, null, 2));
      const suitsData = response?.data?.data || response?.data || [];
      console.log('Extracted suits:', suitsData);
      setSuits(Array.isArray(suitsData) ? suitsData : []);
    } catch (error) {
      console.error('Error fetching suits:', error);
      setSuits([]);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', 'Wedding', 'Business', 'Casual', 'Formal', 'Party'];

  const filteredSuits = (Array.isArray(suits) ? suits : []).filter(suit => {
    const matchesSearch = suit.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         suit.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || suit.category === selectedCategory;
    const matchesPrice = suit.rental_price >= priceRange[0] && suit.rental_price <= priceRange[1];
    const isAvailable = suit.status === 'Available';
    
    return matchesSearch && matchesCategory && matchesPrice && isAvailable;
  });

  const calculateDuration = () => {
    if (!bookingData.start_date || !bookingData.end_date) return 0;
    const start = new Date(bookingData.start_date);
    const end = new Date(bookingData.end_date);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const calculateTotal = () => {
    if (!selectedSuit) return { rental: 0, deposit: 0, total: 0 };
    const days = calculateDuration();
    const rental = selectedSuit.rental_price * days;
    const deposit = 10000; // Fixed deposit
    return {
      rental: rental.toFixed(2),
      deposit: deposit.toFixed(2),
      total: (rental + deposit).toFixed(2)
    };
  };

  const handleBooking = async () => {
    try {
      const days = calculateDuration();
      if (days <= 0) {
        alert('Please select valid dates');
        return;
      }

      await rentalAPI.createRental({
        suit_id: selectedSuit.id,
        ...bookingData,
        rental_amount: parseFloat(calculateTotal().rental),
        deposit_amount: parseFloat(calculateTotal().deposit)
      });

      alert('Suit booked successfully!');
      setShowBookingModal(false);
      setSelectedSuit(null);
      setBookingData({
        start_date: '',
        end_date: '',
        occasion: '',
        delivery_address: '',
        special_instructions: ''
      });
      fetchSuits();
    } catch (error) {
      console.error('Error booking suit:', error);
      alert(error.response?.data?.error || 'Failed to book suit');
    }
  };

  const formatCurrency = (amount) => {
    return `LKR ${parseFloat(amount).toFixed(2)}`;
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Browse Suits</h1>
          <p className="text-gray-600">Find the perfect suit for your occasion</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Search */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by brand or category..."
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Price Range: {formatCurrency(priceRange[0])} - {formatCurrency(priceRange[1])}
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="5000"
                  max="14000"
                  step="1000"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                  className="flex-1"
                />
                <input
                  type="range"
                  min="5000"
                  max="14000"
                  step="1000"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing <span className="font-semibold">{filteredSuits.length}</span> suits
          </p>
        </div>

        {/* Suits Grid */}
        {filteredSuits.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl">
            <Shirt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No suits found</h3>
            <p className="text-gray-600">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSuits.map(suit => (
              <div
                key={suit.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all cursor-pointer"
                onClick={() => setSelectedSuit(suit)}
              >
                {suit.image_url ? (
                  <img
                    src={suit.image_url}
                    alt={suit.brand}
                    className="w-full h-64 object-cover"
                  />
                ) : (
                  <div className="w-full h-64 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                    <Shirt className="w-24 h-24 text-blue-400" />
                  </div>
                )}
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-xl text-gray-900">{suit.brand}</h3>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      Available
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-2">{suit.category}</p>
                  <p className="text-sm text-gray-500 mb-4">Size: {suit.size}</p>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Per day</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {formatCurrency(suit.rental_price)}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSuit(suit);
                        setShowBookingModal(true);
                      }}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Suit Details Modal */}
      {selectedSuit && !showBookingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">{selectedSuit.brand}</h2>
                <button
                  onClick={() => setSelectedSuit(null)}
                  className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {selectedSuit.image_url ? (
                <img
                  src={selectedSuit.image_url}
                  alt={selectedSuit.brand}
                  className="w-full h-96 object-cover rounded-xl mb-6"
                />
              ) : (
                <div className="w-full h-96 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center rounded-xl mb-6">
                  <Shirt className="w-32 h-32 text-blue-400" />
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-1">Category</h3>
                  <p className="text-lg text-gray-900">{selectedSuit.category}</p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-1">Size</h3>
                  <p className="text-lg text-gray-900">{selectedSuit.size}</p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-1">Rental Price</h3>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(selectedSuit.rental_price)} <span className="text-sm text-gray-500">/ day</span>
                  </p>
                </div>

                {selectedSuit.description && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 mb-1">Description</h3>
                    <p className="text-gray-700">{selectedSuit.description}</p>
                  </div>
                )}

                <button
                  onClick={() => setShowBookingModal(true)}
                  className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 mt-6"
                >
                  Book This Suit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && selectedSuit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Book {selectedSuit.brand}</h2>
                <button
                  onClick={() => {
                    setShowBookingModal(false);
                    setSelectedSuit(null);
                  }}
                  className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={bookingData.start_date}
                    onChange={(e) => setBookingData({ ...bookingData, start_date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={bookingData.end_date}
                    onChange={(e) => setBookingData({ ...bookingData, end_date: e.target.value })}
                    min={bookingData.start_date || new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {calculateDuration() > 0 && (
                <div className="bg-blue-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600">Rental Duration</p>
                  <p className="text-2xl font-bold text-blue-600">{calculateDuration()} days</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Occasion *
                </label>
                <select
                  value={bookingData.occasion}
                  onChange={(e) => setBookingData({ ...bookingData, occasion: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select occasion</option>
                  <option value="Wedding">Wedding</option>
                  <option value="Business Event">Business Event</option>
                  <option value="Party">Party</option>
                  <option value="Formal Event">Formal Event</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Delivery Address *
                </label>
                <textarea
                  value={bookingData.delivery_address}
                  onChange={(e) => setBookingData({ ...bookingData, delivery_address: e.target.value })}
                  placeholder="Enter delivery address..."
                  rows="3"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Special Instructions (Optional)
                </label>
                <textarea
                  value={bookingData.special_instructions}
                  onChange={(e) => setBookingData({ ...bookingData, special_instructions: e.target.value })}
                  placeholder="Any special requirements..."
                  rows="3"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Price Breakdown */}
              {calculateDuration() > 0 && (
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-bold text-lg text-gray-900 mb-4">Price Breakdown</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-gray-600">
                      <span>Rental ({calculateDuration()} days):</span>
                      <span>LKR {calculateTotal().rental}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Security Deposit:</span>
                      <span>LKR {calculateTotal().deposit}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-bold text-xl text-gray-900">
                      <span>Total:</span>
                      <span className="text-blue-600">LKR {calculateTotal().total}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    * Security deposit will be refunded upon safe return of the suit
                  </p>
                </div>
              )}

              <button
                onClick={handleBooking}
                disabled={!bookingData.start_date || !bookingData.end_date || !bookingData.occasion || !bookingData.delivery_address || calculateDuration() <= 0}
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrowseSuits;
