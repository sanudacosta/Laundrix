import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { ShoppingBag, Calendar, Clock, MapPin, Package, ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react';
import { orderAPI } from '../../services/apiService';

const PlaceOrder = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [cleaningTypes, setCleaningTypes] = useState([]);
  const [serviceTimes, setServiceTimes] = useState([]);
  
  const [orderData, setOrderData] = useState({
    // Step 1: Service Selection
    cleaning_type_id: '',
    service_time_id: '',
    weight_kg: 1,
    
    // Step 2: Schedule
    pickup_date: '',
    pickup_time: '',
    delivery_date: '',
    delivery_time: '',
    
    // Step 3: Addresses & Details
    pickup_address: '',
    delivery_address: '',
    special_instructions: '',
    detergent_preference: 'standard'
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
      console.log('Full cleaning types response:', JSON.stringify(typesRes, null, 2));
      console.log('Full service times response:', JSON.stringify(timesRes, null, 2));
      
      // Handle response - check if data is in response.data or directly in response
      const typesData = typesRes?.data?.data || typesRes?.data || [];
      const timesData = timesRes?.data?.data || timesRes?.data || [];
      
      console.log('Extracted cleaning types:', typesData);
      console.log('Extracted service times:', timesData);
      
      setCleaningTypes(Array.isArray(typesData) ? typesData : []);
      setServiceTimes(Array.isArray(timesData) ? timesData : []);
    } catch (error) {
      console.error('Error fetching data:', error);
      console.error('Error details:', error.response?.data);
      alert('Failed to load service options: ' + (error.response?.data?.message || error.message));
      setCleaningTypes([]);
      setServiceTimes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setOrderData(prev => ({ ...prev, [field]: value }));
  };

  const calculatePrice = () => {
    const typesArray = Array.isArray(cleaningTypes) ? cleaningTypes : [];
    const timesArray = Array.isArray(serviceTimes) ? serviceTimes : [];
    
    const selectedType = typesArray.find(t => t.id === parseInt(orderData.cleaning_type_id));
    const selectedTime = timesArray.find(t => t.id === parseInt(orderData.service_time_id));
    
    if (!selectedType || !selectedTime) return 0;
    
    const basePrice = parseFloat(selectedType.base_price || 0);
    const timeMultiplier = parseFloat(selectedTime.price_multiplier || 1);
    const weight = parseFloat(orderData.weight_kg || 1);
    const TAX_RATE = 0.08;
    
    const subtotal = basePrice * timeMultiplier * weight;
    const tax = subtotal * TAX_RATE;
    
    return {
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      total: (subtotal + tax).toFixed(2)
    };
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const price = calculatePrice();
      
      await orderAPI.createOrder({
        ...orderData,
        total_amount: parseFloat(price.total)
      });
      
      alert('Order placed successfully!');
      // Reset form
      setStep(1);
      setOrderData({
        cleaning_type_id: '',
        service_time_id: '',
        weight_kg: 1,
        pickup_date: '',
        pickup_time: '',
        delivery_date: '',
        delivery_time: '',
        pickup_address: '',
        delivery_address: '',
        special_instructions: '',
        detergent_preference: 'standard'
      });
    } catch (error) {
      console.error('Error placing order:', error);
      alert(error.response?.data?.error || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', 
    '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Place Laundry Order</h1>
          <p className="text-gray-600">Schedule your laundry pickup and delivery</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {s}
                </div>
                {s < 3 && (
                  <div className={`w-24 h-1 mx-2 ${step > s ? 'bg-blue-600' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between max-w-2xl mx-auto mt-2">
            <span className="text-sm font-medium">Service</span>
            <span className="text-sm font-medium">Schedule</span>
            <span className="text-sm font-medium">Confirm</span>
          </div>
        </div>

        {/* Step 1: Service Selection */}
        {step === 1 && (
          <div className=" mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Service</h2>
              
              {/* Cleaning Type */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Cleaning Type *
                </label>
                {cleaningTypes.length === 0 ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
                    <p className="text-yellow-800">No cleaning types available. Please check your connection or contact support.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(Array.isArray(cleaningTypes) ? cleaningTypes : []).map(type => (
                      <div
                        key={type.id}
                        onClick={() => handleInputChange('cleaning_type_id', type.id)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          orderData.cleaning_type_id === type.id
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <h3 className="font-bold text-lg text-gray-900">{type.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                        <p className="text-blue-600 font-bold mt-2">LKR {parseFloat(type.base_price).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Service Time */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Service Speed *
                </label>
                {serviceTimes.length === 0 ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
                    <p className="text-yellow-800">No service times available. Please check your connection or contact support.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(Array.isArray(serviceTimes) ? serviceTimes : []).map(time => (
                      <div
                        key={time.id}
                        onClick={() => handleInputChange('service_time_id', time.id)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          orderData.service_time_id === time.id
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <h3 className="font-bold text-gray-900">{time.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{time.description}</p>
                        <p className="text-blue-600 font-semibold mt-2">{time.price_multiplier}x price</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Weight */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Weight (kg) *
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  step="0.5"
                  value={orderData.weight_kg}
                  onChange={(e) => handleInputChange('weight_kg', e.target.value)}
                  className="w-32 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                />
                <p className="text-sm text-gray-500 mt-2">Approximate weight of your laundry</p>
              </div>

              {/* Price Preview */}
              {orderData.cleaning_type_id && orderData.service_time_id && (
                <div className="bg-blue-50 rounded-xl p-6 mb-6">
                  <h3 className="font-bold text-gray-900 mb-3">Price Estimate</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-gray-600">
                      <span>Base Rate ({orderData.weight_kg} kg):</span>
                      <span>LKR {calculatePrice().subtotal}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Tax (8%):</span>
                      <span>LKR {calculatePrice().tax}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-bold text-lg text-gray-900">
                      <span>Total:</span>
                      <span>LKR {calculatePrice().total}</span>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={() => setStep(2)}
                disabled={!orderData.cleaning_type_id || !orderData.service_time_id}
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <span>Continue to Schedule</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Schedule */}
        {step === 2 && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Schedule Pickup & Delivery</h2>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Pickup */}
                <div>
                  <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                    Pickup Details
                  </h3>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Pickup Date *
                    </label>
                    <select
                      value={orderData.pickup_date}
                      onChange={(e) => handleInputChange('pickup_date', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Select date</option>
                      {getAvailableDates().map(date => (
                        <option key={date} value={date}>
                          {new Date(date).toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Pickup Time *
                    </label>
                    <select
                      value={orderData.pickup_time}
                      onChange={(e) => handleInputChange('pickup_time', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Select time</option>
                      {timeSlots.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Delivery */}
                <div>
                  <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center">
                    <Package className="w-5 h-5 mr-2 text-green-600" />
                    Delivery Details
                  </h3>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Delivery Date *
                    </label>
                    <select
                      value={orderData.delivery_date}
                      onChange={(e) => handleInputChange('delivery_date', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Select date</option>
                      {getAvailableDates().map(date => (
                        <option key={date} value={date}>
                          {new Date(date).toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Delivery Time *
                    </label>
                    <select
                      value={orderData.delivery_time}
                      onChange={(e) => handleInputChange('delivery_time', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Select time</option>
                      {timeSlots.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4 mt-8">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-200 flex items-center justify-center space-x-2"
                >
                  <ChevronLeft className="w-5 h-5" />
                  <span>Back</span>
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!orderData.pickup_date || !orderData.pickup_time || !orderData.delivery_date || !orderData.delivery_time}
                  className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <span>Continue</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Addresses & Final Details</h2>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Pickup Address *
                </label>
                <textarea
                  value={orderData.pickup_address}
                  onChange={(e) => handleInputChange('pickup_address', e.target.value)}
                  placeholder="Enter your pickup address..."
                  rows="3"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Delivery Address *
                </label>
                <textarea
                  value={orderData.delivery_address}
                  onChange={(e) => handleInputChange('delivery_address', e.target.value)}
                  placeholder="Enter your delivery address..."
                  rows="3"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Detergent Preference
                </label>
                <select
                  value={orderData.detergent_preference}
                  onChange={(e) => handleInputChange('detergent_preference', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                >
                  <option value="standard">Standard Detergent</option>
                  <option value="sensitive">Sensitive Skin</option>
                  <option value="eco">Eco-Friendly</option>
                  <option value="fragrance-free">Fragrance Free</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Special Instructions (Optional)
                </label>
                <textarea
                  value={orderData.special_instructions}
                  onChange={(e) => handleInputChange('special_instructions', e.target.value)}
                  placeholder="Any special requirements or instructions..."
                  rows="4"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <h3 className="font-bold text-lg text-gray-900 mb-4">Order Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service:</span>
                    <span className="font-medium">
                      {(Array.isArray(cleaningTypes) ? cleaningTypes : []).find(t => t.id === parseInt(orderData.cleaning_type_id))?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Speed:</span>
                    <span className="font-medium">
                      {(Array.isArray(serviceTimes) ? serviceTimes : []).find(t => t.id === parseInt(orderData.service_time_id))?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Weight:</span>
                    <span className="font-medium">{orderData.weight_kg} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pickup:</span>
                    <span className="font-medium">
                      {orderData.pickup_date} at {orderData.pickup_time}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery:</span>
                    <span className="font-medium">
                      {orderData.delivery_date} at {orderData.delivery_time}
                    </span>
                  </div>
                  <div className="border-t pt-3 flex justify-between font-bold text-xl text-gray-900">
                    <span>Total:</span>
                    <span className="text-blue-600">LKR {calculatePrice().total}</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-200 flex items-center justify-center space-x-2"
                >
                  <ChevronLeft className="w-5 h-5" />
                  <span>Back</span>
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || !orderData.pickup_address || !orderData.delivery_address}
                  className="flex-1 bg-green-600 text-white py-4 rounded-xl font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>{loading ? 'Placing Order...' : 'Place Order'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaceOrder;
