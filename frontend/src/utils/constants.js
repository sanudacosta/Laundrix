// Static Configuration Constants for Laundrix System
// NOTE: Dynamic pricing for laundry services and suit rentals comes from the database
// Use adminAPI.getCleaningTypes(), adminAPI.getServiceTimes(), and rentalAPI.getAllSuits()

// System Configuration
export const CONFIG = {
  DEPOSIT_AMOUNT: 10000, // Standard deposit for suit rentals (LKR)
  TAX_RATE: 0.08, // 8% tax rate
  CURRENCY: 'LKR',
  MIN_ADVANCE_BOOKING_DAYS: 3, // Minimum days in advance for booking
};

// Time Slots for Pickup/Delivery
export const TIME_SLOTS = [
  { value: 'morning', label: '8:00 AM - 12:00 PM', hours: '8AM-12PM' },
  { value: 'afternoon', label: '12:00 PM - 4:00 PM', hours: '12PM-4PM' },
  { value: 'evening', label: '4:00 PM - 8:00 PM', hours: '4PM-8PM' },
];

// Order Status Enum
export const ORDER_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in-progress',
  READY: 'ready',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

// Rental Status Enum
export const RENTAL_STATUS = {
  RESERVED: 'reserved',
  ACTIVE: 'active',
  RETURNED: 'returned',
  OVERDUE: 'overdue',
  CANCELLED: 'cancelled',
};

// Payment Status Enum
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
};

// Detergent Options
export const DETERGENT_OPTIONS = [
  { value: 'standard', label: 'Standard Detergent' },
  { value: 'hypoallergenic', label: 'Hypoallergenic' },
  { value: 'eco_friendly', label: 'Eco-Friendly' },
  { value: 'fragrance_free', label: 'Fragrance Free' },
];

// Suit Sizes
export const SUIT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '38R', '40R', '42R', '44R', '46R'];

// Suit Occasions
export const SUIT_OCCASIONS = [
  'Wedding',
  'Business',
  'Prom',
  'Graduation',
  'Formal Event',
  'Party',
];

// Sri Lankan Cities for Service Coverage
export const SRI_LANKAN_CITIES = [
  'Colombo',
  'Kandy',
  'Galle',
  'Negombo',
  'Jaffna',
  'Anuradhapura',
  'Trincomalee',
  'Batticaloa',
  'Kurunegala',
  'Matara',
];

// Utility Functions

// Format currency in LKR
export const formatCurrency = (amount) => {
  return `LKR ${amount.toLocaleString('en-LK')}`;
};

// Calculate days difference
export const calculateDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Get available dates for scheduling (starts 3 days from today)
export const getAvailableDates = () => {
  const dates = [];
  const today = new Date();
  
  // Start from 3 days in advance
  for (let i = CONFIG.MIN_ADVANCE_BOOKING_DAYS; i <= CONFIG.MIN_ADVANCE_BOOKING_DAYS + 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push({
      value: date.toISOString().split('T')[0],
      label: date.toLocaleDateString('en-LK', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      }),
    });
  }
  
  return dates;
};

// Format date for display
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-LK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Format date with time
export const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-LK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
