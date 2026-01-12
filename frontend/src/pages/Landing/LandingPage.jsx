import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      const dashboardPath = user?.role === 'admin' ? '/admin/dashboard' 
        : user?.role === 'employee' ? '/employee/dashboard' 
        : '/customer/dashboard';
      navigate(dashboardPath);
    } else {
      navigate('/register');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">Laundrix</h1>
            </div>
            <div className="flex items-center space-x-4">
              {!isAuthenticated ? (
                <>
                  <Link to="/login" className="text-gray-700 hover:text-blue-600 px-3 py-2">
                    Login
                  </Link>
                  <Link 
                    to="/register" 
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Sign Up
                  </Link>
                </>
              ) : (
                <Link 
                  to={user?.role === 'admin' ? '/admin/dashboard' : user?.role === 'employee' ? '/employee/dashboard' : '/customer/dashboard'}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h2 className="text-5xl font-bold mb-6">
              Professional Laundry & Suit Rental Service
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              Experience premium laundry care and elegant suit rentals with real-time tracking
            </p>
            <button
              onClick={handleGetStarted}
              className="bg-white text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-50 transition"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Our Services
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Laundry Service */}
            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition">
              <div className="text-blue-600 text-4xl mb-4">🧺</div>
              <h4 className="text-2xl font-semibold mb-4 text-gray-800">Laundry Service</h4>
              <ul className="space-y-2 text-gray-600">
                <li>✓ Dry Clean, Wash & Iron, Steam Clean</li>
                <li>✓ Express, Same Day, and Standard Service</li>
                <li>✓ Real-time Order Tracking</li>
                <li>✓ Online and Walk-in Orders</li>
                <li>✓ Specialized Stain Removal</li>
              </ul>
            </div>

            {/* Suit Rental */}
            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition">
              <div className="text-blue-600 text-4xl mb-4">🤵</div>
              <h4 className="text-2xl font-semibold mb-4 text-gray-800">Suit Rental</h4>
              <ul className="space-y-2 text-gray-600">
                <li>✓ Business Formal & Wedding Suits</li>
                <li>✓ Tuxedos & Designer Collections</li>
                <li>✓ Flexible Rental Periods</li>
                <li>✓ Professional Fitting Service</li>
                <li>✓ Secure Deposit System</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Key Features */}
      <div className="bg-gray-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Why Choose Laundrix?
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg text-center">
              <div className="text-blue-600 text-3xl mb-3">📱</div>
              <h4 className="text-xl font-semibold mb-2">Real-time Tracking</h4>
              <p className="text-gray-600">Track your orders and rentals in real-time with instant notifications</p>
            </div>
            <div className="bg-white p-6 rounded-lg text-center">
              <div className="text-blue-600 text-3xl mb-3">💳</div>
              <h4 className="text-xl font-semibold mb-2">Multiple Payment Options</h4>
              <p className="text-gray-600">Pay online, with card, or cash - flexible payment methods</p>
            </div>
            <div className="bg-white p-6 rounded-lg text-center">
              <div className="text-blue-600 text-3xl mb-3">🤖</div>
              <h4 className="text-xl font-semibold mb-2">AI Support</h4>
              <p className="text-gray-600">Get instant help from our AI-powered chatbot assistant</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold mb-4">Ready to Experience Premium Service?</h3>
          <p className="text-xl mb-8 text-blue-100">Join thousands of satisfied customers today</p>
          <button
            onClick={handleGetStarted}
            className="bg-white text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-50 transition"
          >
            {isAuthenticated ? 'Go to Dashboard' : 'Create Account'}
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-lg font-semibold mb-2">Laundrix</p>
            <p className="text-gray-400">© 2026 Laundrix. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
