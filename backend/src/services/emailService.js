import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

// Send email function
export const sendEmail = async (to, subject, html) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'Laundrix <noreply@laundrix.com>',
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email error:', error.message);
    return { success: false, error: error.message };
  }
};

// Email templates
export const emailTemplates = {
  orderConfirmation: (orderNumber, customerName, deliveryDate) => `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
      <h2 style="color: #1890ff;">Order Confirmation</h2>
      <p>Dear ${customerName},</p>
      <p>Your laundry order <strong>${orderNumber}</strong> has been confirmed.</p>
      <p><strong>Expected Delivery:</strong> ${deliveryDate}</p>
      <p>Thank you for choosing Laundrix!</p>
      <hr style="margin: 20px 0;">
      <p style="font-size: 12px; color: #666;">
        This is an automated message. Please do not reply to this email.
      </p>
    </div>
  `,

  orderReady: (orderNumber, customerName) => `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
      <h2 style="color: #52c41a;">Order Ready for Pickup!</h2>
      <p>Dear ${customerName},</p>
      <p>Great news! Your laundry order <strong>${orderNumber}</strong> is ready for pickup.</p>
      <p>Please visit our location to collect your items.</p>
      <p>Thank you for choosing Laundrix!</p>
      <hr style="margin: 20px 0;">
      <p style="font-size: 12px; color: #666;">
        This is an automated message. Please do not reply to this email.
      </p>
    </div>
  `,

  rentalConfirmation: (rentalNumber, customerName, suitName, startDate, endDate) => `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
      <h2 style="color: #1890ff;">Suit Rental Confirmation</h2>
      <p>Dear ${customerName},</p>
      <p>Your suit rental <strong>${rentalNumber}</strong> has been confirmed.</p>
      <p><strong>Suit:</strong> ${suitName}</p>
      <p><strong>Rental Period:</strong> ${startDate} to ${endDate}</p>
      <p>Please collect your suit on or after the start date.</p>
      <p>Thank you for choosing Laundrix!</p>
      <hr style="margin: 20px 0;">
      <p style="font-size: 12px; color: #666;">
        This is an automated message. Please do not reply to this email.
      </p>
    </div>
  `,

  rentalReminder: (rentalNumber, customerName, returnDate) => `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
      <h2 style="color: #faad14;">Rental Return Reminder</h2>
      <p>Dear ${customerName},</p>
      <p>This is a reminder that your suit rental <strong>${rentalNumber}</strong> is due for return on <strong>${returnDate}</strong>.</p>
      <p>Please return the suit on time to avoid late fees.</p>
      <p>Thank you for choosing Laundrix!</p>
      <hr style="margin: 20px 0;">
      <p style="font-size: 12px; color: #666;">
        This is an automated message. Please do not reply to this email.
      </p>
    </div>
  `,

  paymentConfirmation: (paymentNumber, amount, customerName) => `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
      <h2 style="color: #52c41a;">Payment Confirmation</h2>
      <p>Dear ${customerName},</p>
      <p>We have received your payment of <strong>$${amount}</strong>.</p>
      <p><strong>Payment Reference:</strong> ${paymentNumber}</p>
      <p>Thank you for your payment!</p>
      <hr style="margin: 20px 0;">
      <p style="font-size: 12px; color: #666;">
        This is an automated message. Please do not reply to this email.
      </p>
    </div>
  `,
};

export default { sendEmail, emailTemplates };
