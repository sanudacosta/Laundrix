# Laundrix System Documentation

**Project:** Laundry Management & Suit Rental System  
**Version:** 1.0.0  
**Last Updated:** February 10, 2026

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Key Components & Architecture](#key-components--architecture)
3. [Frontend Libraries & Dependencies](#frontend-libraries--dependencies)
4. [Backend Libraries & Dependencies](#backend-libraries--dependencies)
5. [Third-Party Modules](#third-party-modules)
6. [Feature Extraction](#feature-extraction)
7. [System Flow](#system-flow)
8. [API Endpoints](#api-endpoints)

---

## System Overview

Laundrix is a comprehensive web-based platform for managing laundry services and suit rentals. The system is built with a modern tech stack using:
- **Frontend:** React 18 + Vite + Tailwind CSS
- **Backend:** Node.js + Express.js
- **Database:** MySQL 2
- **Real-time Communication:** Socket.io

---

## Key Components & Architecture

### Backend Architecture

#### 1. **Server Core** (`src/server.js`)
- Express.js application setup
- CORS configuration for cross-origin requests
- Middleware initialization
- Error handling setup
- Database connection validation

#### 2. **Database Layer** (`config/database.js`)
- MySQL 2 connection pool
- Database configuration management
- Connection testing utilities

#### 3. **Authentication Layer** (`middleware/auth.js`)
- JWT token verification
- Role-based access control (RBAC)
  - Admin
  - Employee
  - Customer
- Token validation middleware

#### 4. **Controllers** (Business Logic Layer)

| Controller | Responsibility |
|-----------|-----------------|
| **authController** | User registration, login, logout, token refresh |
| **orderController** | Laundry order CRUD operations, status tracking |
| **rentalController** | Suit rental booking, returns, inventory management |
| **paymentController** | Payment processing, refunds, transaction tracking |
| **adminController** | User management, system configuration, dashboard data |
| **notificationController** | User notifications delivery and management |
| **reportController** | Analytics, reports generation, business insights |

#### 5. **Routes** (API Endpoints)

- `/api/auth` - Authentication endpoints
- `/api/orders` - Laundry order management
- `/api/rental` - Suit rental operations
- `/api/payments` - Payment & transaction management
- `/api/admin` - Administrative operations
- `/api/notifications` - Notification management
- `/api/reports` - Report generation

#### 6. **Middleware**

| Middleware | Purpose |
|-----------|---------|
| **auth.js** | JWT verification and role validation |
| **errorHandler.js** | Global error handling and response formatting |
| **validators.js** | Input validation for all requests |

#### 7. **Services** (Business Logic Operations)

| Service | Functionality |
|---------|---------------|
| **emailService** | Email notifications (order updates, password resets) |
| **notificationService** | Push/in-app notification management |
| **paymentService** | Payment gateway integration and processing |
| **smsService** | SMS notifications for time-sensitive alerts |

### Frontend Architecture

#### 1. **Pages & Views**
- **Authentication Pages**
  - LoginPage
  - RegisterPage
- **Customer Pages**
  - BrowseSuits
  - Cart
  - MyAccount
  - MyOrders
  - MyPayments
  - MyRentals
  - PlaceOrder
- **Employee Pages**
  - EmployeeDashboard
  - AssignedOrders
  - ManageReturns
- **Admin Pages**
  - AdminDashboard
  - InventoryManagement
  - OrderManagement
  - PaymentManagement
  - RentalManagement
  - ReportsPage
  - SettingsPage
  - UserManagement
- **Landing Page**
  - LandingPage

#### 2. **Components**
- **Layout Components**
  - Navbar
  - AdminLayout
  - EmployeeLayout
- **UI Components**
  - Button
  - Input
  - Modal
- **Feature Components**
  - ChatBot
  - ProtectedRoute
- **Modal Components**
  - PrivacyModal
  - TermsModal

#### 3. **Context & State Management**
- **AuthContext** - Global authentication state management

#### 4. **Services**
- **api.js** / **apiService.js** - API communication layer
- **constants.js** - Application constants

---

## Frontend Libraries & Dependencies

### Production Dependencies

```json
{
  "@ant-design/icons": "^5.2.6",      // Icon library for Ant Design
  "antd": "^5.12.2",                  // Ant Design UI component library
  "axios": "^1.6.2",                  // HTTP client for API requests
  "date-fns": "^4.1.0",               // Date manipulation utilities
  "dayjs": "^1.11.10",                // Lightweight date/time library
  "lucide-react": "^0.562.0",         // Icon library
  "react": "^18.2.0",                 // React framework
  "react-countup": "^6.5.3",          // Number counter animation component
  "react-dom": "^18.2.0",             // React DOM rendering
  "react-router-dom": "^6.20.1",      // Client-side routing
  "react-toastify": "^11.0.5",        // Toast notifications
  "recharts": "^2.15.4",              // Charting library for analytics
  "socket.io-client": "^4.5.4"        // Real-time communication client
}
```

### Development Dependencies

```json
{
  "@types/react": "^18.2.43",
  "@types/react-dom": "^18.2.17",
  "@vitejs/plugin-react": "^4.2.1",
  "autoprefixer": "^10.4.16",         // PostCSS plugin for vendor prefixes
  "eslint": "^8.55.0",                // Code linting
  "eslint-plugin-react": "^7.33.2",
  "eslint-plugin-react-hooks": "^4.6.0",
  "eslint-plugin-react-refresh": "^0.4.5",
  "postcss": "^8.4.32",               // CSS processing
  "tailwindcss": "^3.3.6",            // Utility-first CSS framework
  "vite": "^5.0.8"                    // Next generation build tool
}
```

---

## Backend Libraries & Dependencies

### Production Dependencies

```json
{
  "express": "^4.18.2",               // Web framework
  "mysql2": "^3.6.5",                 // MySQL database driver
  "bcryptjs": "^2.4.3",               // Password hashing
  "jsonwebtoken": "^9.0.2",           // JWT authentication
  "dotenv": "^16.3.1",                // Environment variable management
  "cors": "^2.8.5",                   // Cross-Origin Resource Sharing
  "express-validator": "^7.0.1",      // Input validation middleware
  "nodemailer": "^6.9.7",             // Email service
  "multer": "^1.4.5-lts.1",           // File upload handling
  "uuid": "^9.0.1"                    // UUID generation
}
```

### Development Dependencies

```json
{
  "nodemon": "^3.0.2"                 // Development server auto-restart
}
```

---

## Third-Party Modules

### Authentication & Security

| Module | Purpose | Features |
|--------|---------|----------|
| **jsonwebtoken** | JWT-based authentication | Token generation, verification, expiration |
| **bcryptjs** | Password hashing | Secure password storage, salting |
| **cors** | CORS middleware | Cross-origin request handling |
| **express-validator** | Input validation | Data sanitization, validation rules |

### Database & ORM

| Module | Purpose | Features |
|--------|---------|----------|
| **mysql2** | MySQL database driver | Connection pooling, prepared statements |

### File Handling

| Module | Purpose | Features |
|--------|---------|----------|
| **multer** | File upload middleware | Multipart form data handling, file storage |

### Communication Services

| Module | Purpose | Features |
|--------|---------|----------|
| **nodemailer** | Email service | SMTP configuration, sending emails |
| **socket.io-client** | Real-time communication | WebSocket events, bi-directional communication |

### Utilities

| Module | Purpose | Features |
|--------|---------|----------|
| **uuid** | Unique ID generation | Version 4 UUID generation |
| **dotenv** | Environment management | Load .env files |
| **date-fns** | Date manipulation | Parsing, formatting, calculations |
| **dayjs** | Lightweight date library | Mini Moment.js replacement |

### UI Components

| Module | Purpose | Features |
|--------|---------|----------|
| **antd** | Ant Design system | Form controls, tables, modals, layouts |
| **@ant-design/icons** | Icon library | 1000+ icons |
| **recharts** | Charting library | Line, bar, pie charts for dashboards |
| **react-toastify** | Notifications | Toast messages for user feedback |
| **lucide-react** | Icon library | Alternative icon set |
| **react-countup** | Number animations | Animated counters for metrics |

### HTTP Client

| Module | Purpose | Features |
|--------|---------|----------|
| **axios** | HTTP client | Request/response interceptors, timeout handling |

### Build Tools

| Module | Purpose | Features |
|--------|---------|----------|
| **vite** | Build tool | Fast development server, optimized builds |
| **tailwindcss** | CSS framework | Utility-first styling |

---

## Feature Extraction

### Core Features by Module

#### **Authentication Module**
- User registration (Email, Phone, Address)
- Email/Password login
- Role-based signup (Admin, Employee, Customer)
- JWT token management
- Password reset functionality
- Email verification
- Session management

#### **Laundry Order Management**
- Create laundry orders
- Select cleaning type (dry cleaning, wet washing, etc.)
- Choose service time (express, standard, premium)
- Track order status (pending → in-progress → ready → completed)
- Assign orders to employees
- Update order status history
- Pickup and delivery scheduling
- Cost calculation (subtotal + tax)

#### **Suit Rental System**
- Browse suit inventory by category
- Filter suits by size and price
- Manage rental cart (add, update, remove items)
- Reserve suits with dates
- Calculate rental days and costs
- Deposit management
- Late fees calculation
- Damage fees tracking
- Rental status tracking (reserved → active → returned → overdue)
- Return condition assessment (excellent, good, fair, damaged)

#### **Inventory Management**
- Suit catalog management
  - Product creation (design, color, brand)
  - Category management
  - Size variants per product
  - Pricing tiers (rental, deposit, purchase)
- Physical inventory tracking
  - Suit condition status (excellent, good, fair, needs-repair)
  - Availability status
  - Rental history
  - Last rental date tracking
- Stock management
  - Automatic availability updates
  - Inventory alerts
  - Maintenance scheduling

#### **Payment Processing**
- Multiple payment methods (cash, card, bank transfer, online)
- Payment status tracking
- Refund processing
- Deposit management
- Late fee and damage fee calculation
- Transaction reference tracking
- Payment history

#### **Notification System**
- Order status notifications
- Rental reminders
- Payment confirmations
- Delivery notifications
- SMS alerts
- Email notifications
- In-app notifications
- Notification history

#### **Reporting & Analytics**
- Order statistics
- Revenue reports
- Rental performance metrics
- Customer analytics
- Employee performance tracking
- Inventory reports
- Payment reconciliation
- Custom report generation

#### **Admin Features**
- User management (create, edit, deactivate)
- System configuration
  - Business settings
  - Tax rates
  - Late fees
  - Currency settings
- Dashboard overview
- Report generation
- User activity tracking
- System health monitoring

#### **Employee Features**
- Order assignment viewing
- Order status updates
- Rental return processing
- Damage assessment
- Refund tracking
- Performance metrics

#### **Customer Features**
- Account management (profile, settings)
- Browse and search suits
- Shopping cart management
- Order history
- Rental history
- Payment history
- Rental notifications

---

## System Flow

### User Authentication Flow

```
User Input (Email/Password)
    ↓
Validation (express-validator)
    ↓
Password Verification (bcryptjs)
    ↓
JWT Token Generation
    ↓
Refresh Token Storage
    ↓
Return Token + User Data
    ↓
Store in React Context
    ↓
Redirect to Dashboard
```

### Laundry Order Flow

```
Customer Creates Order
    ↓
Select Cleaning Type & Service Time
    ↓
Calculate Price (base + multiplier + tax)
    ↓
Store in Database
    ↓
Send Confirmation Email
    ↓
Employee Receives Assignment
    ↓
Update Status (in-progress)
    ↓
Process Laundry
    ↓
Update Status (ready)
    ↓
Schedule Delivery
    ↓
Deliver to Customer
    ↓
Update Status (completed)
    ↓
Send Delivery Notification
```

### Suit Rental Flow

```
Customer Browses Suits
    ↓
Select Suit & Size
    ↓
Add to Rental Cart
    ↓
Select Rental Dates
    ↓
Calculate Rental Days & Cost
    ↓
Add Delivery Address
    ↓
Confirm Rental (Create Reservation)
    ↓
Process Payment
    ↓
Update Inventory (mark unavailable)
    ↓
Assign to Employee for Delivery
    ↓
Send Delivery Confirmation
    ↓
Customer Receives Suit
    ↓
Rental Period Active
    ↓
Rental Reminder Notifications
    ↓
Return Date Approaching
    ↓
Customer Initiates Return
    ↓
Return Inspection (condition assessment)
    ↓
Calculate Deposits & Fees
    ↓
Process Refund
    ↓
Update Inventory (mark available)
    ↓
Archive Rental Record
```

### Payment Flow

```
Order/Rental Created
    ↓
Calculate Total Amount
    ↓
Customer Selects Payment Method
    ↓
Process Payment
    ├─ Cash → Manual verification
    ├─ Card → Payment Gateway Integration
    ├─ Bank Transfer → Manual verification
    └─ Online → Payment Gateway
    ↓
Update Payment Status
    ↓
Send Payment Confirmation
    ↓
Create Payment Record
    ↓
Update Order/Rental Status
    ↓
Send Receipt
```

### Notification Flow

```
System Event Triggered
    ├─ Order Status Change
    ├─ Rental Created
    ├─ Payment Received
    └─ Return Due Soon
    ↓
Create Notification Record
    ↓
Determine Notification Channels
    ├─ Email (nodemailer)
    ├─ SMS (smsService)
    └─ In-App
    ↓
Dispatch to User
    ↓
Mark as Sent
    ↓
User Receives Notification
```

### Admin Dashboard Flow

```
Admin Logs In
    ↓
Verify Admin Role
    ↓
Load Dashboard Data
    ├─ Total Revenue
    ├─ Active Orders
    ├─ Active Rentals
    ├─ Pending Payments
    └─ User Statistics
    ↓
Display Charts & Metrics
    ↓
Generate Reports
    ↓
Manage Users
    ↓
Configure Settings
```

---

## API Endpoints

### Authentication Routes
```
POST   /api/auth/register       - User registration
POST   /api/auth/login          - User login
POST   /api/auth/logout         - User logout
POST   /api/auth/refresh-token  - Refresh JWT token
POST   /api/auth/forgot-password - Password reset request
POST   /api/auth/reset-password - Confirm password reset
```

### Order Routes
```
GET    /api/orders              - List all orders
GET    /api/orders/:id          - Get order details
POST   /api/orders              - Create new order
PUT    /api/orders/:id          - Update order
DELETE /api/orders/:id          - Cancel order
GET    /api/orders/:id/history  - Order status history
```

### Rental Routes
```
GET    /api/rental/products     - List suit products
GET    /api/rental/products/:id - Get product details
GET    /api/rental/inventory    - List available inventory
POST   /api/rental/cart/add     - Add to rental cart
GET    /api/rental/cart         - Get rental cart
PUT    /api/rental/cart/:id     - Update cart item
DELETE /api/rental/cart/:id     - Remove from cart
POST   /api/rental/book         - Book rental
GET    /api/rental/my-rentals   - Get customer rentals
PUT    /api/rental/:id/return   - Process rental return
```

### Payment Routes
```
POST   /api/payments            - Create payment
GET    /api/payments/:id        - Get payment details
GET    /api/payments            - List payments
PUT    /api/payments/:id        - Update payment
POST   /api/payments/:id/refund - Process refund
```

### Admin Routes
```
GET    /api/admin/users         - List all users
POST   /api/admin/users         - Create user
PUT    /api/admin/users/:id     - Update user
DELETE /api/admin/users/:id     - Deactivate user
GET    /api/admin/dashboard     - Dashboard data
GET    /api/admin/settings      - System settings
PUT    /api/admin/settings      - Update settings
```

### Notification Routes
```
GET    /api/notifications       - List notifications
POST   /api/notifications/:id/read - Mark as read
DELETE /api/notifications/:id   - Delete notification
```

### Report Routes
```
GET    /api/reports/orders      - Order reports
GET    /api/reports/rentals     - Rental reports
GET    /api/reports/payments    - Payment reports
GET    /api/reports/revenue     - Revenue analysis
GET    /api/reports/customers   - Customer analytics
GET    /api/reports/employees   - Employee performance
```

---

## Database Schema Summary

### Core Tables

| Table | Purpose |
|-------|---------|
| **users** | User accounts (admin, employee, customer) |
| **cleaning_types** | Laundry cleaning type catalog |
| **service_times** | Service speed options |
| **laundry_orders** | Customer laundry orders |
| **suit_categories** | Suit product categories |
| **suit_products** | Suit designs/styles |
| **suit_inventory** | Physical suit inventory by size |
| **suit_rentals** | Rental transactions |
| **rental_cart** | Temporary rental shopping cart |
| **payments** | Payment transactions |
| **notifications** | System notifications |
| **order_status_history** | Order status tracking |
| **rental_status_history** | Rental status tracking |
| **system_settings** | Configuration settings |

---

## Environment Configuration

### Backend (.env)
```
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=laundrix_db
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=http://localhost:5174
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

---

## Development & Deployment

### Development Commands
```bash
# Backend
npm run dev          # Start with nodemon auto-reload

# Frontend
npm run dev          # Vite dev server
```

### Production Commands
```bash
# Backend
npm start

# Frontend
npm run build        # Build optimized bundle
npm run preview      # Preview production build
```

---

## Security Considerations

1. **Authentication:** JWT-based with secure token and refresh token
2. **Password Security:** bcryptjs with salt rounds for hashing
3. **Input Validation:** express-validator for all inputs
4. **CORS Protection:** Whitelist origin domains
5. **Database:** Parameterized queries to prevent SQL injection
6. **Error Handling:** Generic error messages to users
7. **Rate Limiting:** Recommended for sensitive endpoints
8. **HTTPS:** Recommended for production

---

**End of Documentation**
