import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navbar from '../../components/Navbar';
import { Search, Filter, Shirt, Calendar, MapPin, X, ChevronLeft, ChevronRight, XCircle, ShoppingCart, Info } from 'lucide-react';
import { rentalAPI } from '../../services/apiService';
import { useAuth } from '../../context/AuthContext';

const BrowseSuits = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
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
  const [bookingLoading, setBookingLoading] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
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
    const rental = parseFloat(selectedSuit.rental_price_per_day) * days;
    const deposit = parseFloat(selectedSuit.deposit_amount || 3000);
    return {
      rental: rental.toFixed(2),
      deposit: deposit.toFixed(2),
      total: (rental + deposit).toFixed(2)
    };
  };

  const validateForm = () => {
    const errors = {};
    
    if (!bookingData.start_date) errors.start_date = 'Start date is required';
    if (!bookingData.end_date) errors.end_date = 'End date is required';
    if (calculateDuration() <= 0) errors.dates = 'End date must be after start date';
    if (!selectedSize) errors.size = 'Please select a size';
    if (!bookingData.occasion) errors.occasion = 'Please select an occasion';
    if (!bookingData.delivery_address?.trim()) errors.delivery_address = 'Delivery address is required';
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleBooking = async () => {
    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setBookingLoading(true);

      await rentalAPI.createRental({
        product_id: selectedSuit.id,
        size: selectedSize,
        start_date: bookingData.start_date,
        end_date: bookingData.end_date,
        occasion: bookingData.occasion,
        delivery_address: bookingData.delivery_address,
        special_instructions: bookingData.special_instructions
      });

      toast.success('Suit booked successfully!', { autoClose: 3000 });
      setShowBookingModal(false);
      setSelectedSuit(null);
      setSelectedSize('');
      setAvailableSizes([]);
      setValidationErrors({});
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
      toast.error(error.response?.data?.error || 'Failed to book suit');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setAddingToCart(true);

      await rentalAPI.addToCart({
        product_id: selectedSuit.id,
        size: selectedSize,
        rental_start_date: bookingData.start_date,
        rental_end_date: bookingData.end_date,
        occasion: bookingData.occasion,
        delivery_address: bookingData.delivery_address,
        special_instructions: bookingData.special_instructions
      });

      toast.success('Added to cart successfully!', { autoClose: 3000 });
      setShowBookingModal(false);
      setSelectedSuit(null);
      setSelectedSize('');
      setAvailableSizes([]);
      setValidationErrors({});
      setBookingData({
        start_date: '',
        end_date: '',
        occasion: '',
        delivery_address: '',
        special_instructions: ''
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error(error.response?.data?.message || 'Failed to add to cart. Please try again.');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleOpenBooking = (e, suit) => {
    if (e) e.stopPropagation();
    if (!isAuthenticated) {
      toast.info('Please log in to book a suit');
      navigate('/login', { state: { redirect: '/customer/browse-suits' } });
      return;
    }
    setSelectedSuit(suit);
    setBookingData({
      start_date: '',
      end_date: '',
      occasion: '',
      delivery_address: user?.address || '',
      special_instructions: ''
    });
    setShowBookingModal(true);
  };

  const formatCurrency = (amount) => {
    return `LKR ${parseFloat(amount).toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Navbar />
        <div className="flex flex-col items-center gap-3">
          <div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading suits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Page header */}
      <div className="bg-white border-b border-gray-100 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <h1 className="text-lg font-semibold text-gray-900">Suit Rentals</h1>
          <p className="text-sm text-gray-500 mt-0.5">Browse our collection and book for your occasion</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Filter bar */}
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3 mb-5 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by brand or category..."
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>
            ))}
          </select>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 whitespace-nowrap">
              LKR {priceRange[0].toLocaleString()} – {priceRange[1].toLocaleString()}
            </span>
            <input
              type="range" min="1500" max="3000" step="100"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
              className="w-24 accent-blue-600"
            />
          </div>
          <span className="text-xs text-gray-400 ml-auto">{filteredSuits.length} suits</span>
        </div>

        {/* Results grid */}
        {filteredSuits.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg border border-gray-200">
            <Shirt className="w-8 h-8 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-600">No suits match your filters</p>
            <p className="text-xs text-gray-400 mt-1">Try adjusting your search or category</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredSuits.map(suit => (
              <div
                key={suit.id}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer"
                onClick={() => setSelectedSuit(suit)}
              >
                {suit.image_url ? (
                  <img src={suit.image_url} alt={suit.brand} className="w-full h-44 object-cover bg-gray-50" />
                ) : (
                  <div className="w-full h-44 bg-gray-100 flex items-center justify-center">
                    <Shirt className="w-10 h-10 text-gray-300" />
                  </div>
                )}
                <div className="p-3.5">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-gray-900 leading-tight">{suit.brand}</h3>
                    <span className="shrink-0 text-xs px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded font-medium">In Stock</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">{suit.category_name} · {suit.available_size_count} sizes</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-bold text-gray-900">{formatCurrency(suit.rental_price_per_day)}</span>
                      <span className="text-xs text-gray-400 ml-0.5">/day</span>
                    </div>
                    <button
                      onClick={(e) => handleOpenBooking(e, suit)}
                      className="text-xs font-medium px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Book
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Suit Detail Modal */}
      {selectedSuit && !showBookingModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl w-full max-w-2xl my-4 shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">{selectedSuit.brand}</h2>
                <p className="text-xs text-gray-500">{selectedSuit.category_name} · {selectedSuit.color}</p>
              </div>
              <button
                onClick={() => setSelectedSuit(null)}
                className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid md:grid-cols-5">
              {/* Image */}
              <div className="md:col-span-2 border-r border-gray-100 p-5">
                {selectedSuit.image_url ? (
                  <img
                    src={selectedSuit.image_url}
                    alt={selectedSuit.brand}
                    className="w-full aspect-[3/4] object-contain bg-gray-50 rounded-lg"
                  />
                ) : (
                  <div className="w-full aspect-[3/4] bg-gray-100 rounded-lg flex items-center justify-center">
                    <Shirt className="w-16 h-16 text-gray-300" />
                  </div>
                )}
              </div>
              {/* Details */}
              <div className="md:col-span-3 p-5 flex flex-col">
                <div className="flex-1 space-y-4">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Price</p>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl font-bold text-gray-900">{formatCurrency(selectedSuit.rental_price_per_day)}</span>
                      <span className="text-xs text-gray-400">/ day</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">+ {formatCurrency(selectedSuit.deposit_amount)} refundable deposit</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-400 mb-0.5">Category</p>
                      <p className="text-xs font-semibold text-gray-800">{selectedSuit.category_name}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-400 mb-0.5">Color</p>
                      <p className="text-xs font-semibold text-gray-800">{selectedSuit.color}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-400 mb-0.5">Sizes Available</p>
                      <p className="text-xs font-semibold text-gray-800">{selectedSuit.available_size_count}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-400 mb-0.5">Status</p>
                      <p className="text-xs font-semibold text-emerald-600">Available</p>
                    </div>
                  </div>
                  {selectedSuit.description && (
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Description</p>
                      <p className="text-sm text-gray-600 leading-relaxed">{selectedSuit.description}</p>
                    </div>
                  )}
                </div>
                <div className="mt-5 pt-4 border-t border-gray-100 space-y-2">
                  <button
                    onClick={(e) => handleOpenBooking(e, selectedSuit)}
                    className="w-full py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    Book This Suit
                  </button>
                  <button
                    onClick={() => setSelectedSuit(null)}
                    className="w-full py-2 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    Back to browsing
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && selectedSuit && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[92vh] flex flex-col shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200 flex-shrink-0">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">Book — {selectedSuit.brand}</h2>
                <p className="text-xs text-gray-400">{selectedSuit.category_name} · {selectedSuit.color}</p>
              </div>
              <button
                onClick={() => { setShowBookingModal(false); setSelectedSuit(null); setValidationErrors({}); }}
                className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5">
              {/* Suit summary */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                {selectedSuit.image_url ? (
                  <img src={selectedSuit.image_url} alt={selectedSuit.brand} className="w-11 h-11 object-cover rounded-md" />
                ) : (
                  <div className="w-11 h-11 bg-gray-200 rounded-md flex items-center justify-center">
                    <Shirt className="w-5 h-5 text-gray-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{selectedSuit.brand}</p>
                  <p className="text-xs text-gray-500">{selectedSuit.category_name} · {selectedSuit.color}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-gray-900">{formatCurrency(selectedSuit.rental_price_per_day)}</p>
                  <p className="text-xs text-gray-400">per day</p>
                </div>
              </div>

              {/* Rental period */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Rental Period</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Start Date <span className="text-red-500">*</span></label>
                    <input
                      type="date"
                      value={bookingData.start_date}
                      onChange={(e) => { setBookingData({ ...bookingData, start_date: e.target.value }); setValidationErrors({ ...validationErrors, start_date: null }); }}
                      min={new Date().toISOString().split('T')[0]}
                      className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 ${validationErrors.start_date ? 'border-red-300 focus:ring-red-400' : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'}`}
                    />
                    {validationErrors.start_date && <p className="text-xs text-red-500 mt-1">{validationErrors.start_date}</p>}
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">End Date <span className="text-red-500">*</span></label>
                    <input
                      type="date"
                      value={bookingData.end_date}
                      onChange={(e) => { setBookingData({ ...bookingData, end_date: e.target.value }); setValidationErrors({ ...validationErrors, end_date: null, dates: null }); }}
                      min={bookingData.start_date || new Date().toISOString().split('T')[0]}
                      className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 ${validationErrors.end_date || validationErrors.dates ? 'border-red-300 focus:ring-red-400' : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'}`}
                    />
                    {(validationErrors.end_date || validationErrors.dates) && <p className="text-xs text-red-500 mt-1">{validationErrors.end_date || validationErrors.dates}</p>}
                  </div>
                </div>
                {calculateDuration() > 0 && (
                  <p className="text-xs text-blue-600 mt-2 font-medium">
                    {calculateDuration()} day rental · LKR {calculateTotal().rental} + LKR {calculateTotal().deposit} deposit
                  </p>
                )}
              </div>

              {/* Size */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Size <span className="text-red-500">*</span></p>
                {!bookingData.start_date || !bookingData.end_date ? (
                  <p className="text-xs text-gray-400 italic">Select dates above to see available sizes</p>
                ) : fetchingSizes ? (
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <div className="w-3 h-3 border border-blue-500 border-t-transparent rounded-full animate-spin" />
                    Checking availability...
                  </div>
                ) : availableSizes.length > 0 ? (
                  <>
                    <select
                      value={selectedSize}
                      onChange={(e) => { setSelectedSize(e.target.value); setValidationErrors({ ...validationErrors, size: null }); }}
                      className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 ${validationErrors.size ? 'border-red-300 focus:ring-red-400' : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'}`}
                    >
                      <option value="">Select size</option>
                      {availableSizes.map((s, i) => (
                        <option key={i} value={s.size}>{s.size} — {s.condition_status}</option>
                      ))}
                    </select>
                    {validationErrors.size && <p className="text-xs text-red-500 mt-1">{validationErrors.size}</p>}
                  </>
                ) : (
                  <p className="text-xs text-red-500">No sizes available for these dates. Try different dates.</p>
                )}
              </div>

              {/* Occasion */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Occasion <span className="text-red-500">*</span></label>
                <select
                  value={bookingData.occasion}
                  onChange={(e) => { setBookingData({ ...bookingData, occasion: e.target.value }); setValidationErrors({ ...validationErrors, occasion: null }); }}
                  className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 ${validationErrors.occasion ? 'border-red-300 focus:ring-red-400' : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'}`}
                >
                  <option value="">Select occasion</option>
                  <option value="Wedding">Wedding</option>
                  <option value="Business Event">Business Event</option>
                  <option value="Party">Party</option>
                  <option value="Formal Event">Formal Event</option>
                  <option value="Other">Other</option>
                </select>
                {validationErrors.occasion && <p className="text-xs text-red-500 mt-1">{validationErrors.occasion}</p>}
              </div>

              {/* Delivery address */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Delivery Address <span className="text-red-500">*</span></label>
                <textarea
                  value={bookingData.delivery_address}
                  onChange={(e) => { setBookingData({ ...bookingData, delivery_address: e.target.value }); setValidationErrors({ ...validationErrors, delivery_address: null }); }}
                  placeholder="Enter your complete delivery address"
                  rows={2}
                  className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 resize-none ${validationErrors.delivery_address ? 'border-red-300 focus:ring-red-400' : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'}`}
                />
                {validationErrors.delivery_address && <p className="text-xs text-red-500 mt-1">{validationErrors.delivery_address}</p>}
              </div>

              {/* Special instructions */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Special Instructions</label>
                <textarea
                  value={bookingData.special_instructions}
                  onChange={(e) => setBookingData({ ...bookingData, special_instructions: e.target.value })}
                  placeholder="Any special requests or notes..."
                  rows={2}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>

              {/* Price summary */}
              {calculateDuration() > 0 && (
                <div className="rounded-lg border border-gray-200 overflow-hidden text-sm">
                  <div className="flex justify-between px-4 py-2.5 border-b border-gray-100">
                    <span className="text-gray-500">Rental ({calculateDuration()} days x {formatCurrency(selectedSuit.rental_price_per_day)})</span>
                    <span className="font-medium text-gray-900">LKR {calculateTotal().rental}</span>
                  </div>
                  <div className="flex justify-between px-4 py-2.5 border-b border-gray-100">
                    <span className="text-gray-500">Security deposit (refundable)</span>
                    <span className="font-medium text-gray-900">LKR {calculateTotal().deposit}</span>
                  </div>
                  <div className="flex justify-between px-4 py-2.5 bg-gray-50">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="font-bold text-blue-600">LKR {calculateTotal().total}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 flex gap-2 px-5 py-3.5 border-t border-gray-200">
              <button
                onClick={handleAddToCart}
                disabled={addingToCart || !bookingData.start_date || !bookingData.end_date || !selectedSize || !bookingData.occasion || !bookingData.delivery_address || calculateDuration() <= 0 || availableSizes.length === 0}
                className="flex-1 py-2.5 text-sm font-medium border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1.5"
              >
                {addingToCart
                  ? <div className="w-3.5 h-3.5 border border-gray-500 border-t-transparent rounded-full animate-spin" />
                  : <ShoppingCart className="w-3.5 h-3.5" />
                }
                Add to Cart
              </button>
              <button
                onClick={handleBooking}
                disabled={bookingLoading || !bookingData.start_date || !bookingData.end_date || !selectedSize || !bookingData.occasion || !bookingData.delivery_address || calculateDuration() <= 0 || availableSizes.length === 0}
                className="flex-1 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1.5"
              >
                {bookingLoading && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {bookingLoading ? 'Booking...' : 'Book Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrowseSuits;
