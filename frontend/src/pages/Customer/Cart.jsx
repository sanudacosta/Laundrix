import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { ShoppingCart, Trash2, Calendar, Shirt, MapPin, CreditCard, ArrowRight, Package, Info } from 'lucide-react';
import { rentalAPI } from '../../services/apiService';

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingCheckout, setProcessingCheckout] = useState(false);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await rentalAPI.getCart();
      const items = response?.data?.data || [];
      setCartItems(items);
    } catch (error) {
      console.error('Error fetching cart:', error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (itemId) => {
    if (!confirm('Remove this item from cart?')) return;

    try {
      await rentalAPI.removeFromCart(itemId);
      toast.success('Item removed from cart');
      fetchCart();
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Failed to remove item. Please try again.');
    }
  };

  const handleClearCart = async () => {
    if (!confirm('Clear all items from cart?')) return;

    try {
      await rentalAPI.clearCart();
      toast.success('Cart cleared');
      fetchCart();
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Failed to clear cart. Please try again.');
    }
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    try {
      setProcessingCheckout(true);
      const response = await rentalAPI.checkout();
      toast.success(`Checkout successful! ${response.data.data.length} rental(s) created.`, { duration: 4000 });
      navigate('/customer/my-rentals');
    } catch (error) {
      console.error('Error during checkout:', error);
      toast.error(error.response?.data?.message || 'Checkout failed. Please try again.');
    } finally {
      setProcessingCheckout(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateCartTotal = () => {
    if (!Array.isArray(cartItems) || cartItems.length === 0) return 0;
    return cartItems.reduce((sum, item) => {
      const rental = parseFloat(item.rental_amount) || 0;
      const deposit = parseFloat(item.deposit_amount) || 0;
      return sum + rental + deposit;
    }, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 flex items-center">
                <ShoppingCart className="w-10 h-10 mr-3 text-blue-600" />
                Shopping Cart
              </h1>
              <p className="text-gray-600 mt-2">
                {cartItems.length === 0 
                  ? 'Your cart is empty' 
                  : `${cartItems.length} item${cartItems.length > 1 ? 's' : ''} in your cart`
                }
              </p>
            </div>
            {cartItems.length > 0 && (
              <button
                onClick={handleClearCart}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear Cart</span>
              </button>
            )}
          </div>
        </div>

        {cartItems.length === 0 ? (
          /* Empty Cart State */
          <div className="bg-white rounded-2xl shadow-lg p-16 text-center">
            <div className="mb-6">
              <ShoppingCart className="w-24 h-24 mx-auto text-gray-300" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Add some suits to your cart to get started</p>
            <button
              onClick={() => navigate('/customer/browse-suits')}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl flex items-center space-x-2 mx-auto"
            >
              <Package className="w-5 h-5" />
              <span>Browse Suits</span>
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow p-6">
                  <div className="flex items-start space-x-4">
                    {/* Image */}
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-32 h-32 object-cover rounded-xl flex-shrink-0"
                      />
                    ) : (
                      <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Shirt className="w-16 h-16 text-blue-400" />
                      </div>
                    )}

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{item.brand}</h3>
                          <p className="text-sm text-gray-600">{item.category_name}</p>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                          title="Remove from cart"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center space-x-2 text-gray-700">
                          <Shirt className="w-4 h-4 text-blue-600" />
                          <span className="font-semibold">Size:</span>
                          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold">
                            {item.size}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2 text-gray-700">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          <span className="font-semibold">Dates:</span>
                          <span>{formatDate(item.rental_start_date)} - {formatDate(item.rental_end_date)}</span>
                          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-semibold">
                            {item.rental_days} days
                          </span>
                        </div>

                        {item.occasion && (
                          <div className="flex items-center space-x-2 text-gray-700">
                            <span className="font-semibold">Occasion:</span>
                            <span>{item.occasion}</span>
                          </div>
                        )}

                        {item.delivery_address && (
                          <div className="flex items-start space-x-2 text-gray-700">
                            <MapPin className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <span className="font-semibold">Delivery:</span>
                              <p className="text-xs text-gray-600 mt-1">{item.delivery_address}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Pricing */}
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Rental Amount:</span>
                          <span className="font-semibold text-gray-900">{formatCurrency(item.rental_amount)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm mt-1">
                          <span className="text-gray-600">Security Deposit:</span>
                          <span className="font-semibold text-gray-900">{formatCurrency(item.deposit_amount)}</span>
                        </div>
                        <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200">
                          <span className="font-bold text-gray-900">Subtotal:</span>
                          <span className="text-lg font-bold text-blue-600">
                            {formatCurrency(parseFloat(item.rental_amount) + parseFloat(item.deposit_amount))}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={() => navigate('/customer/browse-suits')}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center space-x-2"
              >
                <Package className="w-5 h-5" />
                <span>Continue Shopping</span>
              </button>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <CreditCard className="w-6 h-6 mr-2 text-blue-600" />
                  Order Summary
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-700">
                    <span>Items ({cartItems.length}):</span>
                    <span className="font-semibold">
                      {formatCurrency(
                        cartItems.reduce((sum, item) => sum + parseFloat(item.rental_amount || 0), 0)
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-gray-700">
                    <span>Total Deposits:</span>
                    <span className="font-semibold">
                      {formatCurrency(
                        cartItems.reduce((sum, item) => sum + parseFloat(item.deposit_amount || 0), 0)
                      )}
                    </span>
                  </div>

                  <div className="border-t-2 border-gray-200 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">Total Amount:</span>
                      <span className="text-2xl font-bold text-blue-600">
                        {formatCurrency(calculateCartTotal())}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <p className="text-xs text-blue-800 flex items-start">
                    <Info className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                    <span>
                      Security deposits will be fully refunded upon safe return of all suits in good condition.
                    </span>
                  </p>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={processingCheckout || cartItems.length === 0}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-blue-800 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                >
                  {processingCheckout ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>Proceed to Checkout</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  You'll be redirected to payment after checkout
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
