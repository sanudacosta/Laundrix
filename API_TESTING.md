# Laundrix API Testing Guide

## Using Postman or Thunder Client

### 1. Authentication

**Register New Customer**
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "full_name": "Test User",
  "email": "test@example.com",
  "password": "Password123!",
  "phone": "+1234567890",
  "address": "123 Test Street"
}
```

**Login**
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "admin@laundrix.com",
  "password": "Password123!"
}
```

Copy the `token` from response and use it in subsequent requests.

### 2. Customer Operations

**Get My Orders**
```
GET http://localhost:5000/api/orders/my-orders
Authorization: Bearer YOUR_TOKEN_HERE
```

**Create Laundry Order**
```
POST http://localhost:5000/api/orders
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "cleaning_type_id": 1,
  "service_time_id": 3,
  "item_description": "2 Shirts, 1 Pants",
  "quantity": 3,
  "weight_kg": 2.5,
  "order_type": "online",
  "pickup_date": "2026-01-15"
}
```

**Browse Suits**
```
GET http://localhost:5000/api/rental/suits
```

**Create Suit Rental**
```
POST http://localhost:5000/api/rental/rentals
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "suit_id": 1,
  "rental_start_date": "2026-01-20",
  "rental_end_date": "2026-01-22",
  "notes": "Wedding event"
}
```

**Get My Rentals**
```
GET http://localhost:5000/api/rental/my-rentals
Authorization: Bearer YOUR_TOKEN_HERE
```

### 3. Payment Operations

**Create Payment**
```
POST http://localhost:5000/api/payments
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "order_id": 1,
  "payment_type": "laundry",
  "payment_method": "card",
  "amount": 64.80
}
```

**Get My Payments**
```
GET http://localhost:5000/api/payments/my-payments
Authorization: Bearer YOUR_TOKEN_HERE
```

### 4. Admin Operations (Use admin token)

**Get All Users**
```
GET http://localhost:5000/api/admin/users
Authorization: Bearer ADMIN_TOKEN_HERE
```

**Get All Orders**
```
GET http://localhost:5000/api/orders
Authorization: Bearer ADMIN_TOKEN_HERE
```

**Update Order Status**
```
PUT http://localhost:5000/api/orders/1/status
Authorization: Bearer ADMIN_TOKEN_HERE
Content-Type: application/json

{
  "status": "in-progress",
  "notes": "Started processing"
}
```

**Get Dashboard Stats**
```
GET http://localhost:5000/api/reports/dashboard
Authorization: Bearer ADMIN_TOKEN_HERE
```

**Get Revenue Report**
```
GET http://localhost:5000/api/reports/revenue?start_date=2026-01-01&end_date=2026-01-31
Authorization: Bearer ADMIN_TOKEN_HERE
```

**Get Inventory Report**
```
GET http://localhost:5000/api/reports/inventory
Authorization: Bearer ADMIN_TOKEN_HERE
```

### 5. Employee Operations (Use employee token)

**Get Assigned Orders**
```
GET http://localhost:5000/api/orders/assigned
Authorization: Bearer EMPLOYEE_TOKEN_HERE
```

**Update Rental Status**
```
PUT http://localhost:5000/api/rental/rentals/1/status
Authorization: Bearer EMPLOYEE_TOKEN_HERE
Content-Type: application/json

{
  "status": "returned",
  "return_condition": "excellent",
  "notes": "Returned in perfect condition"
}
```

### 6. Notifications

**Get My Notifications**
```
GET http://localhost:5000/api/notifications
Authorization: Bearer YOUR_TOKEN_HERE
```

**Mark Notification as Read**
```
PUT http://localhost:5000/api/notifications/1/read
Authorization: Bearer YOUR_TOKEN_HERE
```

**Mark All as Read**
```
PUT http://localhost:5000/api/notifications/mark-all-read
Authorization: Bearer YOUR_TOKEN_HERE
```

## Testing Workflow

### Complete Customer Journey

1. Register a new customer
2. Login and get token
3. Browse available suits
4. Create a suit rental
5. Place a laundry order
6. Create payment for order
7. Check notifications
8. View order status

### Complete Admin Journey

1. Login as admin
2. View dashboard statistics
3. Get all orders
4. Assign order to employee
5. View revenue report
6. Add new suit to inventory
7. Send bulk notification

### Complete Employee Journey

1. Login as employee
2. Get assigned orders
3. Update order status to "in-progress"
4. Update order status to "ready"
5. Process a suit return

## Response Examples

**Successful Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description"
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

---

Happy Testing! 🧪
