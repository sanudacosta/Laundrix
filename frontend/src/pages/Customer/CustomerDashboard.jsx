import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const CustomerDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-2xl font-bold text-blue-600">Laundrix</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.full_name}</span>
              <button
                onClick={logout}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">Customer Dashboard</h2>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            to="/customer/place-order"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition text-center"
          >
            <div className="text-blue-600 text-4xl mb-3">🧺</div>
            <h3 className="text-xl font-semibold mb-2">Place Laundry Order</h3>
            <p className="text-gray-600">Submit a new laundry order</p>
          </Link>

          <Link
            to="/customer/browse-suits"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition text-center"
          >
            <div className="text-blue-600 text-4xl mb-3">🤵</div>
            <h3 className="text-xl font-semibold mb-2">Browse Suits</h3>
            <p className="text-gray-600">View and rent elegant suits</p>
          </Link>

          <Link
            to="/customer/my-orders"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition text-center"
          >
            <div className="text-blue-600 text-4xl mb-3">📋</div>
            <h3 className="text-xl font-semibold mb-2">My Orders</h3>
            <p className="text-gray-600">Track laundry orders</p>
          </Link>

          <Link
            to="/customer/my-rentals"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition text-center"
          >
            <div className="text-blue-600 text-4xl mb-3">👔</div>
            <h3 className="text-xl font-semibold mb-2">My Rentals</h3>
            <p className="text-gray-600">Track suit rentals</p>
          </Link>

          <Link
            to="/customer/my-payments"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition text-center"
          >
            <div className="text-blue-600 text-4xl mb-3">💳</div>
            <h3 className="text-xl font-semibold mb-2">My Payments</h3>
            <p className="text-gray-600">View payment history</p>
          </Link>

          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition text-center">
            <div className="text-blue-600 text-4xl mb-3">🤖</div>
            <h3 className="text-xl font-semibold mb-2">AI Chatbot</h3>
            <p className="text-gray-600">Get instant support</p>
            <p className="text-sm text-gray-500 mt-2">(Coming Soon)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
