// Mock Payment Service
// In production, integrate with Stripe, PayPal, or other payment gateways

import { v4 as uuidv4 } from 'uuid';

export const processPayment = async (paymentData) => {
  try {
    const { amount, paymentMethod, cardDetails, customerInfo } = paymentData;

    // Mock payment processing
    console.log('💳 Payment Mock - Processing payment...');
    console.log('💳 Amount:', amount);
    console.log('💳 Method:', paymentMethod);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Simulate random success/failure (95% success rate)
    const isSuccess = Math.random() > 0.05;
    
    if (!isSuccess) {
      throw new Error('Payment declined by mock processor');
    }

    const transactionId = `TXN-${uuidv4()}`;
    
    // In production, replace with actual payment gateway:
    // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    // const paymentIntent = await stripe.paymentIntents.create({
    //   amount: amount * 100, // Convert to cents
    //   currency: 'usd',
    //   payment_method: paymentMethodId,
    //   confirm: true,
    // });
    // const transactionId = paymentIntent.id;

    return {
      success: true,
      transactionId,
      amount,
      status: 'completed',
      provider: 'mock',
      timestamp: new Date()
    };
  } catch (error) {
    console.error('❌ Payment error:', error.message);
    return {
      success: false,
      error: error.message,
      status: 'failed'
    };
  }
};

export const processRefund = async (transactionId, amount) => {
  try {
    console.log('💰 Refund Mock - Processing refund...');
    console.log('💰 Transaction ID:', transactionId);
    console.log('💰 Amount:', amount);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const refundId = `REF-${uuidv4()}`;
    
    // In production, replace with actual payment gateway:
    // const refund = await stripe.refunds.create({
    //   payment_intent: transactionId,
    //   amount: amount * 100,
    // });
    // const refundId = refund.id;

    return {
      success: true,
      refundId,
      amount,
      status: 'refunded',
      provider: 'mock',
      timestamp: new Date()
    };
  } catch (error) {
    console.error('❌ Refund error:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

// Payment method validation
export const validatePaymentMethod = async (paymentMethod, details) => {
  // Mock validation
  if (paymentMethod === 'card' && details.cardNumber) {
    return {
      valid: true,
      last4: details.cardNumber.slice(-4)
    };
  }
  
  return { valid: true };
};

export default {
  processPayment,
  processRefund,
  validatePaymentMethod
};
