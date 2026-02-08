import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { Search, Sparkles, Calendar, Truck, CheckCircle, X, Info, Shirt, Tag } from 'lucide-react';
import { rentalAPI } from '../../services/apiService';
import { useAuth } from '../../context/AuthContext';

const BrowseSuits = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [suits, setSuits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSuit, setSelectedSuit] = useState(null);
  const [bookingModal, setBookingModal] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [availableSizes, setAvailableSizes] = useState([]);

  const [bookingData, setBookingData] = useState({
    size: '',
    start_date: '',
    end_date: '',
    occasion: '',
    delivery_address: user?.address || '',
    special_instructions: ''
  });

  useEffect(() => {
    fetchSuits();
  }, []);

  useEffect(() => {
    if (selectedSuit && bookingData.start_date && bookingData.end_date) {
      fetchAvailableSizes();
    }
  }, [bookingData.start_date, bookingData.end_date, selectedSuit]);

  const fetchSuits = async () => {
    try {
      setLoading(true);
      const response = await rentalAPI.getAllSuits();
      const suitsData = response?.data?.data || response?.data || [];
      setSuits(Array.isArray(suitsData) ? suitsData : []);
    } catch (error) {
      console.error('Error fetching suits:', error);
      toast.error('Failed to load suits');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSizes = async () => {
    if (!selectedSuit || !bookingData.start_date || !bookingData.end_date) return;

    try {
      const response = await rentalAPI.getAvailableSizes(
        selectedSuit.id,
        bookingData.start_date,
        bookingData.end_date
      );
      const sizesData = response?.data?.data || [];
      setAvailableSizes(sizesData);
      if (sizesData.length > 0) {
        setBookingData({ ...bookingData, size: sizesData[0].size });
      }
    } catch (error) {
      console.error('Error fetching sizes:', error);
      setAvailableSizes([]);
    }
  };

  const handleBookNow = (suit) => {
    setSelectedSuit(suit);
    setBookingData({
      size: '',
      start_date: '',
      end_date: '',
      occasion: '',
      delivery_address: user?.address || '',
      special_instructions: ''
    });
    setBookingModal(true);
  };

  const handleSubmitBooking = async (e) => {
    e.preventDefault();

    if (!bookingData.size || !bookingData.start_date || !bookingData.end_date || !bookingData.occasion) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setBookingLoading(true);
      await rentalAPI.createRental({
        product_id: selectedSuit.id,
        size: bookingData.size,
        start_date: bookingData.start_date,
        end_date: bookingData.end_date,
        occasion: bookingData.occasion,
        delivery_address: bookingData.delivery_address,
        special_instructions: bookingData.special_instructions
      });

      toast.success('Suit booked successfully!');
      setBookingModal(false);
      setSelectedSuit(null);
      fetchSuits();
      navigate('/customer/my-rentals');
    } catch (error) {
      console.error('Error booking suit:', error);
      toast.error(error.response?.data?.error || 'Failed to book suit');
    } finally {
      setBookingLoading(false);
    }
  };

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
    const rental = parseFloat(selectedSuit.rental_price_per_day) * days;
    const deposit = parseFloat(selectedSuit.deposit_amount || 3000);
    return {
      rental: rental.toFixed(2),
      deposit: deposit.toFixed(2),
      total: (rental + deposit).toFixed(2)
    };
  };

  const getMinStartDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getMinEndDate = () => {
    if (!bookingData.start_date) return getMinStartDate();
    const start = new Date(bookingData.start_date);
    start.setDate(start.getDate() + 1);
    return start.toISOString().split('T')[0];
  };

  const categories = ['all', 'Wedding', 'Business', 'Casual', 'Formal', 'Party'];

  const filteredSuits = suits.filter(suit => {
    const matchesSearch = suit.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         suit.category_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || suit.category_name === selectedCategory;
    const isAvailable = suit.available_size_count > 0;
    
    return matchesSearch && matchesCategory && isAvailable;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading suits...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <Navbar />

      <div className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <Shirt className="w-4 h-4 mr-2" />
              Premium Suit Rentals
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Find Your Perfect Suit</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Designer suits for weddings, business meetings, and special occasions. Easy booking, perfect fit guaranteed.</p>
          </div>

          {/* Search & Filters */}
          <div className="bg-white rounded-3xl shadow-xl p-6 mb-8 border border-gray-100">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Search */}
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by brand or category..."
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
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
            </div>

            <div className="mt-4 flex items-center justify-between">
              <p className="text-gray-600 text-sm">
                Showing <span className="font-bold text-gray-900">{filteredSuits.length}</span> available suits
              </p>
              <button
                onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear filters
              </button>
            </div>
          </div>

          {/* Suits Grid */}
          {filteredSuits.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-gray-300">
              <Shirt className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No suits found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search or filters</p>
              <button
                onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSuits.map(suit => (
                <div
                  key={suit.id}
                  className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all group"
                >
                  {/* Image */}
                  <div className="relative h-72 overflow-hidden bg-gray-100">
                    {suit.image_url ? (
                      <img
                        src={suit.image_url}
                        alt={suit.brand}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                        <Shirt className="w-24 h-24 text-blue-300" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 bg-green-500 text-white rounded-full text-xs font-bold shadow-lg">
                        Available
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-gray-700 rounded-full text-xs font-bold shadow-lg">
                        {suit.category_name}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="font-bold text-xl text-gray-900 mb-2">{suit.brand}</h3>
                    <p className="text-gray-600 text-sm mb-3">{suit.color}</p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Starting at</p>
                        <p className="text-2xl font-bold text-blue-600">
                          LKR {parseFloat(suit.rental_price_per_day).toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">per day</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Sizes available</p>
                        <p className="text-xl font-bold text-gray-900">{suit.available_size_count}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleBookNow(suit)}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {bookingModal && selectedSuit && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full my-8 shadow-2xl">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-3xl flex items-center justify-between">
              <div className="text-white">
                <h2 className="text-2xl font-bold">{selectedSuit.brand}</h2>
                <p className="text-blue-100 text-sm">{selectedSuit.color} • {selectedSuit.category_name}</p>
              </div>
              <button
                onClick={() => { setBookingModal(false); setSelectedSuit(null); }}
                className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmitBooking} className="p-6 space-y-6">
              {/* Rental Dates */}
              <div>
                <div className="flex items-center mb-4">
                  <Calendar className="w-5 h-5 text-blue-600 mr-2" />
                  <h3 className="text-lg font-bold text-gray-900">Rental Period</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Start Date *</label>
                    <input
                      type="date"
                      min={getMinStartDate()}
                      value={bookingData.start_date}
                      onChange={(e) => setBookingData({ ...bookingData, start_date: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">End Date *</label>
                    <input
                      type="date"
                      min={getMinEndDate()}
                      value={bookingData.end_date}
                      onChange={(e) => setBookingData({ ...bookingData, end_date: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
                {calculateDuration() > 0 && (
                  <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      <strong>Rental Duration:</strong> {calculateDuration()} {calculateDuration() === 1 ? 'day' : 'days'}
                    </p>
                  </div>
                )}
              </div>

              {/* Size Selection */}
              {availableSizes.length > 0 && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Select Size *</label>
                  <div className="grid grid-cols-4 gap-3">
                    {availableSizes.map(sizeObj => (
                      <button
                        key={sizeObj.size}
                        type="button"
                        onClick={() => setBookingData({ ...bookingData, size: sizeObj.size })}
                        className={`py-3 rounded-xl border-2 font-bold transition-all ${
                          bookingData.size === sizeObj.size
                            ? 'border-blue-600 bg-blue-50 text-blue-600'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        {sizeObj.size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Occasion */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Occasion *</label>
                <select
                  value={bookingData.occasion}
                  onChange={(e) => setBookingData({ ...bookingData, occasion: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                  required
                >
                  <option value="">Select occasion</option>
                  <option value="Wedding">Wedding</option>
                  <option value="Business">Business Meeting</option>
                  <option value="Party">Party/Event</option>
                  <option value="Formal">Formal Event</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Delivery Address */}
              <div>
                <div className="flex items-center mb-2">
                  <Truck className="w-5 h-5 text-orange-600 mr-2" />
                  <label className="text-sm font-bold text-gray-700">Delivery Address *</label>
                </div>
                <textarea
                  value={bookingData.delivery_address}
                  onChange={(e) => setBookingData({ ...bookingData, delivery_address: e.target.value })}
                  placeholder="Enter your delivery address..."
                  rows="2"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 resize-none"
                  required
                />
              </div>

              {/* Special Instructions */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Special Instructions</label>
                <textarea
                  value={bookingData.special_instructions}
                  onChange={(e) => setBookingData({ ...bookingData, special_instructions: e.target.value })}
                  placeholder="Any special requirements or notes..."
                  rows="2"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              {/* Price Summary */}
              {calculateDuration() > 0 && (
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border-2 border-blue-200">
                  <div className="flex items-center mb-4">
                    <Info className="w-5 h-5 text-blue-600 mr-2" />
                    <h3 className="text-lg font-bold text-gray-900">Booking Summary</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-gray-700">
                      <span>Rental ({calculateDuration()} days):</span>
                      <span className="font-semibold">LKR {calculateTotal().rental}</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>Security Deposit:</span>
                      <span className="font-semibold">LKR {calculateTotal().deposit}</span>
                    </div>
                    <div className="border-t-2 border-blue-300 pt-2 mt-2">
                      <div className="flex justify-between text-xl font-bold text-gray-900">
                        <span>Total:</span>
                        <span className="text-blue-600">LKR {calculateTotal().total}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mt-3">*Security deposit will be refunded upon return</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={bookingLoading || availableSizes.length === 0}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-3"
              >
                {bookingLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
                    <span>Booking...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-6 h-6" />
                    <span>Confirm Booking</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrowseSuits;
