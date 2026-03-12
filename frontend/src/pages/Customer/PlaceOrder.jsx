import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navbar from '../../components/Navbar';
import { ShoppingBag, Calendar, Clock, MapPin, Package, ChevronRight, ChevronLeft, CheckCircle, Shirt, Sparkles, Truck, AlertCircle, Minus, CreditCard, Lock } from 'lucide-react';
import { orderAPI, paymentAPI } from '../../services/apiService';
import { useAuth } from '../../context/AuthContext';

const PlaceOrder = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [cleaningTypes, setCleaningTypes] = useState([]);
  const [serviceTimes, setServiceTimes] = useState([]);
  const [selectedServiceDuration, setSelectedServiceDuration] = useState(0);
  const [itemCounts, setItemCounts] = useState({});
  const [customItems, setCustomItems] = useState('');
  const [sameAddress, setSameAddress] = useState(false);
  const [deliveryAdjusted, setDeliveryAdjusted] = useState(null); // null or adjusted date string
  const [createdOrderId, setCreatedOrderId] = useState(null);
  const [orderTotal, setOrderTotal] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardDetails, setCardDetails] = useState({ cardName: '', cardNumber: '', expiry: '', cvv: '' });
  const [paymentLoading, setPaymentLoading] = useState(false);
  
  const steps = [
    { number: 1, title: 'Service & Items', icon: ShoppingBag, description: 'Choose service type and items' },
    { number: 2, title: 'Schedule', icon: Calendar, description: 'Pick pickup time' },
    { number: 3, title: 'Confirm', icon: CheckCircle, description: 'Review and submit' },
    { number: 4, title: 'Payment', icon: CreditCard, description: 'Complete your payment' }
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
    // Pre-fill user's address if available
    if (user?.address) {
      setOrderData(prev => ({
        ...prev,
        pickup_address: user.address
      }));
    }
  }, [user?.address]);

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
      toast.error('Failed to load service options. Please refresh the page.');
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

  const BUSINESS_OPEN_HOUR  = 6;  // 6:00 AM
  const BUSINESS_CLOSE_HOUR = 23; // 11:00 PM

  const calculateDeliveryDateTime = (pickupDate, pickupTime) => {
    if (!pickupDate || !pickupTime || selectedServiceDuration === 0) return;

    // Build the raw delivery datetime by adding service duration
    const pickupDateTime = new Date(`${pickupDate}T${pickupTime}:00`);
    let deliveryDateTime = new Date(pickupDateTime.getTime() + selectedServiceDuration * 60 * 60 * 1000);

    // If delivery falls outside business hours (before 6 AM or at/after 11 PM),
    // push it to 6:00 AM the next business day.
    const deliveryHour = deliveryDateTime.getHours();
    const deliveryMinute = deliveryDateTime.getMinutes();
    const totalMinutes = deliveryHour * 60 + deliveryMinute;

    const closeMinutes = BUSINESS_CLOSE_HOUR * 60; // 23:00
    const openMinutes  = BUSINESS_OPEN_HOUR  * 60; // 06:00

    if (totalMinutes >= closeMinutes || totalMinutes < openMinutes) {
      // Roll forward to 6 AM — if we're already past midnight add extra day only if < openMinutes
      deliveryDateTime.setDate(deliveryDateTime.getDate() + (totalMinutes < openMinutes ? 0 : 1));
      deliveryDateTime.setHours(BUSINESS_OPEN_HOUR, 0, 0, 0);
      setDeliveryAdjusted(
        deliveryDateTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
      );
    } else {
      setDeliveryAdjusted(null);
    }

    const deliveryDate = deliveryDateTime.toISOString().split('T')[0];
    const deliveryTime = deliveryDateTime.toTimeString().slice(0, 5);

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

  const handleSubmit = () => {
    if (!isAuthenticated) {
      toast.info('Please log in to place an order');
      navigate('/login', { state: { redirect: '/customer/place-order' } });
      return;
    }
    const finalItemDescription = buildItemDescription();
    if (!finalItemDescription) {
      toast.error('Please select at least one item type');
      return;
    }
    // Pre-compute the price so step 4 shows the correct total immediately
    const price = calculatePrice();
    setOrderTotal(price.total);
    setStep(4);
  };

  const handlePayment = async () => {
    try {
      setPaymentLoading(true);

      // 1. Create the order now (after payment method is chosen)
      const finalItemDescription = buildItemDescription();
      const pickupDateTime = `${orderData.pickup_date}T${orderData.pickup_time}:00`;
      const orderPayload = {
        cleaning_type_id: parseInt(orderData.cleaning_type_id),
        service_time_id: parseInt(orderData.service_time_id),
        item_description: finalItemDescription,
        quantity: 1,
        weight_kg: parseFloat(orderData.weight_kg),
        pickup_address: orderData.pickup_address,
        delivery_address: orderData.delivery_address,
        special_instructions: `Detergent Preference: ${orderData.detergent_preference}${orderData.special_instructions ? '\n' + orderData.special_instructions : ''}`,
        order_type: 'online',
        pickup_date: pickupDateTime
      };
      const orderRes = await orderAPI.createOrder(orderPayload);
      const orderId = orderRes?.data?.data?.orderId;
      const confirmedTotal = orderRes?.data?.data?.totalAmount || parseFloat(orderTotal);
      setCreatedOrderId(orderId);
      setOrderTotal(confirmedTotal);

      // 2. Create the payment record
      await paymentAPI.createPayment({
        order_id: orderId,
        payment_type: 'laundry',
        payment_method: paymentMethod,
        amount: confirmedTotal,
        payment_status: paymentMethod === 'cash' ? 'pending' : 'completed',
        ...(paymentMethod === 'card' ? { card_details: cardDetails } : {})
      });

      if (paymentMethod === 'cash') {
        toast.success('Order confirmed! Pay cash on delivery.');
      } else {
        toast.success('Payment successful! Your order is confirmed.');
      }
      navigate('/customer/my-orders');
    } catch (error) {
      toast.error(error.response?.data?.message || error.response?.data?.error || 'Failed to place order. Please try again.');
    } finally {
      setPaymentLoading(false);
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
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Full-page loading overlay */}
      {paymentLoading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 p-8 bg-white rounded-xl border border-gray-200 shadow-lg">
            <div className="w-12 h-12 border-4 border-solid border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-semibold text-gray-800">
              {'Processing payment...'}
            </p>
            <p className="text-xs text-gray-400">Please do not close this page</p>
          </div>
        </div>
      )}

      {/* Page header */}
      <div className="bg-white border-b border-gray-100 pt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
          <h1 className="text-lg font-semibold text-gray-900">Laundry Order</h1>
          <p className="text-sm text-gray-500 mt-0.5">Schedule your pickup and delivery</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
        {/* Step indicator */}
        <div className="flex items-center mb-4">
          {steps.map((s, index) => (
            <React.Fragment key={s.number}>
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 transition-colors ${
                  step >= s.number ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {step > s.number ? <CheckCircle className="w-3.5 h-3.5" /> : s.number}
                </div>
                <span className={`text-sm hidden sm:block transition-colors ${step >= s.number ? 'font-medium text-gray-900' : 'text-gray-400'}`}>
                  {s.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-px mx-3 transition-colors ${step > s.number ? 'bg-blue-500' : 'bg-gray-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* -- STEP 1 -- */}
        {step === 1 && (
          <div className="space-y-3">
            {/* Cleaning types */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h2 className="text-sm font-semibold text-gray-900 mb-2">Cleaning Type <span className="text-red-500">*</span></h2>
              {cleaningTypes.length === 0 ? (
                <p className="text-sm text-amber-700 bg-amber-50 px-3 py-2 rounded-md border border-amber-200">
                  No cleaning types available. Please refresh the page.
                </p>
              ) : (
                <div className="grid sm:grid-cols-2 gap-2">
                  {cleaningTypes.map(type => (
                    <div
                      key={type.id}
                      onClick={() => handleInputChange('cleaning_type_id', type.id)}
                      className={`relative p-3 rounded-lg border cursor-pointer transition-all ${
                        orderData.cleaning_type_id === type.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {orderData.cleaning_type_id === type.id && (
                        <div className="absolute top-2.5 right-2.5 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-3 h-3 text-white" />
                        </div>
                      )}
                      <p className="text-sm font-semibold text-gray-900 pr-5">{type.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{type.description}</p>
                      <p className="text-sm font-bold text-blue-600 mt-1">
                        LKR {parseFloat(type.base_price).toFixed(2)}
                        <span className="text-xs font-normal text-gray-400"> / kg</span>
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Service speed */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h2 className="text-sm font-semibold text-gray-900 mb-2">Service Speed <span className="text-red-500">*</span></h2>
              {serviceTimes.length === 0 ? (
                <p className="text-sm text-amber-700 bg-amber-50 px-3 py-2 rounded-md border border-amber-200">
                  No service times available.
                </p>
              ) : (
                <div className="grid sm:grid-cols-2 gap-2">
                  {serviceTimes.map(time => (
                    <div
                      key={time.id}
                      onClick={() => handleInputChange('service_time_id', time.id)}
                      className={`relative p-3 rounded-lg border cursor-pointer transition-all ${
                        orderData.service_time_id === time.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {orderData.service_time_id === time.id && (
                        <div className="absolute top-2.5 right-2.5 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-3 h-3 text-white" />
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <p className="text-sm font-semibold text-gray-900">{time.name}</p>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">{time.description}</p>
                      <p className="text-xs font-medium text-blue-600 mt-1">{time.price_multiplier}x price</p>
                    </div>
                  ))}
                </div>
              )}
              {selectedServiceDuration > 0 && (
                <p className="text-xs text-gray-500 mt-2 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-100 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span><strong>{selectedServiceDuration}-hour</strong> service — delivery auto-scheduled in next step</span>
                </p>
              )}
            </div>

            {/* Weight & items */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">Laundry Details</h2>
              <div className="mb-3">
                <label className="text-xs text-gray-500 block mb-1">Approximate weight (kg)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number" min="1" max="50" step="0.5"
                    value={orderData.weight_kg}
                    onChange={(e) => handleInputChange('weight_kg', e.target.value)}
                    className="w-20 px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span className="text-xs text-gray-400">kg</span>
                </div>
              </div>

              <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                Items you're sending <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mb-2">
                {itemCategories.map(item => (
                  <div
                    key={item.id}
                    className={`rounded-lg border p-2 transition-all ${
                      itemCounts[item.id] ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className="text-xs font-medium text-gray-700 mb-1.5">{item.label}</p>
                    {!itemCounts[item.id] ? (
                      <button
                        onClick={() => handleItemToggle(item.id)}
                        className="w-full py-1 text-xs text-blue-600 border border-blue-200 rounded hover:bg-blue-50 transition-colors"
                      >
                        + Add
                      </button>
                    ) : (
                      <div className="flex items-center justify-between gap-1">
                        <button onClick={() => decrementItem(item.id)} className="w-6 h-6 flex items-center justify-center bg-white border border-gray-200 rounded text-gray-600 hover:bg-gray-50"><Minus className="w-3 h-3" /></button>
                        <span className="text-xs font-bold text-blue-700 w-5 text-center">{itemCounts[item.id]}</span>
                        <button onClick={() => incrementItem(item.id)} className="w-6 h-6 flex items-center justify-center bg-white border border-gray-200 rounded text-gray-600 hover:bg-gray-50 text-sm leading-none">+</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div>
                <label className="text-xs text-gray-500 block mb-1">Other items</label>
                <input
                  type="text"
                  value={customItems}
                  onChange={(e) => setCustomItems(e.target.value)}
                  placeholder="e.g. silk scarves, baby clothes..."
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {(Object.keys(itemCounts).length > 0 || customItems) && (
                <div className="mt-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-xs text-gray-400 mb-0.5">Summary</p>
                  <p className="text-xs text-gray-700">{buildItemDescription()}</p>
                </div>
              )}
            </div>

            {/* Price estimate */}
            {orderData.cleaning_type_id && orderData.service_time_id && (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Price Estimate</h3>
                </div>
                <div className="divide-y divide-gray-100 text-sm">
                  <div className="flex justify-between px-4 py-2">
                    <span className="text-gray-500">Subtotal ({orderData.weight_kg} kg)</span>
                    <span className="font-medium text-gray-900">LKR {calculatePrice().subtotal}</span>
                  </div>
                  <div className="flex justify-between px-4 py-2">
                    <span className="text-gray-500">Tax (8%)</span>
                    <span className="font-medium text-gray-900">LKR {calculatePrice().tax}</span>
                  </div>
                  <div className="flex justify-between px-4 py-2 bg-gray-50">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="font-bold text-blue-600">LKR {calculatePrice().total}</span>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => setStep(2)}
              disabled={!orderData.cleaning_type_id || !orderData.service_time_id || (Object.keys(itemCounts).length === 0 && !customItems.trim())}
              className="w-full py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              Continue to Schedule
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* -- STEP 2 -- */}
        {step === 2 && (
          <div className="space-y-3">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">Schedule Pickup</h2>

              <div className="grid sm:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Pickup Date <span className="text-red-500">*</span></label>
                  <select
                    value={orderData.pickup_date}
                    onChange={(e) => handleInputChange('pickup_date', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select date</option>
                    {getAvailableDates().map(date => (
                      <option key={date} value={date}>
                        {new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Pickup Time <span className="text-red-500">*</span></label>
                  <select
                    value={orderData.pickup_time}
                    onChange={(e) => handleInputChange('pickup_time', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select time</option>
                    {timeSlots.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Delivery (auto) */}
              <div className="border-t border-gray-100 pt-3">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-3.5 h-3.5 text-gray-400" />
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Estimated Delivery</h3>
                </div>

                {deliveryAdjusted && (
                  <div className="mb-2 flex items-start gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-800">
                      Delivery adjusted to <strong>6:00 AM on {deliveryAdjusted}</strong> — outside our operating hours (6 AM – 11 PM).
                    </p>
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Date</label>
                    <input
                      type="text"
                      value={orderData.delivery_date || '—'}
                      readOnly
                      className="w-full px-3 py-2 text-sm border border-gray-100 rounded-md bg-gray-50 text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Time</label>
                    <input
                      type="text"
                      value={orderData.delivery_time || '—'}
                      readOnly
                      className="w-full px-3 py-2 text-sm border border-gray-100 rounded-md bg-gray-50 text-gray-500"
                    />
                  </div>
                </div>
                {selectedServiceDuration > 0 && orderData.pickup_date && orderData.pickup_time && (
                  <p className="text-xs text-gray-400 mt-1.5">Pickup + {selectedServiceDuration}h service duration</p>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!orderData.pickup_date || !orderData.pickup_time}
                className="flex-1 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* -- STEP 3 -- */}
        {step === 3 && (
          <div className="space-y-3">
            <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
              <h2 className="text-sm font-semibold text-gray-900">Pickup & Delivery</h2>

              <div>
                <label className="text-xs text-gray-500 block mb-1">Pickup Address <span className="text-red-500">*</span></label>
                <textarea
                  value={orderData.pickup_address}
                  onChange={(e) => handleInputChange('pickup_address', e.target.value)}
                  placeholder="Enter your pickup address..."
                  rows={2}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sameAddress}
                  onChange={(e) => handleSameAddressToggle(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs text-gray-600">Same address for delivery</span>
              </label>

              <div>
                <label className="text-xs text-gray-500 block mb-1">Delivery Address <span className="text-red-500">*</span></label>
                <textarea
                  value={orderData.delivery_address}
                  onChange={(e) => handleInputChange('delivery_address', e.target.value)}
                  placeholder="Enter your delivery address..."
                  rows={2}
                  disabled={sameAddress}
                  className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none resize-none transition-colors ${
                    sameAddress
                      ? 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                      : 'border-gray-200 focus:ring-1 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 block mb-1">Detergent Preference</label>
                <select
                  value={orderData.detergent_preference}
                  onChange={(e) => handleInputChange('detergent_preference', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="standard">Standard</option>
                  <option value="sensitive">Sensitive Skin</option>
                  <option value="eco">Eco-Friendly</option>
                  <option value="fragrance-free">Fragrance Free</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-500 block mb-1">Special Instructions</label>
                <textarea
                  value={orderData.special_instructions}
                  onChange={(e) => handleInputChange('special_instructions', e.target.value)}
                  placeholder="Any special requirements..."
                  rows={2}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>
            </div>

            {/* Order summary */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Order Summary</h3>
              </div>
              <div className="divide-y divide-gray-100 text-sm">
                <div className="flex justify-between px-4 py-2">
                  <span className="text-gray-500 shrink-0 mr-4">Items</span>
                  <span className="text-gray-800 text-right text-xs">{buildItemDescription() || '—'}</span>
                </div>
                <div className="flex justify-between px-4 py-2">
                  <span className="text-gray-500">Service</span>
                  <span className="text-gray-800">{(Array.isArray(cleaningTypes) ? cleaningTypes : []).find(t => t.id === parseInt(orderData.cleaning_type_id))?.name || '—'}</span>
                </div>
                <div className="flex justify-between px-4 py-2">
                  <span className="text-gray-500">Speed</span>
                  <span className="text-gray-800">{(Array.isArray(serviceTimes) ? serviceTimes : []).find(t => t.id === parseInt(orderData.service_time_id))?.name || '—'}</span>
                </div>
                <div className="flex justify-between px-4 py-2">
                  <span className="text-gray-500">Weight</span>
                  <span className="text-gray-800">{orderData.weight_kg} kg</span>
                </div>
                <div className="flex justify-between px-4 py-2">
                  <span className="text-gray-500">Pickup</span>
                  <span className="text-gray-800">{orderData.pickup_date} at {orderData.pickup_time}</span>
                </div>
                <div className="flex justify-between px-4 py-2">
                  <span className="text-gray-500">Delivery</span>
                  <span className="text-gray-800">{orderData.delivery_date} at {orderData.delivery_time}</span>
                </div>
                <div className="flex justify-between px-4 py-2 bg-gray-50">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="font-bold text-blue-600">LKR {calculatePrice().total}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={!orderData.pickup_address || !orderData.delivery_address}
                className="flex-1 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                <ChevronRight className="w-4 h-4" />
                Continue to Payment
              </button>
            </div>
          </div>
        )}

        {/* -- STEP 4 -- */}
        {step === 4 && (
          <div className="space-y-3">
            {/* Total recap */}
            <div className="bg-blue-50 rounded-lg border border-blue-200 px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-600 font-medium">Order Total</p>
                <p className="text-2xl font-bold text-blue-700">LKR {orderTotal || calculatePrice().total}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-400" />
            </div>

            {/* Card details */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-gray-400" />
                  <h3 className="text-sm font-semibold text-gray-900">Card Details</h3>
                  <span className="ml-auto text-xs text-gray-400">Secured &amp; Encrypted</span>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Cardholder Name</label>
                  <input
                    type="text"
                    value={cardDetails.cardName}
                    onChange={(e) => setCardDetails(prev => ({ ...prev, cardName: e.target.value }))}
                    placeholder="Name on card"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Card Number</label>
                  <input
                    type="text"
                    value={cardDetails.cardNumber}
                    onChange={(e) => setCardDetails(prev => ({ ...prev, cardNumber: e.target.value.replace(/\D/g, '').slice(0, 16) }))}
                    placeholder="1234 5678 9012 3456"
                    maxLength={16}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-mono tracking-widest"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Expiry</label>
                    <input
                      type="text"
                      value={cardDetails.expiry}
                      onChange={(e) => {
                        let v = e.target.value.replace(/\D/g, '').slice(0, 4);
                        if (v.length >= 2) v = v.slice(0, 2) + '/' + v.slice(2);
                        setCardDetails(prev => ({ ...prev, expiry: v }));
                      }}
                      placeholder="MM/YY"
                      maxLength={5}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">CVV</label>
                    <input
                      type="password"
                      value={cardDetails.cvv}
                      onChange={(e) => setCardDetails(prev => ({ ...prev, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                      placeholder="•••"
                      maxLength={4}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

            <button
              onClick={handlePayment}
              disabled={paymentLoading || !cardDetails.cardName || !cardDetails.cardNumber || !cardDetails.expiry || !cardDetails.cvv}
              className="w-full py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {paymentLoading
                ? <div className="w-4 h-4 border-2 border-solid border-white border-t-transparent rounded-full animate-spin" />
                : <CreditCard className="w-4 h-4" />
              }
              {paymentLoading ? 'Processing...' : `Pay LKR ${orderTotal || calculatePrice().total}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaceOrder;
