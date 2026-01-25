import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Navbar from '../../components/Navbar';
import { ShoppingBag, Calendar, Clock, MapPin, Package, ChevronRight, ChevronLeft, CheckCircle, Shirt, Sparkles, Truck, AlertCircle } from 'lucide-react';
import { orderAPI } from '../../services/apiService';

const PlaceOrder = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [cleaningTypes, setCleaningTypes] = useState([]);
  const [serviceTimes, setServiceTimes] = useState([]);
  const [selectedServiceDuration, setSelectedServiceDuration] = useState(0);
  const [itemCounts, setItemCounts] = useState({});
  const [customItems, setCustomItems] = useState('');
  const [sameAddress, setSameAddress] = useState(false);
  
  const steps = [
    { number: 1, title: 'Service & Items', icon: ShoppingBag, description: 'Choose service type and items' },
    { number: 2, title: 'Schedule', icon: Calendar, description: 'Pick pickup time' },
    { number: 3, title: 'Confirm', icon: CheckCircle, description: 'Review and submit' }
  ];
  
  const itemCategories = [
    { id: 'shirts', label: 'Shirts' },
    { id: 'pants', label: 'Pants/Trousers' },
    { id: 'dresses', label: 'Dresses' },
    { id: 'suits', label: 'Suits/Blazers' },
    { id: 'bedding', label: 'Bedding/Sheets' },
    { id: 'towels', label: 'Towels' },
    { id: 'curtains', label: 'Curtains' },
    { id: 'jackets', label: 'Jackets/Coats' }
  ];
  
  const [orderData, setOrderData] = useState({
    // Step 1: Service Selection
    cleaning_type_id: '',
    service_time_id: '',
    weight_kg: 1,
    quantity: 1,
    
    // Step 2: Schedule
    pickup_date: '',
    pickup_time: '',
    delivery_date: '',
    delivery_time: '',
    
    // Step 3: Addresses & Details
    pickup_address: '',
    delivery_address: '',
    special_instructions: '',
    detergent_preference: 'standard',
    item_description: ''
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
    
    // If service time is selected, store the duration
    if (field === 'service_time_id') {
      const selectedService = serviceTimes.find(t => t.id === value);
      if (selectedService) {
        setSelectedServiceDuration(selectedService.duration_hours);
      }
    }
    
    // Auto-calculate delivery when pickup date/time changes
    if (field === 'pickup_date' || field === 'pickup_time') {
      const updatedData = { ...orderData, [field]: value };
      if (updatedData.pickup_date && updatedData.pickup_time && selectedServiceDuration > 0) {
        calculateDeliveryDateTime(updatedData.pickup_date, updatedData.pickup_time);
      }
    }
    
    // If pickup address changes and same address is checked, update delivery
    if (field === 'pickup_address' && sameAddress) {
      setOrderData(prev => ({ ...prev, pickup_address: value, delivery_address: value }));
    }
  };
  
  const handleSameAddressToggle = (checked) => {
    setSameAddress(checked);
    if (checked) {
      setOrderData(prev => ({ ...prev, delivery_address: prev.pickup_address }));
    }
  };
  
  const handleItemToggle = (itemId) => {
    setItemCounts(prev => {
      const newCounts = { ...prev };
      if (newCounts[itemId]) {
        delete newCounts[itemId];
      } else {
        newCounts[itemId] = 1;
      }
      return newCounts;
    });
  };
  
  const handleItemCountChange = (itemId, count) => {
    const newCount = parseInt(count) || 0;
    if (newCount <= 0) {
      setItemCounts(prev => {
        const newCounts = { ...prev };
        delete newCounts[itemId];
        return newCounts;
      });
    } else {
      setItemCounts(prev => ({ ...prev, [itemId]: newCount }));
    }
  };
  
  const incrementItem = (itemId) => {
    setItemCounts(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1
    }));
  };
  
  const decrementItem = (itemId) => {
    setItemCounts(prev => {
      const currentCount = prev[itemId] || 0;
      if (currentCount <= 1) {
        const newCounts = { ...prev };
        delete newCounts[itemId];
        return newCounts;
      }
      return { ...prev, [itemId]: currentCount - 1 };
    });
  };
  
  const buildItemDescription = () => {
    const items = Object.entries(itemCounts).map(([id, count]) => {
      const item = itemCategories.find(cat => cat.id === id);
      return item ? `${count} ${item.label}` : '';
    }).filter(Boolean);
    
    if (customItems.trim()) {
      items.push(customItems.trim());
    }
    
    return items.join(', ');
  };

  const calculateDeliveryDateTime = (pickupDate, pickupTime) => {
    if (!pickupDate || !pickupTime || selectedServiceDuration === 0) return;
    
    // Create pickup datetime
    const pickupDateTime = new Date(`${pickupDate}T${pickupTime}:00`);
    
    // Add service duration hours
    const deliveryDateTime = new Date(pickupDateTime.getTime() + selectedServiceDuration * 60 * 60 * 1000);
    
    // Extract date and time
    const deliveryDate = deliveryDateTime.toISOString().split('T')[0];
    const deliveryTime = deliveryDateTime.toTimeString().slice(0, 5);
    
    // Update order data
    setOrderData(prev => ({
      ...prev,
      delivery_date: deliveryDate,
      delivery_time: deliveryTime
    }));
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
      
      // Build item description from selections
      const finalItemDescription = buildItemDescription();
      
      if (!finalItemDescription) {
        toast.error('Please select at least one item type');
        setLoading(false);
        return;
      }
      
      // Combine pickup date and time into ISO format
      const pickupDateTime = `${orderData.pickup_date}T${orderData.pickup_time}:00`;
      
      // Prepare data in backend expected format
      const orderPayload = {
        cleaning_type_id: parseInt(orderData.cleaning_type_id),
        service_time_id: parseInt(orderData.service_time_id),
        item_description: finalItemDescription,
        quantity: parseInt(orderData.quantity) || 1,
        weight_kg: parseFloat(orderData.weight_kg),
        special_instructions: `Pickup Address: ${orderData.pickup_address}\nDelivery Address: ${orderData.delivery_address}\nDetergent Preference: ${orderData.detergent_preference}${orderData.special_instructions ? '\n' + orderData.special_instructions : ''}`,
        order_type: 'online',
        pickup_date: pickupDateTime
      };
      
      console.log('Sending order payload:', orderPayload);
      
      const response = await orderAPI.createOrder(orderPayload);
      
      toast.success('Order placed successfully! Order Number: ' + (response?.data?.data?.orderNumber || ''), {
        duration: 5000,
      });
      // Reset form
      setStep(1);
      setSelectedServiceDuration(0);
      setItemCounts({});
      setCustomItems('');
      setSameAddress(false);
      setOrderData({
        cleaning_type_id: '',
        service_time_id: '',
        weight_kg: 1,
        quantity: 1,
        pickup_date: '',
        pickup_time: '',
        delivery_date: '',
        delivery_time: '',
        pickup_address: '',
        delivery_address: '',
        special_instructions: '',
        detergent_preference: 'standard',
        item_description: ''
      });
    } catch (error) {
      console.error('Error placing order:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.error || error.response?.data?.message || 'Failed to place order');
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
        <div className="mb-12 sticky top-20 z-40 bg-gray-50 py-6 -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            {steps.map((s, index) => (
              <React.Fragment key={s.number}>
                <div className="flex flex-col items-center flex-1">
                  <div className={`relative w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${
                    step >= s.number 
                      ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg scale-110' 
                      : step > s.number
                      ? 'bg-green-500 text-white shadow-md'
                      : 'bg-white border-2 border-gray-300 text-gray-400'
                  }`}>
                    {step > s.number ? (
                      <CheckCircle className="w-7 h-7" />
                    ) : (
                      <s.icon className="w-6 h-6" />
                    )}
                    {step === s.number && (
                      <div className="absolute -inset-1 rounded-full bg-blue-400 opacity-30 animate-ping" />
                    )}
                  </div>
                  <div className="mt-3 text-center">
                    <div className={`text-sm font-bold ${
                      step >= s.number ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      {s.title}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 hidden sm:block">
                      {s.description}
                    </div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-4 mt-[-40px] transition-all duration-500 rounded-full ${
                    step > s.number ? 'bg-gradient-to-r from-blue-600 to-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
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
                        className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 overflow-hidden ${
                          orderData.cleaning_type_id === type.id
                            ? 'border-blue-600 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg'
                            : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                        }`}
                      >
                        {orderData.cleaning_type_id === type.id && (
                          <div className="absolute top-3 right-3 w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-lg z-10">
                            <CheckCircle className="w-5 h-5 text-white" />
                          </div>
                        )}
                        <div className="flex items-start space-x-3">
                          <div className={`p-3 rounded-lg ${
                            orderData.cleaning_type_id === type.id ? 'bg-blue-600' : 'bg-gray-100'
                          }`}>
                            <Sparkles className={`w-6 h-6 ${
                              orderData.cleaning_type_id === type.id ? 'text-white' : 'text-gray-600'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-lg text-gray-900">{type.name}</h3>
                            <p className="text-sm text-gray-600 mt-1 leading-relaxed">{type.description}</p>
                            <p className="text-blue-600 font-bold text-lg mt-2">LKR {parseFloat(type.base_price).toFixed(2)}</p>
                          </div>
                        </div>
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
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {(Array.isArray(serviceTimes) ? serviceTimes : []).map(time => (
                        <div
                          key={time.id}
                          onClick={() => handleInputChange('service_time_id', time.id)}
                          className={`relative p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 overflow-hidden ${
                            orderData.service_time_id === time.id
                              ? 'border-blue-600 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg'
                              : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                          }`}
                        >
                          {orderData.service_time_id === time.id && (
                            <div className="absolute top-3 right-3 w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-lg z-10">
                              <CheckCircle className="w-5 h-5 text-white" />
                            </div>
                          )}
                          <div className="flex justify-center mb-3">
                            <Clock className={`w-8 h-8 ${
                              orderData.service_time_id === time.id ? 'text-blue-600' : 'text-gray-400'
                            }`} />
                          </div>
                          <h3 className="font-bold text-gray-900 text-center">{time.name}</h3>
                          <p className="text-xs text-gray-600 mt-2 text-center leading-relaxed">{time.description}</p>
                          <p className="text-blue-600 font-bold text-center mt-3 text-lg">{time.price_multiplier}x</p>
                        </div>
                      ))}
                    </div>
                    {selectedServiceDuration > 0 && (
                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-800">
                          ✓ <strong>{selectedServiceDuration} hour service selected.</strong> Your delivery will be automatically scheduled {selectedServiceDuration} hours after pickup.
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Weight */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Approximate Weight (kg) *
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
                <p className="text-sm text-gray-500 mt-2">Estimated weight of your laundry</p>
              </div>

              {/* Item Description */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  What items are you sending? *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {itemCategories.map(item => (
                    <div
                      key={item.id}
                      className={`relative p-5 rounded-xl border-2 transition-all duration-200 overflow-hidden ${
                        itemCounts[item.id]
                          ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-md'
                          : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
                      }`}
                    >
                      {itemCounts[item.id] && (
                        <div className="absolute top-3 right-3 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-md z-10">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                      )}
                      
                      <div className="flex items-center justify-center mb-3">
                        <Shirt className={`w-8 h-8 ${
                          itemCounts[item.id] ? 'text-blue-600' : 'text-gray-400'
                        }`} />
                      </div>
                      
                      <div className="text-sm font-bold text-gray-700 text-center mb-3">{item.label}</div>
                      
                      {!itemCounts[item.id] ? (
                        <button
                          onClick={() => handleItemToggle(item.id)}
                          className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                          + Add
                        </button>
                      ) : (
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => decrementItem(item.id)}
                            className="w-9 h-9 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 font-bold transition-all active:scale-95"
                          >
                            −
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={itemCounts[item.id]}
                            onChange={(e) => handleItemCountChange(item.id, e.target.value)}
                            className="w-16 text-center border-2 border-blue-400 rounded-lg py-2 font-bold text-blue-700 bg-white focus:ring-2 focus:ring-blue-300 focus:outline-none"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <button
                            onClick={() => incrementItem(item.id)}
                            className="w-9 h-9 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 font-bold transition-all active:scale-95"
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Other items or additional details
                  </label>
                  <input
                    type="text"
                    value={customItems}
                    onChange={(e) => setCustomItems(e.target.value)}
                    placeholder="e.g., 5 shirts, 3 silk scarves, baby clothes..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                  />
                </div>
                
                {(Object.keys(itemCounts).length > 0 || customItems) && (
                  <div className="mt-6 p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl shadow-md">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-green-500 rounded-lg">
                        <Package className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-green-900 text-lg mb-2">Selected Items</h4>
                        <p className="text-green-800 leading-relaxed">
                          {buildItemDescription() || 'None'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
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
                disabled={!orderData.cleaning_type_id || !orderData.service_time_id || (Object.keys(itemCounts).length === 0 && !customItems.trim())}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-blue-800 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-3 transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none"
              >
                <span>Continue to Schedule</span>
                <ChevronRight className="w-6 h-6" />
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
                    Delivery Details (Auto-calculated)
                  </h3>
                  
                  {selectedServiceDuration > 0 && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Service Duration:</strong> {selectedServiceDuration} hours
                        <br />
                        Delivery will be automatically scheduled {selectedServiceDuration} hours after your pickup time.
                      </p>
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Delivery Date
                    </label>
                    <input
                      type="text"
                      value={orderData.delivery_date || 'Will be calculated after pickup selection'}
                      readOnly
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-600"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Delivery Time
                    </label>
                    <input
                      type="text"
                      value={orderData.delivery_time || 'Will be calculated after pickup selection'}
                      readOnly
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-600"
                    />
                  </div>
                </div>
              </div>

              <div className="flex space-x-4 mt-8">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 bg-white border-2 border-gray-300 text-gray-700 py-4 rounded-xl font-bold hover:border-gray-400 hover:shadow-md flex items-center justify-center space-x-2 transition-all duration-200"
                >
                  <ChevronLeft className="w-5 h-5" />
                  <span>Back</span>
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!orderData.pickup_date || !orderData.pickup_time}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-bold hover:from-blue-700 hover:to-blue-800 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-3 transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none"
                >
                  <span>Continue to Confirm</span>
                  <ChevronRight className="w-6 h-6" />
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
                <label className="text-sm font-bold text-gray-700 mb-3 flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span>Pickup Address *</span>
                </label>
                <textarea
                  value={orderData.pickup_address}
                  onChange={(e) => handleInputChange('pickup_address', e.target.value)}
                  placeholder="Enter your pickup address..."
                  rows="3"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>

              <div className="mb-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                <label className="flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    id="sameAddress"
                    checked={sameAddress}
                    onChange={(e) => handleSameAddressToggle(e.target.checked)}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="ml-3 text-sm font-bold text-gray-700 group-hover:text-blue-700 transition-colors flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Delivery address is same as pickup address</span>
                  </span>
                </label>
              </div>
                
              <div className="mb-6">
                <label className="text-sm font-bold text-gray-700 mb-3 flex items-center space-x-2">
                  <Truck className="w-4 h-4 text-blue-600" />
                  <span>Delivery Address *</span>
                </label>
                <textarea
                  value={orderData.delivery_address}
                  onChange={(e) => handleInputChange('delivery_address', e.target.value)}
                  placeholder="Enter your delivery address..."
                  rows="3"
                  disabled={sameAddress}
                  className={`w-full px-4 py-3 border-2 rounded-xl transition-all ${
                    sameAddress 
                      ? 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed' 
                      : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  }`}
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
                    <span className="text-gray-600">Items:</span>
                    <span className="font-medium">{buildItemDescription() || 'Not specified'}</span>
                  </div>
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
                  disabled={loading}
                  className="flex-1 bg-white border-2 border-gray-300 text-gray-700 py-4 rounded-xl font-bold hover:border-gray-400 hover:shadow-md flex items-center justify-center space-x-2 transition-all duration-200 disabled:opacity-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                  <span>Back</span>
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || !orderData.pickup_address || !orderData.delivery_address}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-xl font-bold hover:from-green-700 hover:to-green-800 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-3 transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Placing Order...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-6 h-6" />
                      <span>Place Order</span>
                    </>
                  )}
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
