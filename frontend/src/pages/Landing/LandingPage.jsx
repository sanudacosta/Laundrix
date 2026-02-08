import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import ChatBot from '../../components/ChatBot';
import { 
  Zap, CheckCircle, Clock, Shield, TrendingUp, Users, 
  Sparkles, Package, Truck, CreditCard, MessageCircle, Star,
  ArrowRight, Play, Shirt, Droplet
} from 'lucide-react';

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

  const services = [
    {
      icon: Sparkles,
      title: 'Dry Cleaning',
      description: 'Professional dry cleaning for delicate fabrics and formal wear',
      features: ['Stain removal', 'Fabric care', 'Same-day service']
    },
    {
      icon: Package,
      title: 'Wash & Fold',
      description: 'Convenient wash, dry, and fold service for everyday items',
      features: ['Express options', 'Eco-friendly', 'Quality guaranteed']
    },
    {
      icon: Users,
      title: 'Suit Rental',
      description: 'Premium suits for weddings, events, and business occasions',
      features: ['Designer brands', 'Perfect fit', 'Flexible rental']
    }
  ];

  const features = [
    {
      icon: Clock,
      title: 'Real-Time Tracking',
      description: 'Monitor your orders from pickup to delivery with live status updates'
    },
    {
      icon: Truck,
      title: 'Free Pickup & Delivery',
      description: 'Convenient doorstep service - we handle pickup and delivery'
    },
    {
      icon: Shield,
      title: 'Quality Guarantee',
      description: '100% satisfaction guaranteed or your money back'
    },
    {
      icon: CreditCard,
      title: 'Easy Online Booking',
      description: 'Simple one-page forms - book laundry or rent suits in minutes'
    },
    {
      icon: MessageCircle,
      title: 'Email Notifications',
      description: 'Stay updated with automated email alerts at every step'
    },
    {
      icon: TrendingUp,
      title: 'Business Insights',
      description: 'Detailed analytics and reports for business owners'
    }
  ];

  const stats = [
    { value: '10K+', label: 'Happy Customers' },
    { value: '50K+', label: 'Orders Completed' },
    { value: '98%', label: 'Satisfaction Rate' },
    { value: '24/7', label: 'Support Available' }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Business Owner',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      content: 'Laundrix transformed our laundry business! The automation and real-time tracking saved us countless hours.',
      rating: 5
    },
    {
      name: 'Michael Chen',
      role: 'Event Planner',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
      content: 'The suit rental service is incredible. Perfect fits every time, and the quality is outstanding!',
      rating: 5
    },
    {
      name: 'Emily Davis',
      role: 'Regular Customer',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
      content: 'So convenient! I schedule pickups through the app and my clothes are always returned perfectly clean.',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <ChatBot />

      {/* Hero Section - Full Height */}
      <section className="relative min-h-screen flex items-center px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-50 -z-10" />
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-blue-600/5 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-blue-400/5 rounded-full blur-3xl -z-10" />

        <div className="max-w-7xl mx-auto w-full pt-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="animate-slide-in-left">
              <div className="inline-flex items-center bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4 mr-2" />
                #1 Laundry & Suit Rental Platform
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Premium Laundry<br />
                <span className="text-blue-600">Made Simple</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Professional laundry service and designer suit rentals in just a few clicks. 
                Easy booking, doorstep delivery, and guaranteed quality.
              </p>

              {/* Quick Action Buttons */}
              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                <button
                  onClick={() => navigate(isAuthenticated ? '/customer/place-order' : '/register')}
                  className="group bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center"
                >
                  <Droplet className="w-5 h-5 mr-2" />
                  Quick Laundry Order
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => navigate(isAuthenticated ? '/customer/browse-suits' : '/register')}
                  className="group bg-gradient-to-r from-gray-800 to-gray-900 text-white px-6 py-4 rounded-xl font-semibold hover:from-gray-900 hover:to-black transition-all shadow-lg hover:shadow-xl flex items-center justify-center"
                >
                  <Shirt className="w-5 h-5 mr-2" />
                  Browse Suits
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button
                  onClick={handleGetStarted}
                  className="group bg-white border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-all flex items-center justify-center"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="flex items-center justify-center px-8 py-4 rounded-lg text-lg font-semibold text-gray-700 hover:bg-gray-100 transition-all">
                  <Play className="w-5 h-5 mr-2" />
                  Watch Demo
                </button>
              </div>
              {/* Stats */}
              <div className="grid grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Content - Hero Image/Illustration */}
            <div className="relative animate-slide-in-right">
              <div className="relative bg-gradient-to-br from-blue-500 to-blue-700 rounded-[2rem] p-8 shadow-2xl transform hover:scale-105 transition-transform duration-500">
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-yellow-400 rounded-full blur-xl opacity-50" />
                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-blue-300 rounded-full blur-xl opacity-50" />
                
                {/* Mock App Interface */}
                <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-xl transform hover:shadow-2xl transition-shadow duration-300">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Package className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">Order #12345</div>
                        <div className="text-xs text-gray-500">In Progress</div>
                      </div>
                    </div>
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shadow-sm">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                  
                  {/* Progress Steps - Timeline Style */}
                  <div className="relative">
                    {[
                      { label: 'Picked Up', status: 'done', time: '2h ago' },
                      { label: 'Processing', status: 'done', time: '1h ago' },
                      { label: 'Quality Check', status: 'active', time: 'Now' },
                      { label: 'Ready for Delivery', status: 'pending', time: '30 min' }
                    ].map((step, idx, arr) => (
                      <div key={idx} className="relative flex items-start pb-8 last:pb-0">
                        {/* Vertical Line */}
                        {idx < arr.length - 1 && (
                          <div className={`absolute left-4 top-8 w-0.5 h-full ${
                            step.status === 'done' ? 'bg-green-300' : 
                            step.status === 'active' ? 'bg-gradient-to-b from-blue-300 to-gray-200' : 
                            'bg-gray-200'
                          }`} />
                        )}
                        
                        {/* Icon Circle */}
                        <div className={`
                          relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all
                          ${step.status === 'done' ? 'bg-green-500 border-green-500 shadow-lg shadow-green-200' : ''}
                          ${step.status === 'active' ? 'bg-blue-500 border-blue-500 shadow-lg shadow-blue-200 animate-pulse' : ''}
                          ${step.status === 'pending' ? 'bg-white border-gray-300' : ''}
                        `}>
                          {step.status === 'done' && (
                            <CheckCircle className="w-5 h-5 text-white" />
                          )}
                          {step.status === 'active' && (
                            <div className="w-3 h-3 bg-white rounded-full" />
                          )}
                          {step.status === 'pending' && (
                            <Clock className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                        
                        {/* Content */}
                        <div className="ml-4 flex-1">
                          <div className="flex items-center justify-between">
                            <p className={`text-sm font-semibold ${
                              step.status === 'done' ? 'text-gray-900' : ''
                            }${step.status === 'active' ? 'text-blue-600' : ''}${
                              step.status === 'pending' ? 'text-gray-400' : ''
                            }`}>
                              {step.label}
                            </p>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              step.status === 'done' ? 'bg-green-50 text-green-700' : ''
                            }${step.status === 'active' ? 'bg-blue-50 text-blue-700 font-medium' : ''}${
                              step.status === 'pending' ? 'bg-gray-50 text-gray-500' : ''
                            }`}>
                              {step.time}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Premium Services
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From everyday laundry to special occasion suit rentals, we've got you covered
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div
                key={index}
                className="group bg-white border-2 border-gray-100 rounded-2xl p-8 hover:border-blue-500 hover:shadow-xl transition-all duration-300 cursor-pointer"
                onClick={() => {
                  if (service.title === 'Suit Rental') {
                    navigate(isAuthenticated ? '/customer/browse-suits' : '/register');
                  } else {
                    navigate(isAuthenticated ? '/customer/place-order' : '/register');
                  }
                }}
              >
                <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
                  <service.icon className="w-7 h-7 text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {service.title}
                </h3>
                <p className="text-gray-600 mb-6">
                  {service.description}
                </p>
                <ul className="space-y-3 mb-6">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-gray-700">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button className="w-full bg-gray-100 group-hover:bg-blue-600 text-gray-700 group-hover:text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center">
                  Learn More
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Four simple steps to perfect laundry
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: '1',
                title: 'Schedule Pickup',
                description: 'Choose your time slot via our app or website',
                icon: Clock
              },
              {
                step: '2',
                title: 'We Collect',
                description: 'Our driver picks up from your doorstep',
                icon: Truck
              },
              {
                step: '3',
                title: 'Expert Care',
                description: 'Professional cleaning with quality checks',
                icon: Shield
              },
              {
                step: '4',
                title: 'Fast Delivery',
                description: 'Fresh clothes delivered back to you',
                icon: CheckCircle
              }
            ].map((step, index) => (
              <div key={index} className="text-center relative">
                {index < 3 && (
                  <div className="hidden md:block absolute top-12 left-1/2 w-full h-0.5 bg-blue-200 -z-10" />
                )}
                <div className="w-24 h-24 bg-white rounded-full shadow-lg flex items-center justify-center mx-auto mb-6 relative">
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {step.step}
                  </div>
                  <step.icon className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Laundrix?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Cutting-edge technology meets exceptional service
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Loved by Thousands
            </h2>
            <p className="text-xl text-gray-600">
              See what our customers have to say
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white border-2 border-gray-100 rounded-2xl p-8 hover:border-blue-200 hover:shadow-lg transition-all"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">
              No hidden fees. Pay only for what you use.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              {
                name: 'Basic',
                price: '800',
                period: 'per load',
                description: 'Perfect for individuals',
                features: [
                  'Wash & Fold service',
                  'Standard turnaround (48h)',
                  'Free pickup & delivery',
                  'Email notifications',
                  'Basic support'
                ],
                popular: false
              },
              {
                name: 'Professional',
                price: '5,500',
                period: 'per month',
                description: 'Best for frequent users',
                features: [
                  'Unlimited wash & fold',
                  'Express turnaround (24h)',
                  'Priority pickup & delivery',
                  'SMS + Email notifications',
                  'Dry cleaning discounts',
                  'Priority support',
                  'Suit rental 20% off'
                ],
                popular: true
              },
              {
                name: 'Business',
                price: 'Custom',
                period: 'contact sales',
                description: 'For hotels & businesses',
                features: [
                  'Volume-based pricing',
                  'Dedicated account manager',
                  'Custom pickup schedule',
                  'API integration',
                  'Analytics dashboard',
                  'Priority processing',
                  'White-label option'
                ],
                popular: false
              }
            ].map((plan, index) => (
              <div
                key={index}
                className={`bg-white rounded-2xl p-8 ${
                  plan.popular
                    ? 'border-2 border-blue-600 shadow-xl relative'
                    : 'border-2 border-gray-100'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <p className="text-gray-600 mb-6">
                  {plan.description}
                </p>
                <div className="mb-6">
                  <span className="text-5xl font-bold text-gray-900">
                    {plan.price === 'Custom' ? plan.price : `LKR ${plan.price}`}
                  </span>
                  <span className="text-gray-600 ml-2">
                    /{plan.period}
                  </span>
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={handleGetStarted}
                  className={`w-full py-3 rounded-lg font-semibold transition-all ${
                    plan.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {plan.price === 'Custom' ? 'Contact Sales' : 'Get Started'}
                </button>
              </div>
            ))}
          </div>

          {/* Trust Badges */}
          <div className="bg-white rounded-2xl p-8 border-2 border-gray-100">
            <p className="text-center text-gray-600 mb-6 font-medium">
              Trusted by leading businesses and thousands of satisfied customers
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8">
              {[
                { name: 'SSL Secure', icon: Shield },
                { name: 'PCI Compliant', icon: CreditCard },
                { name: '24/7 Support', icon: MessageCircle },
                { name: '99.9% Uptime', icon: TrendingUp },
                { name: 'ISO Certified', icon: CheckCircle }
              ].map((badge, index) => (
                <div key={index} className="flex items-center space-x-2 text-gray-600">
                  <badge.icon className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">{badge.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black)]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-20" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl opacity-20" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Your Laundry Experience?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers and businesses. Get started today with our free plan.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleGetStarted}
              className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl flex items-center justify-center"
            >
              {isAuthenticated ? 'Go to Dashboard' : 'Create Free Account'}
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
            <button className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition-all flex items-center justify-center">
              Contact Sales
            </button>
          </div>
          <p className="text-sm text-blue-200 mt-6">
            No credit card required • Free forever plan • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">Laundrix</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                The most advanced laundry and suit rental management platform. 
                Automate operations, track in real-time, and grow your business.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121L7.773 13.23l-2.91-.909c-.64-.203-.658-.64.135-.954l11.355-4.372c.538-.196 1.006.128.832.954z"/></svg>
                </a>
              </div>
            </div>

            {/* Links */}
            <div>
              <h3 className="font-semibold text-lg mb-4 text-white">Product</h3>
              <ul className="space-y-3">
                <li><a href="#services" className="text-gray-400 hover:text-white transition-colors">Services</a></li>
                <li><a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">API</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4 text-white">Company</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Careers</a></li>
                <li><a href="#contact" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2026 Laundrix. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
