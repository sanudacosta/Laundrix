import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, Zap, User, Phone, MapPin, CheckCircle, AlertCircle, Shield, ArrowLeft, Check, X } from 'lucide-react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import TermsModal from '../../components/modals/TermsModal';
import PrivacyModal from '../../components/modals/PrivacyModal';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successOverlay, setSuccessOverlay] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailValid, setEmailValid] = useState(null);
  const [passwordsMatch, setPasswordsMatch] = useState(null);
  const [shake, setShake] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const formatPhoneNumber = (value) => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
    if (match) {
      return [match[1], match[2], match[3]].filter(x => x).join('-');
    }
    return value;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    // Format phone number
    if (name === 'phone') {
      newValue = formatPhoneNumber(value);
    }
    
    setFormData({
      ...formData,
      [name]: newValue,
    });

    // Real-time email validation
    if (name === 'email') {
      if (value.length > 0) {
        setEmailValid(validateEmail(value));
      } else {
        setEmailValid(null);
      }
    }

    // Check if passwords match
    if (name === 'confirmPassword' || name === 'password') {
      const pwd = name === 'password' ? value : formData.password;
      const confirmPwd = name === 'confirmPassword' ? value : formData.confirmPassword;
      if (confirmPwd.length > 0) {
        setPasswordsMatch(pwd === confirmPwd);
      } else {
        setPasswordsMatch(null);
      }
    }
  };

  // Password strength calculator
  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, text: '', color: '' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    if (strength <= 2) return { strength, text: 'Weak', color: 'bg-red-500' };
    if (strength <= 3) return { strength, text: 'Fair', color: 'bg-yellow-500' };
    if (strength <= 4) return { strength, text: 'Good', color: 'bg-blue-500' };
    return { strength, text: 'Strong', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    setLoading(true);

    const { confirmPassword, ...registerData } = formData;
    const result = await register(registerData);

    if (result.success) {
      setSuccessOverlay(true);
      setTimeout(() => navigate('/customer/dashboard'), 2000);
    } else {
      setError(result.message);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Success overlay */}
      {successOverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-9 h-9 text-green-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Account Created!</h2>
            <p className="text-sm text-gray-500">Redirecting you to your dashboard...</p>
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mt-2" />
          </div>
        </div>
      )}
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 items-start justify-center p-12 animate-fade-in overflow-y-auto">
        <div className="max-w-md text-white my-12">
          <div className="mb-8">
            <Shield className="w-16 h-16 text-blue-300 mb-6" />
            <h2 className="text-4xl font-bold mb-6">
              Start Your Journey with Laundrix
            </h2>
            <p className="text-lg text-blue-100 mb-8">
              Join hundreds of laundry businesses that trust Laundrix for complete operational management.
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-6 h-6 text-blue-300 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold mb-1">Free Forever Plan</h3>
                <p className="text-sm text-blue-100">Get started with no credit card required</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-6 h-6 text-blue-300 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold mb-1">Easy Setup</h3>
                <p className="text-sm text-blue-100">Start managing orders in under 5 minutes</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-6 h-6 text-blue-300 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold mb-1">24/7 Support</h3>
                <p className="text-sm text-blue-100">Get help whenever you need it</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-6 h-6 text-blue-300 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold mb-1">Secure & Reliable</h3>
                <p className="text-sm text-blue-100">Enterprise-grade security for your data</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-start justify-center px-4 sm:px-6 lg:px-20 xl:px-24 bg-white animate-slide-in-right overflow-y-auto">
        <div className="max-w-md w-full py-12">
          {/* Logo and Back to Home Row */}
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-semibold text-gray-900">Laundrix</span>
            </div>
            <Link
              to="/"
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </div>

          {/* Header */}
          <div className="text-left mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Create Your Account</h2>
            <p className="text-gray-600 text-sm">
              Join thousands of businesses streamlining their laundry operations
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className={`bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center space-x-2 mb-6 ${shake ? 'animate-shake' : ''}`}>
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name Input */}
            <Input
              label="Full Name"
              type="text"
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Enter your full name"
              icon={User}
              required
            />

            {/* Email Input with Validation */}
            <div className="relative">
              <Input
                label="Email"
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                icon={Mail}
                required
                className="pr-10"
              />
              {emailValid !== null && (
                <div className="absolute right-3 top-[42px] pointer-events-none">
                  {emailValid ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <X className="w-5 h-5 text-red-500" />
                  )}
                </div>
              )}
            </div>

            {/* Phone Input with Auto-formatting */}
            <Input
              label="Phone Number"
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="555-123-4567"
              icon={Phone}
              required
            />

            {/* Address Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Address (Optional)
              </label>
              <div className="relative flex items-start bg-gray-100 rounded-lg transition-all focus-within:bg-gray-200 focus-within:ring-2 focus-within:ring-blue-500/40">
                <div className="pl-3 pt-3 text-gray-400">
                  <MapPin className="h-5 w-5" />
                </div>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="2"
                  placeholder="Enter your address"
                  className="w-full bg-transparent py-3 pl-3 pr-4 text-gray-900 placeholder-gray-400 outline-none border-none focus:outline-none focus:ring-0 resize-none"
                />
              </div>
            </div>

            {/* Password Input with Strength Indicator */}
            <div>
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a strong password"
                icon={Lock}
                rightIcon={showPassword ? EyeOff : Eye}
                onRightIconClick={() => setShowPassword(!showPassword)}
                required
              />
              
              {/* Password Strength Meter */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">Password Strength:</span>
                    <span className={`text-xs font-medium ${
                      passwordStrength.text === 'Weak' ? 'text-red-600' :
                      passwordStrength.text === 'Fair' ? 'text-yellow-600' :
                      passwordStrength.text === 'Good' ? 'text-blue-600' :
                      'text-green-600'
                    }`}>
                      {passwordStrength.text}
                    </span>
                  </div>
                  <div className="flex gap-1 h-1.5">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`flex-1 rounded-full transition-all ${
                          level <= passwordStrength.strength
                            ? passwordStrength.color
                            : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Use 8+ characters with uppercase, lowercase, numbers & symbols
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password Input with Match Indicator */}
            <div className="relative">
              <Input
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                icon={Lock}
                rightIcon={showConfirmPassword ? EyeOff : Eye}
                onRightIconClick={() => setShowConfirmPassword(!showConfirmPassword)}
                required
                className="pr-10"
              />
              {passwordsMatch !== null && (
                <div className="absolute right-12 top-[42px] pointer-events-none">
                  {passwordsMatch ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <X className="w-5 h-5 text-red-500" />
                  )}
                </div>
              )}
            </div>

            {/* Terms and Privacy */}
            <div className="flex items-start space-x-2 pt-2">
              <input
                type="checkbox"
                id="terms"
                required
                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="terms" className="text-sm text-gray-600">
                I agree to the{' '}
                <span
                  onClick={() => setShowTermsModal(true)}
                  className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                >
                  Terms of Service
                </span>
                {' '}and{' '}
                <span
                  onClick={() => setShowPrivacyModal(true)}
                  className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                >
                  Privacy Policy
                </span>
              </label>
            </div>

            {/* Create Account Button */}
            <Button
              type="submit"
              loading={loading}
              variant="primary"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">OR</span>
            </div>
          </div>

          {/* Social Sign Up Buttons */}
          <div className="space-y-3 mb-6">
            <Button
              type="button"
              variant="secondary"
              className="text-sm py-2.5"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign up with Google
            </Button>

            <Button
              type="button"
              variant="secondary"
              className="text-sm py-2.5"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" fill="#1877F2"/>
              </svg>
              Sign up with Facebook
            </Button>
          </div>

          {/* Sign In Link */}
          <div className="text-center pt-4">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Modals */}
      <TermsModal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} />
      <PrivacyModal isOpen={showPrivacyModal} onClose={() => setShowPrivacyModal(false)} />
    </div>
  );
};

export default RegisterPage;
