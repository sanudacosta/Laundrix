import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User as UserIcon } from 'lucide-react';
import Button from './ui/Button';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: 'Hi! 👋 I\'m your Laundrix assistant. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickReplies = [
    'Pricing information',
    'How does pickup work?',
    'Suit rental process',
    'Track my order',
    'Business hours'
  ];

  const getBotResponse = (userMessage) => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('price') || message.includes('cost') || message.includes('pricing')) {
      return 'Our pricing varies by service:\n\n🧺 Laundry: Starting from $15/load\n🤵 Suit Rental: $50-150/day\n✨ Dry Cleaning: $8-25 per item\n\nWould you like to see detailed pricing?';
    } else if (message.includes('pickup') || message.includes('delivery')) {
      return 'We offer free pickup and delivery! 🚚\n\n1. Schedule via our app/website\n2. We pick up at your doorstep\n3. Process your items\n4. Deliver back to you\n\nUsually takes 24-48 hours for standard service.';
    } else if (message.includes('suit') || message.includes('rental')) {
      return 'Our suit rental process:\n\n1. Browse our collection online\n2. Select size and rental period\n3. Reserve with deposit\n4. Pickup or delivery\n5. Return after event\n\nWe have designer suits for all occasions!';
    } else if (message.includes('track') || message.includes('order')) {
      return 'You can track your order in real-time! 📱\n\n• Sign in to your account\n• Go to "My Orders"\n• See live status updates\n\nOr provide your order number for instant tracking.';
    } else if (message.includes('hour') || message.includes('open') || message.includes('time')) {
      return 'We\'re here for you! ⏰\n\n• Mon-Fri: 7 AM - 9 PM\n• Saturday: 8 AM - 8 PM\n• Sunday: 9 AM - 6 PM\n\nPickup/delivery available 24/7 with scheduling!';
    } else if (message.includes('hello') || message.includes('hi')) {
      return 'Hello! 👋 How can I assist you with your laundry or suit rental needs today?';
    } else if (message.includes('thank')) {
      return 'You\'re welcome! 😊 Is there anything else I can help you with?';
    } else {
      return 'I\'d be happy to help! I can assist with:\n\n• Pricing & Services\n• Pickup & Delivery\n• Suit Rentals\n• Order Tracking\n• Business Hours\n\nWhat would you like to know?';
    }
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    // Add user message
    const userMsg = {
      type: 'user',
      text: inputMessage,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');

    // Show typing indicator
    setIsTyping(true);

    // Simulate bot response delay
    setTimeout(() => {
      const botResponse = {
        type: 'bot',
        text: getBotResponse(inputMessage),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleQuickReply = (reply) => {
    setInputMessage(reply);
    // Auto-send after a brief moment
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white p-4 rounded-full shadow-2xl hover:bg-blue-700 hover:scale-110 transition-all duration-300 animate-bounce"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col animate-slide-in-bottom">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold">Laundrix Assistant</h3>
                <p className="text-xs text-blue-100">Online • Instant replies</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex items-start space-x-2 ${
                  message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.type === 'bot'
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {message.type === 'bot' ? (
                    <Bot className="w-5 h-5" />
                  ) : (
                    <UserIcon className="w-5 h-5" />
                  )}
                </div>
                <div
                  className={`max-w-[70%] p-3 rounded-2xl ${
                    message.type === 'bot'
                      ? 'bg-white border border-gray-200'
                      : 'bg-blue-600 text-white'
                  }`}
                >
                  <p className="text-sm whitespace-pre-line">{message.text}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.type === 'bot' ? 'text-gray-400' : 'text-blue-100'
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-start space-x-2">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="bg-white border border-gray-200 p-3 rounded-2xl">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          {messages.length <= 2 && (
            <div className="px-4 py-2 border-t border-gray-200 bg-white">
              <p className="text-xs text-gray-500 mb-2">Quick questions:</p>
              <div className="flex flex-wrap gap-2">
                {quickReplies.map((reply, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickReply(reply)}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-full transition-colors"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 bg-gray-100 rounded-full border-0 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim()}
                className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
