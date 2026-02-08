import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Navbar from '../../components/Navbar';
import { Sparkles, Clock, Package, MapPin, Calendar, Truck, CheckCircle, Info } from 'lucide-react';
import { orderAPI } from '../../services/apiService';
import { useAuth } from '../../context/AuthContext';

const PlaceOrder = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [cleaningTypes, setCleaningTypes] = useState([]);
  const [serviceTimes, setServiceTimes] = useState([]);
  
  const [formData, setFormData] = useState({
    cleaning_type_id: '',
    service_time_id: '',
    item_description: '',
    weight_kg: 2,
    pickup_date: '',
    pickup_time: '09:00',
    pickup_address: user?.address || '',
    delivery_address: user?.address || '',
    special_instructions: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [typesRes, timesRes] = await Promise.all([
        orderAPI.getCleaningTypes(),
        orderAPI.getServiceTimes()
      ]);
      
      const typesData = typesRes?.data?.data || typesRes?.data || [];
      const timesData = timesRes?.data?.data || timesRes?.data || [];
      
      setCleaningTypes(Array.isArray(typesData) ? typesData : []);
      setServiceTimes(Array.isArray(timesData) ? timesData : []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load service options');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.cleaning_type_id || !formData.service_time_id || !formData.item_description || !formData.pickup_date) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const pickupDateTime = `${formData.pickup_date}T${formData.pickup_time}:00`;
      
      const orderPayload = {
        cleaning_type_id: parseInt(formData.cleaning_type_id),
        service_time_id: parseInt(formData.service_time_id),
        item_description: formData.item_description,
        quantity: 1,
        weight_kg: parseFloat(formData.weight_kg),
        pickup_address: formData.pickup_address,
        delivery_address: formData.delivery_address,
        special_instructions: formData.special_instructions,
        order_type: 'online',
        pickup_date: pickupDateTime
      };
      
      const response = await orderAPI.createOrder(orderPayload);
      toast.success('Order placed successfully! Order Number: ' + (response?.data?.data?.orderNumber || ''));
      
      // Reset form
      setFormData({
        cleaning_type_id: '',
        service_time_id: '',
        item_description: '',
        weight_kg: 2,
        pickup_date: '',
        pickup_time: '09:00',
        pickup_address: user?.address || '',
        delivery_address: user?.address || '',
        special_instructions: ''
      });
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error(error.response?.data?.error || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const calculatePrice = () => {
    const selectedType = cleaningTypes.find(t => t.id === parseInt(formData.cleaning_type_id));
    const selectedTime = serviceTimes.find(t => t.id === parseInt(formData.service_time_id));
    
    if (!selectedType || !selectedTime) return { subtotal: 0, tax: 0, total: 0 };
    
    const basePrice = parseFloat(selectedType.base_price || 0);
    const timeMultiplier = parseFloat(selectedTime.price_multiplier || 1);
    const weight = parseFloat(formData.weight_kg || 1);
    const TAX_RATE = 0.08;
    
    const subtotal = basePrice * timeMultiplier * weight;
    const tax = subtotal * TAX_RATE;
    
    return {
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      total: (subtotal + tax).toFixed(2)
    };
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  if (loading && cleaningTypes.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />

      <div className="pt-24 pb-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <Sparkles className="w-4 h-4 mr-2" />
              Quick & Easy Laundry Service
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Place Your Order</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Tell us what you need, and we'll take care of the rest with professional cleaning and doorstep delivery.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Service Selection */}
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                  <Sparkles className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Choose Your Service</h2>
                  <p className="text-gray-600 text-sm">Select cleaning type and speed</p>
                </div>
              </div>

              {/* Cleaning Types */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-4">Cleaning Type *</label>
                <div className="grid md:grid-cols-3 gap-4">
                  {cleaningTypes.map(type => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, cleaning_type_id: type.id })}
                      className={`relative p-6 rounded-2xl border-2 transition-all text-left ${
                        formData.cleaning_type_id === type.id
                          ? 'border-blue-600 bg-blue-50 shadow-lg scale-105'
                          : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                      }`}
                    >
                      {formData.cleaning_type_id === type.id && (
                        <div className="absolute top-3 right-3">
                          <CheckCircle className="w-6 h-6 text-blue-600" />
                        </div>
                      )}
                      <h3 className="font-bold text-lg text-gray-900 mb-2">{type.name}</h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{type.description}</p>
                      <p className="text-2xl font-bold text-blue-600">LKR {parseFloat(type.base_price).toFixed(2)}</p>
                      <p className="text-xs text-gray-500 mt-1">per kg</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Service Speed */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-4">Service Speed *</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {serviceTimes.map(time => (
                    <button
                      key={time.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, service_time_id: time.id })}
                      className={`p-4 rounded-xl border-2 transition-all text-center ${
                        formData.service_time_id === time.id
                          ? 'border-blue-600 bg-blue-50 shadow-md'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <Clock className={`w-8 h-8 mx-auto mb-2 ${formData.service_time_id === time.id ? 'text-blue-600' : 'text-gray-400'}`} />
                      <p className="font-bold text-sm text-gray-900">{time.name}</p>
                      <p className="text-xs text-gray-600 mt-1">{time.price_multiplier}x price</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Details */}
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mr-4">
                  <Package className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
                  <p className="text-gray-600 text-sm">What items are you sending?</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Items Description *</label>
                  <textarea
                    value={formData.item_description}
                    onChange={(e) => setFormData({ ...formData, item_description: e.target.value })}
                    placeholder="e.g., 5 shirts, 3 pants, 2 dresses, bedding set..."
                    rows="3"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 resize-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Approximate Weight (kg) *</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    step="0.5"
                    value={formData.weight_kg}
                    onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Estimated weight helps us prepare</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Special Instructions</label>
                  <textarea
                    value={formData.special_instructions}
                    onChange={(e) => setFormData({ ...formData, special_instructions: e.target.value })}
                    placeholder="Any special care instructions..."
                    rows="3"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Schedule Pickup */}
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Schedule Pickup</h2>
                  <p className="text-gray-600 text-sm">When should we collect your items?</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Pickup Date *</label>
                  <input
                    type="date"
                    min={getMinDate()}
                    value={formData.pickup_date}
                    onChange={(e) => setFormData({ ...formData, pickup_date: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Pickup Time *</label>
                  <select
                    value={formData.pickup_time}
                    onChange={(e) => setFormData({ ...formData, pickup_time: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                  >
                    {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'].map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Addresses */}
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mr-4">
                  <MapPin className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Delivery Information</h2>
                  <p className="text-gray-600 text-sm">Where should we pickup and deliver?</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Pickup Address *</label>
                  <textarea
                    value={formData.pickup_address}
                    onChange={(e) => setFormData({ ...formData, pickup_address: e.target.value })}
                    placeholder="Enter your pickup address..."
                    rows="3"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 resize-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Delivery Address *</label>
                  <textarea
                    value={formData.delivery_address}
                    onChange={(e) => setFormData({ ...formData, delivery_address: e.target.value })}
                    placeholder="Enter your delivery address..."
                    rows="3"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 resize-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, delivery_address: formData.pickup_address })}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Same as pickup address
                  </button>
                </div>
              </div>
            </div>

            {/* Price Summary & Submit */}
            {formData.cleaning_type_id && formData.service_time_id && (
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl shadow-2xl p-8 text-white">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold">Order Summary</h3>
                    <p className="text-blue-100 text-sm">Review your order details</p>
                  </div>
                  <Info className="w-8 h-8 text-blue-200" />
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-lg">
                    <span className="text-blue-100">Subtotal:</span>
                    <span className="font-semibold">LKR {calculatePrice().subtotal}</span>
                  </div>
                  <div className="flex justify-between text-lg">
                    <span className="text-blue-100">Tax (8%):</span>
                    <span className="font-semibold">LKR {calculatePrice().tax}</span>
                  </div>
                  <div className="border-t border-white/30 pt-3">
                    <div className="flex justify-between text-2xl font-bold">
                      <span>Total:</span>
                      <span>LKR {calculatePrice().total}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white text-blue-600 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-3"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
                      <span>Placing Order...</span>
                    </>
                  ) : (
                    <>
                      <Truck className="w-6 h-6" />
                      <span>Place Order Now</span>
                    </>
                  )}
                </button>

                <p className="text-center text-blue-100 text-sm mt-4">
                  Free pickup & delivery • Real-time tracking • Quality guaranteed
                </p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default PlaceOrder;
