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

// ─── Shared layout wrapper ────────────────────────────────────────────────────
const layout = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Laundrix</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f5f7;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f5f7;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border:1px solid #e2e8f0;border-radius:6px;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background-color:#1e3a5f;padding:24px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:0.5px;">LAUNDRIX</span>
                  </td>
                  <td align="right">
                    <span style="font-size:12px;color:#94b4d4;letter-spacing:0.5px;text-transform:uppercase;">Professional Laundry Services</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 32px 28px;">
              ${content}
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 32px;">
              <hr style="border:none;border-top:1px solid #e2e8f0;margin:0;" />
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f8fafc;padding:20px 32px;">
              <p style="margin:0 0 4px;font-size:12px;color:#64748b;">This is an automated message from Laundrix. Please do not reply to this email.</p>
              <p style="margin:0;font-size:12px;color:#94a3b8;">If you have questions, contact our support team at support@laundrix.com</p>
            </td>
          </tr>

        </table>

        <!-- Below-card note -->
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;margin-top:16px;">
          <tr>
            <td style="text-align:center;font-size:11px;color:#94a3b8;padding:0 16px;">
              &copy; ${new Date().getFullYear()} Laundrix. All rights reserved.
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>
`;

// ─── Row helpers ──────────────────────────────────────────────────────────────
const infoRow = (label, value) => `
  <tr>
    <td style="padding:8px 12px;font-size:13px;color:#64748b;white-space:nowrap;vertical-align:top;width:150px;">${label}</td>
    <td style="padding:8px 12px;font-size:13px;color:#1e293b;font-weight:600;vertical-align:top;">${value}</td>
  </tr>
`;

const infoTable = (rows) => `
  <table cellpadding="0" cellspacing="0" style="width:100%;border:1px solid #e2e8f0;border-radius:4px;overflow:hidden;background:#f8fafc;">
    <tbody>
      ${rows}
    </tbody>
  </table>
`;

const heading = (text) =>
  `<h2 style="margin:0 0 6px;font-size:20px;font-weight:700;color:#1e3a5f;">${text}</h2>`;

const subheading = (text) =>
  `<p style="margin:0 0 24px;font-size:13px;color:#64748b;">${text}</p>`;

const bodyText = (text) =>
  `<p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.6;">${text}</p>`;

// ─── Email templates ──────────────────────────────────────────────────────────
export const emailTemplates = {

  welcome: (customerName) => layout(`
    ${heading('Welcome to Laundrix')}
    ${subheading('Your account has been created successfully.')}
    ${bodyText(`Dear ${customerName},`)}
    ${bodyText('Thank you for creating an account with Laundrix. We are glad to have you with us.')}
    ${bodyText('You can now place laundry orders, track your pickups and deliveries, browse suit rentals, and manage your account — all from one place.')}
    <table cellpadding="0" cellspacing="0" style="width:100%;margin:24px 0;">
      <tr>
        <td style="background-color:#1e3a5f;border-radius:4px;text-align:center;padding:12px 24px;">
          <a href="#" style="color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;letter-spacing:0.3px;">Get Started</a>
        </td>
      </tr>
    </table>
    ${bodyText('If you did not create this account, please contact us immediately at support@laundrix.com.')}
  `),

  orderConfirmation: (orderNumber, customerName, deliveryDate) => layout(`
    ${heading('Order Confirmed')}
    ${subheading('Your laundry order has been received.')}
    ${bodyText(`Dear ${customerName},`)}
    ${bodyText('We have received your order and it is now being processed. Below are your order details.')}
    ${infoTable(
      infoRow('Order Number', orderNumber) +
      infoRow('Status', 'Order Received') +
      infoRow('Estimated Delivery', deliveryDate)
    )}
    ${bodyText('We will notify you as your order progresses through each stage.')}
  `),

  orderStatusUpdate: (orderNumber, customerName, status, message) => layout(`
    ${heading('Order Update')}
    ${subheading(`Your order status has changed.`)}
    ${bodyText(`Dear ${customerName},`)}
    ${bodyText(`There is an update on your laundry order.`)}
    ${infoTable(
      infoRow('Order Number', orderNumber) +
      infoRow('New Status', status) +
      infoRow('Details', message)
    )}
    ${bodyText('Thank you for choosing Laundrix.')}
  `),

  orderReady: (orderNumber, customerName) => layout(`
    ${heading('Your Order Is Ready')}
    ${subheading('Your laundry is cleaned and ready for delivery.')}
    ${bodyText(`Dear ${customerName},`)}
    ${bodyText('Good news — your laundry order has been completed and is ready for delivery or pickup.')}
    ${infoTable(
      infoRow('Order Number', orderNumber) +
      infoRow('Status', 'Ready for Delivery')
    )}
    ${bodyText('Our team will be in touch shortly to arrange delivery. Thank you for choosing Laundrix.')}
  `),

  rentalConfirmation: (rentalNumber, customerName, suitName, startDate, endDate) => layout(`
    ${heading('Suit Rental Confirmed')}
    ${subheading('Your rental booking is confirmed.')}
    ${bodyText(`Dear ${customerName},`)}
    ${bodyText('Your suit rental has been confirmed. Please find the details of your booking below.')}
    ${infoTable(
      infoRow('Rental Number', rentalNumber) +
      infoRow('Suit', suitName) +
      infoRow('Rental Start', startDate) +
      infoRow('Rental End', endDate)
    )}
    ${bodyText('Please collect your suit on or after the rental start date. Ensure timely return to avoid late fees. Thank you for choosing Laundrix.')}
  `),

  rentalReminder: (rentalNumber, customerName, returnDate) => layout(`
    ${heading('Rental Return Reminder')}
    ${subheading('Action required — your rental is due soon.')}
    ${bodyText(`Dear ${customerName},`)}
    ${bodyText('This is a reminder that your suit rental is due for return. Please arrange to return the suit on time to avoid late fees.')}
    ${infoTable(
      infoRow('Rental Number', rentalNumber) +
      infoRow('Return Due Date', returnDate)
    )}
    ${bodyText('If you require an extension, please contact us as soon as possible at support@laundrix.com.')}
  `),

  paymentConfirmation: (paymentNumber, amount, customerName) => layout(`
    ${heading('Payment Received')}
    ${subheading('Your payment has been processed successfully.')}
    ${bodyText(`Dear ${customerName},`)}
    ${bodyText('We have received your payment. Please keep this confirmation for your records.')}
    ${infoTable(
      infoRow('Payment Reference', paymentNumber) +
      infoRow('Amount Paid', `LKR ${amount}`) +
      infoRow('Status', 'Confirmed')
    )}
    ${bodyText('Thank you for your payment. If you have any concerns, please reach out to support@laundrix.com.')}
  `),
};

export default { sendEmail, emailTemplates };
