import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { Search, Filter, Shirt, Calendar, MapPin, X, ChevronLeft, ChevronRight, XCircle, ShoppingCart, Info } from 'lucide-react';
import { rentalAPI } from '../../services/apiService';

const BrowseSuits = () => {
  const [suits, setSuits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState([1500, 3000]);
  const [selectedSuit, setSelectedSuit] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [availableSizes, setAvailableSizes] = useState([]);
  const [selectedSize, setSelectedSize] = useState('');
  const [fetchingSizes, setFetchingSizes] = useState(false);
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

  useEffect(() => {
    fetchAvailableSizes();
  }, [bookingData.start_date, bookingData.end_date, selectedSuit, showBookingModal]);

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

  const fetchAvailableSizes = async () => {
    if (!selectedSuit || !bookingData.start_date || !bookingData.end_date) {
      setAvailableSizes([]);
      return;
    }

    try {
      setFetchingSizes(true);
      console.log('Fetching sizes for:', { productId: selectedSuit.id, start: bookingData.start_date, end: bookingData.end_date });
      const response = await rentalAPI.getAvailableSizes(
        selectedSuit.id,
        bookingData.start_date,
        bookingData.end_date
      );
      console.log('Available sizes response:', response);
      const sizesData = response?.data?.data || [];
      console.log('Sizes data:', sizesData);
      setAvailableSizes(sizesData);
      // Auto-select first available size
      if (sizesData.length > 0 && !selectedSize) {
        setSelectedSize(sizesData[0].size);
      } else if (sizesData.length === 0) {
        setSelectedSize('');
      }
    } catch (error) {
      console.error('Error fetching sizes:', error);
      setAvailableSizes([]);
      setSelectedSize('');
    } finally {
      setFetchingSizes(false);
    }
  };

  const categories = ['all', 'Wedding', 'Business', 'Casual', 'Formal', 'Party'];

  const filteredSuits = (Array.isArray(suits) ? suits : []).filter(suit => {
    const matchesSearch = suit.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         suit.category_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || suit.category_name === selectedCategory;
    const matchesPrice = suit.rental_price_per_day >= priceRange[0] && suit.rental_price_per_day <= priceRange[1];
    // In V2 schema, availability is determined by available_size_count from inventory
    const isAvailable = suit.available_size_count > 0;
    
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
    const rental = selectedSuit.rental_price_per_day * days;
    const deposit = 3000; // Fixed deposit
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

      if (!selectedSize) {
        alert('Please select a size');
        return;
      }

      await rentalAPI.createRental({
        product_id: selectedSuit.id,
        size: selectedSize,
        start_date: bookingData.start_date,
        end_date: bookingData.end_date,
        occasion: bookingData.occasion,
        delivery_address: bookingData.delivery_address,
        special_instructions: bookingData.special_instructions
      });

      alert('Suit booked successfully!');
      setShowBookingModal(false);
      setSelectedSuit(null);
      setSelectedSize('');
      setAvailableSizes([]);
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

  const handleAddToCart = async () => {
    try {
      const days = calculateDuration();
      if (days <= 0) {
        alert('Please select valid dates');
        return;
      }

      if (!selectedSize) {
        alert('Please select a size');
        return;
      }

      await rentalAPI.addToCart({
        product_id: selectedSuit.id,
        size: selectedSize,
        rental_start_date: bookingData.start_date,
        rental_end_date: bookingData.end_date,
        occasion: bookingData.occasion,
        delivery_address: bookingData.delivery_address,
        special_instructions: bookingData.special_instructions
      });

      alert('Added to cart successfully!');
      setShowBookingModal(false);
      setSelectedSuit(null);
      setSelectedSize('');
      setAvailableSizes([]);
      setBookingData({
        start_date: '',
        end_date: '',
        occasion: '',
        delivery_address: '',
        special_instructions: ''
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert(error.response?.data?.message || 'Failed to add to cart. Please try again.');
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
                  min="1500"
                  max="3000"
                  step="100"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                  className="flex-1"
                />
                <input
                  type="range"
                  min="1500"
                  max="3000"
                  step="100"
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
                  
                  <p className="text-gray-600 mb-2">{suit.category_name}</p>
                  <p className="text-sm text-gray-500 mb-4">
                    {suit.available_size_count} {suit.available_size_count === 1 ? 'size' : 'sizes'} available
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Per day</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {formatCurrency(suit.rental_price_per_day)}
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-5xl w-full my-8 shadow-2xl">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b bg-gray-50 rounded-t-2xl flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedSuit.brand}</h2>
                <p className="text-sm text-gray-500">{selectedSuit.color} | {selectedSuit.category_name}</p>
              </div>
              <button
                onClick={() => setSelectedSuit(null)}
                className="w-10 h-10 rounded-full hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Modal Body - Split Layout */}
            <div className="grid lg:grid-cols-2 gap-6 p-6">
              {/* Left Side - Image */}
              <div className="space-y-4">
                {selectedSuit.image_url ? (
                  <img
                    src={selectedSuit.image_url}
                    alt={selectedSuit.brand}
                    className="w-full h-[500px] object-cover rounded-xl shadow-lg"
                  />
                ) : (
                  <div className="w-full h-[500px] bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center rounded-xl shadow-lg">
                    <Shirt className="w-40 h-40 text-blue-400" />
                  </div>
                )}

                {/* Quick Info Cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-600 mb-1">Category</p>
                    <p className="font-bold text-sm text-gray-900">{selectedSuit.category_name}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-600 mb-1">Available Sizes</p>
                    <p className="font-bold text-lg text-gray-900">{selectedSuit.available_size_count}</p>
                  </div>
                </div>
              </div>

              {/* Right Side - Details */}
              <div className="space-y-6">
                {/* Price Section */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
                  <p className="text-sm opacity-90 mb-1">Rental Price</p>
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold">{formatCurrency(selectedSuit.rental_price_per_day)}</span>
                    <span className="text-lg ml-2 opacity-75">/ day</span>
                  </div>
                  <p className="text-sm mt-2 opacity-90">Deposit: {formatCurrency(selectedSuit.deposit_amount)}</p>
                </div>

                {/* Suit Details */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Brand</h3>
                      <p className="text-lg font-semibold text-gray-900">{selectedSuit.brand}</p>
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Color</h3>
                      <p className="text-lg text-gray-900">{selectedSuit.color}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Available Sizes</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedSuit.available_sizes ? (
                        selectedSuit.available_sizes.split(',').map((size, index) => (
                          <span key={index} className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-semibold text-sm">
                            {size.trim()}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500">Select dates to see available sizes</span>
                      )}
                    </div>
                  </div>

                  {selectedSuit.description && (
                    <div>
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Description</h3>
                      <p className="text-gray-700 leading-relaxed">{selectedSuit.description}</p>
                    </div>
                  )}

                  {/* Additional Info */}
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Condition:</span>
                      <span className="font-semibold text-gray-900 capitalize">{selectedSuit.condition_status}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Availability:</span>
                      <span className="font-semibold text-green-600">Available Now</span>
                    </div>
                    {selectedSuit.total_rentals > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total Rentals:</span>
                        <span className="font-semibold text-gray-900">{selectedSuit.total_rentals}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-4">
                  <button
                    onClick={() => setShowBookingModal(true)}
                    className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                  >
                    <Calendar className="w-5 h-5" />
                    <span>Book This Suit</span>
                  </button>
                  <button
                    onClick={() => setSelectedSuit(null)}
                    className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Continue Browsing
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && selectedSuit && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full my-8 shadow-2xl">
            {/* Modal Header - Sticky */}
            <div className="sticky top-0 z-10 px-6 py-4 border-b bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="text-white flex-1 pr-4">
                  <h2 className="text-2xl font-bold">Book: {selectedSuit.brand}</h2>
                  <p className="text-sm opacity-90">Complete the details below to reserve your suit</p>
                </div>
                <button
                  onClick={() => {
                    setShowBookingModal(false);
                    setSelectedSuit(null);
                  }}
                  className="flex-shrink-0 w-10 h-10 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Suit Summary Card */}
              <div className="bg-gray-50 rounded-xl p-4 flex items-center space-x-4">
                {selectedSuit.image_url ? (
                  <img
                    src={selectedSuit.image_url}
                    alt={selectedSuit.brand}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                    <Shirt className="w-10 h-10 text-blue-400" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900">{selectedSuit.brand}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                    <span>{selectedSuit.category_name}</span>
                    <span>•</span>
                    <span>{selectedSuit.color}</span>
                    <span>•</span>
                    <span className="font-semibold text-blue-600">{formatCurrency(selectedSuit.rental_price_per_day)}/day</span>
                  </div>
                </div>
              </div>

              {/* Rental Dates */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={bookingData.start_date}
                    onChange={(e) => setBookingData({ ...bookingData, start_date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={bookingData.end_date}
                    onChange={(e) => setBookingData({ ...bookingData, end_date: e.target.value })}
                    min={bookingData.start_date || new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              {/* Size Selector - Always visible with instructions */}
              <div className="border-2 border-blue-300 bg-blue-50/50 rounded-xl p-4">
                <label className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                  <Shirt className="w-4 h-4 mr-1" />
                  Select Size *
                </label>
                
                {!bookingData.start_date || !bookingData.end_date ? (
                  <div className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl bg-white text-blue-700 flex items-center">
                    <Calendar className="w-5 h-5 mr-2 flex-shrink-0" />
                    <span>Please select rental dates above to see available sizes</span>
                  </div>
                ) : fetchingSizes ? (
                  <div className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white text-gray-500 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
                    <span>Checking availability...</span>
                  </div>
                ) : availableSizes.length > 0 ? (
                  <div>
                    <select
                      value={selectedSize}
                      onChange={(e) => setSelectedSize(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-blue-300 rounded-xl focus:outline-none focus:border-blue-500 transition-colors bg-white"
                    >
                      <option value="">Select your size</option>
                      {availableSizes.map((sizeOption, index) => (
                        <option key={index} value={sizeOption.size}>
                          {sizeOption.size} - {sizeOption.condition_status}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-600 mt-1 ml-1">
                      {availableSizes.length} {availableSizes.length === 1 ? 'size' : 'sizes'} available for these dates
                    </p>
                  </div>
                ) : (
                  <div className="w-full px-4 py-3 border-2 border-red-200 rounded-xl bg-red-50 text-red-600 flex items-center">
                    <XCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                    <span>No sizes available for selected dates. Please choose different dates.</span>
                  </div>
                )}
                
                {selectedSize && (
                  <p className="text-xs text-green-600 mt-2 flex items-center font-semibold">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Size {selectedSize} is available for your selected dates
                  </p>
                )}
              </div>

              {calculateDuration() > 0 && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border-2 border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Rental Duration</p>
                      <p className="text-3xl font-bold text-blue-600">{calculateDuration()} days</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 mb-1">Daily Rate</p>
                      <p className="text-xl font-bold text-gray-900">{formatCurrency(selectedSuit.rental_price_per_day)}</p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Occasion *
                </label>
                <select
                  value={bookingData.occasion}
                  onChange={(e) => setBookingData({ ...bookingData, occasion: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
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
                <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  Delivery Address *
                </label>
                <textarea
                  value={bookingData.delivery_address}
                  onChange={(e) => setBookingData({ ...bookingData, delivery_address: e.target.value })}
                  placeholder="Enter your complete delivery address..."
                  rows="3"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Special Instructions (Optional)
                </label>
                <textarea
                  value={bookingData.special_instructions}
                  onChange={(e) => setBookingData({ ...bookingData, special_instructions: e.target.value })}
                  placeholder="Any special requirements or fitting notes..."
                  rows="3"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors resize-none"
                />
              </div>

              {/* Price Breakdown */}
              {calculateDuration() > 0 && (
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border-2 border-gray-200">
                  <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                    Price Breakdown
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-base">
                      <span className="text-gray-600">Rental Fee ({calculateDuration()} days × {formatCurrency(selectedSuit.rental_price_per_day)}):</span>
                      <span className="font-semibold text-gray-900">LKR {calculateTotal().rental}</span>
                    </div>
                    <div className="flex justify-between text-base">
                      <span className="text-gray-600">Security Deposit (Refundable):</span>
                      <span className="font-semibold text-gray-900">LKR {calculateTotal().deposit}</span>
                    </div>
                    <div className="border-t-2 border-gray-300 pt-3 flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">Total Amount:</span>
                      <span className="text-2xl font-bold text-blue-600">LKR {calculateTotal().total}</span>
                    </div>
                  </div>
                  <div className="mt-4 bg-blue-50 rounded-lg p-3">
                    <p className="text-xs text-blue-800 flex items-start">
                      <Info className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Security deposit will be fully refunded upon safe return of the suit in good condition.</span>
                    </p>
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={!bookingData.start_date || !bookingData.end_date || !selectedSize || !bookingData.occasion || !bookingData.delivery_address || calculateDuration() <= 0 || availableSizes.length === 0}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-xl font-bold text-lg hover:from-green-700 hover:to-green-800 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl disabled:shadow-none flex items-center justify-center space-x-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Add to Cart</span>
                </button>
                <button
                  onClick={handleBooking}
                  disabled={!bookingData.start_date || !bookingData.end_date || !selectedSize || !bookingData.occasion || !bookingData.delivery_address || calculateDuration() <= 0 || availableSizes.length === 0}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-blue-800 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl disabled:shadow-none flex items-center justify-center space-x-2"
                >
                  <span>Book Now</span>
                  {calculateDuration() > 0 && (
                    <span className="text-sm font-normal opacity-90">(LKR {calculateTotal().total})</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrowseSuits;
