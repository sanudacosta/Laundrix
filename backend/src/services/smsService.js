// Mock SMS Service
// In production, integrate with Twilio, AWS SNS, or other SMS providers

export const sendSMS = async (phoneNumber, message) => {
  try {
    // Mock SMS sending
    console.log('📱 SMS Mock - Sending to:', phoneNumber);
    console.log('📱 SMS Mock - Message:', message);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // In production, replace with actual SMS provider:
    // const twilio = require('twilio');
    // const client = twilio(accountSid, authToken);
    // await client.messages.create({
    //   body: message,
    //   from: twilioPhoneNumber,
    //   to: phoneNumber
    // });

    return { 
      success: true, 
      messageId: `SMS-${Date.now()}`,
      provider: 'mock' 
    };
  } catch (error) {
    console.error('❌ SMS error:', error.message);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

// SMS templates
export const smsTemplates = {
  orderReady: (orderNumber) => 
    `Laundrix: Your order ${orderNumber} is ready for pickup!`,
  
  rentalReminder: (rentalNumber, returnDate) => 
    `Laundrix: Reminder - Suit rental ${rentalNumber} due on ${returnDate}`,
  
  paymentConfirmation: (amount) => 
    `Laundrix: Payment of $${amount} received. Thank you!`,
  
  orderAssigned: (orderNumber) => 
    `Laundrix: Order ${orderNumber} has been assigned to you`,
};

export default { sendSMS, smsTemplates };
