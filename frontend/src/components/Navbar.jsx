import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, Menu, X, ChevronDown, User, LogOut, Package, Shirt, CreditCard } from 'lucide-react';
import Button from './ui/Button';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setUserMenuOpen(false);
  };

  const getDashboardPath = () => {
    if (!user) return '/';
    return user.role === 'admin' ? '/admin/dashboard' 
      : user.role === 'employee' ? '/employee/dashboard' 
      : '/';
  };

  const navLinks = [
    { name: 'Services', href: '#services' },
    { name: 'Features', href: '#features' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Contact', href: '#contact' },
  ];

  const handleNavClick = (e, href) => {
    e.preventDefault();
    
    // If not on home page, navigate to home first
    if (location.pathname !== '/') {
      navigate('/', { state: { scrollTo: href } });
      return;
    }
    
    // Scroll to section
    const element = document.querySelector(href);
    if (element) {
      const offset = 80; // Account for fixed navbar
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 bg-white/95 backdrop-blur-md ${
        scrolled
          ? 'shadow-lg'
          : 'shadow-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">
              Laundrix
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors cursor-pointer"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-700 hover:text-blue-600 px-4 py-2 rounded-lg transition-colors"
                >
                  Sign In
                </Link>
                <Link to="/register">
                  <Button variant="primary" className="text-sm py-2.5">
                    Get Started
                  </Button>
                </Link>
              </>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium">{user?.full_name || 'User'}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-2 z-50 animate-slide-in-bottom">
                      {/* Customer Links */}
                      {user?.role === 'customer' && (
                        <>
                          <Link
                            to="/customer/account"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            <User className="w-4 h-4 mr-3" />
                            My Account
                          </Link>
                          <Link
                            to="/customer/my-orders"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            <Package className="w-4 h-4 mr-3" />
                            My Orders
                          </Link>
                          <Link
                            to="/customer/my-rentals"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            <Shirt className="w-4 h-4 mr-3" />
                            My Rentals
                          </Link>
                          <Link
                            to="/customer/my-payments"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            <CreditCard className="w-4 h-4 mr-3" />
                            My Payments
                          </Link>
                        </>
                      )}
                      
                      {/* Admin/Employee Links */}
                      {(user?.role === 'admin' || user?.role === 'employee') && (
                        <Link
                          to={getDashboardPath()}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          <User className="w-4 h-4 mr-3" />
                          Dashboard
                        </Link>
                      )}
                      
                      <hr className="my-2 border-gray-200" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-xl animate-slide-in-bottom">
          <div className="px-4 py-6 space-y-4">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => {
                  handleNavClick(e, link.href);
                  setMobileMenuOpen(false);
                }}
                className="block text-gray-700 hover:text-blue-600 font-medium py-2 transition-colors cursor-pointer"
              >
                {link.name}
              </a>
            ))}
            <hr className="border-gray-200" />
            {!isAuthenticated ? (
              <div className="space-y-3">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button variant="secondary" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button variant="primary" className="w-full">
                    Get Started
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {user?.role === 'customer' ? (
                  <>
                    <Link
                      to="/customer/account"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                    >
                      <User className="w-5 h-5 mr-3" />
                      My Account
                    </Link>
                    <Link
                      to="/customer/my-orders"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                    >
                      <Package className="w-5 h-5 mr-3" />
                      My Orders
                    </Link>
                    <Link
                      to="/customer/my-rentals"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                    >
                      <Shirt className="w-5 h-5 mr-3" />
                      My Rentals
                    </Link>
                    <Link
                      to="/customer/my-payments"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                    >
                      <CreditCard className="w-5 h-5 mr-3" />
                      My Payments
                    </Link>
                  </>
                ) : (
                  <Link
                    to={getDashboardPath()}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                  >
                    <User className="w-5 h-5 mr-3" />
                    Dashboard
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
