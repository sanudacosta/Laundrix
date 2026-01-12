# Laundrix - Laundry Management & Suit Rental System

A comprehensive full-stack web application for managing laundry services and suit rentals with role-based dashboards, real-time tracking, payment processing, and business analytics.

## 🚀 Features

### Customer Features
- 🧺 **Place Laundry Orders** - Select cleaning type (Dry Clean, Wash & Iron, etc.) and service time (Express, Same Day, Standard)
- 🤵 **Browse & Reserve Suits** - Filter by category, size, price
- 📍 **Real-time Order Tracking** - Track laundry and rental status
- 💳 **Multiple Payment Options** - Online, card, cash, bank transfer
- 🔔 **Notifications** - Email and SMS alerts for order updates
- 🤖 **AI Chatbot Support** - Get instant help (placeholder for integration)

### Employee Features
- 📋 **View Assigned Orders** - See all orders assigned to you
- ✅ **Update Order Status** - Mark orders as in-progress, ready, completed
- 👔 **Manage Suit Returns** - Process returns and assess condition
- 📊 **Task Dashboard** - View workload and pending tasks

### Admin Features
- 👥 **User Management** - Manage customers, employees, admins
- 📦 **Order Management** - View, assign, and track all orders
- 🎩 **Inventory Management** - Add/edit/delete suits, track availability
- 💰 **Payment Management** - Process payments and refunds
- 📊 **Reports & Analytics**
  - Revenue reports with date filters
  - Fast-moving and slow-moving inventory
  - Customer insights and order statistics
- ⚙️ **System Settings** - Configure pricing, cleaning types, service times
- 📢 **Bulk Notifications** - Send announcements to users

## 🛠️ Tech Stack

### Frontend
- **React.js** with Vite - Fast modern build tool
- **React Router** - Client-side routing
- **Ant Design** - UI components for Admin & Employee dashboards
- **Tailwind CSS** - Utility-first styling for Landing & Customer pages
- **Axios** - HTTP client
- **Context API** - State management

### Backend
- **Node.js & Express** - REST API server
- **MySQL** - Relational database
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Nodemailer** - Email notifications
- **Express Validator** - Input validation

### Additional Services
- Mock SMS service (ready for Twilio integration)
- Mock payment gateway (ready for Stripe/PayPal)
- Email service with Nodemailer

## 📁 Project Structure

```
Laundrix/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── orderController.js
│   │   │   ├── rentalController.js
│   │   │   ├── paymentController.js
│   │   │   ├── adminController.js
│   │   │   ├── reportController.js
│   │   │   └── notificationController.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   ├── errorHandler.js
│   │   │   └── validators.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── orderRoutes.js
│   │   │   ├── rentalRoutes.js
│   │   │   ├── paymentRoutes.js
│   │   │   ├── adminRoutes.js
│   │   │   ├── reportRoutes.js
│   │   │   └── notificationRoutes.js
│   │   ├── services/
│   │   │   ├── emailService.js
│   │   │   ├── smsService.js
│   │   │   ├── paymentService.js
│   │   │   └── notificationService.js
│   │   └── server.js
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Landing/
│   │   │   ├── Auth/
│   │   │   ├── Customer/
│   │   │   ├── Admin/
│   │   │   └── Employee/
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── apiService.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── .env.example
└── database/
    ├── schema.sql
    └── seed.sql
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MySQL (v8 or higher)
- npm or yarn

### 1. Clone the Repository

```bash
cd d:\ZyLabz\Laundrix
```

### 2. Database Setup

```bash
# Login to MySQL
mysql -u root -p

# Create database and import schema
source database/schema.sql

# Import seed data
source database/seed.sql

# Exit MySQL
exit
```

### 3. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file from example
copy .env.example .env

# Edit .env with your configuration
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=your_password
# DB_NAME=laundrix_db
# JWT_SECRET=your_secret_key
# EMAIL_USER=your_email@gmail.com
# EMAIL_PASSWORD=your_app_password

# Start the backend server
npm run dev
```

Backend will run on `http://localhost:5000`

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file from example
copy .env.example .env

# Edit .env if needed
# VITE_API_URL=http://localhost:5000/api

# Start the development server
npm run dev
```

Frontend will run on `http://localhost:5173`

## 👤 Demo Credentials

### Admin Account
- **Email:** admin@laundrix.com
- **Password:** Password123!
- **Access:** Full system control

### Employee Account
- **Email:** john.emp@laundrix.com
- **Password:** Password123!
- **Access:** Order management, returns

### Customer Account
- **Email:** mike@example.com
- **Password:** Password123!
- **Access:** Place orders, rent suits

## 📖 API Documentation

### Authentication Endpoints
```
POST /api/auth/register     - Register new user
POST /api/auth/login        - Login user
GET  /api/auth/profile      - Get user profile
PUT  /api/auth/profile      - Update profile
PUT  /api/auth/change-password - Change password
```

### Order Endpoints
```
GET  /api/orders            - Get all orders (admin/employee)
GET  /api/orders/my-orders  - Get customer's orders
POST /api/orders            - Create new order
GET  /api/orders/:id        - Get order by ID
PUT  /api/orders/:id/status - Update order status
PUT  /api/orders/:id/assign - Assign order to employee
GET  /api/orders/assigned   - Get assigned orders (employee)
```

### Rental Endpoints
```
GET  /api/rental/suits      - Get all suits
GET  /api/rental/suits/:id  - Get suit by ID
POST /api/rental/rentals    - Create rental
GET  /api/rental/my-rentals - Get customer's rentals
GET  /api/rental/rentals    - Get all rentals (admin/employee)
PUT  /api/rental/rentals/:id/status - Update rental status
```

### Payment Endpoints
```
POST /api/payments          - Create payment
GET  /api/payments/my-payments - Get user's payments
GET  /api/payments          - Get all payments (admin)
POST /api/payments/:id/refund - Process refund
```

### Admin Endpoints
```
GET  /api/admin/users       - Get all users
POST /api/admin/users       - Create user
PUT  /api/admin/users/:id   - Update user
DELETE /api/admin/users/:id - Delete user
GET  /api/admin/cleaning-types - Get cleaning types
GET  /api/admin/service-times  - Get service times
POST /api/admin/suits       - Add suit to inventory
PUT  /api/admin/suits/:id   - Update suit
DELETE /api/admin/suits/:id - Delete suit
GET  /api/admin/settings    - Get system settings
PUT  /api/admin/settings    - Update settings
```

### Report Endpoints
```
GET /api/reports/dashboard  - Dashboard statistics
GET /api/reports/revenue    - Revenue report
GET /api/reports/inventory  - Inventory report
GET /api/reports/orders     - Order statistics
GET /api/reports/rentals    - Rental statistics
```

### Notification Endpoints
```
GET  /api/notifications     - Get user notifications
PUT  /api/notifications/:id/read - Mark as read
PUT  /api/notifications/mark-all-read - Mark all as read
DELETE /api/notifications/:id - Delete notification
POST /api/notifications/bulk - Send bulk notification (admin)
```

## 📊 Database Schema

### Core Tables
- **users** - User accounts (admin, employee, customer)
- **laundry_orders** - Laundry service orders
- **suit_rentals** - Suit rental bookings
- **suits** - Suit inventory
- **payments** - Payment transactions
- **notifications** - User notifications

### Configuration Tables
- **cleaning_types** - Available cleaning services
- **service_times** - Service duration options
- **suit_categories** - Suit classifications
- **system_settings** - System configuration

### History Tables
- **order_status_history** - Order status changes
- **rental_status_history** - Rental status changes

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based authorization
- Input validation and sanitization
- SQL injection protection with parameterized queries
- CORS configuration
- Secure password requirements

## 📧 Email Configuration

The system uses Nodemailer for email notifications. To enable:

1. Create a Gmail App Password:
   - Go to Google Account Settings
   - Security > 2-Step Verification
   - App Passwords > Generate

2. Update `.env`:
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

## 🚀 Deployment

### Backend Deployment
1. Set NODE_ENV=production
2. Update database credentials
3. Configure email/SMS services
4. Deploy to Heroku, AWS, or DigitalOcean

### Frontend Deployment
1. Build production bundle: `npm run build`
2. Update API_URL to production backend
3. Deploy to Vercel, Netlify, or AWS S3

## 🔮 Future Enhancements

- [ ] AI Chatbot integration (OpenAI/Dialogflow)
- [ ] Real-time notifications with Socket.IO
- [ ] Mobile app (React Native)
- [ ] SMS integration (Twilio)
- [ ] Payment gateway integration (Stripe/PayPal)
- [ ] Advanced analytics with charts
- [ ] QR code scanning for orders
- [ ] Customer loyalty program
- [ ] Multi-language support
- [ ] Dark mode

## 🐛 Troubleshooting

### Backend Issues
- **Database connection failed:** Check MySQL credentials in `.env`
- **Port already in use:** Change PORT in `.env` or kill existing process
- **JWT errors:** Verify JWT_SECRET is set

### Frontend Issues
- **API connection failed:** Ensure backend is running on port 5000
- **CORS errors:** Check backend CORS configuration
- **Build errors:** Delete node_modules and reinstall

## 📝 License

This project is for educational and demonstration purposes.

## 👨‍💻 Author

ZyLabz - Laundrix Development Team

## 🙏 Acknowledgments

- React.js & Vite community
- Ant Design team
- Tailwind CSS team
- Node.js & Express community
- MySQL documentation

---

For questions or support, please create an issue in the repository.

**Happy Coding! 🚀**
