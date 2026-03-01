# Laundrix Database Setup Guide

## 📁 Files Overview

### **Use These Files (Latest Version):**
- ✅ **`schema_v2.sql`** - Complete database structure with all tables
- ✅ **`seed_v2.sql`** - Sample data for testing (users, orders, suits, payments)

### **Migration Files:**
- `add_address_columns.sql` - Adds pickup/delivery address columns (if needed)
- `fix_order_status_history.sql` - Fixes status history tables

### **Old Files (Legacy):**
- `schema.sql` - Old version (don't use)
- `seed.sql` - Old version (don't use)

---

## 🚀 Fresh Installation

### Step 1: Install Database Schema
```bash
mysql -u root -p < database/schema_v2.sql
```

This will:
- Drop existing `laundrix_db` (if exists)
- Create fresh database
- Create all 13 tables
- Insert default system settings

### Step 2: Load Sample Data
```bash
mysql -u root -p < database/seed_v2.sql
```

This will populate:
- 6 users (1 admin, 2 employees, 3 customers)
- 6 cleaning types (Dry Cleaning, Wash & Iron, etc.)
- 4 service times (Express, Same Day, Standard, Economy)
- 15 suit products (Hugo Boss, Armani, Zara, etc.)
- 90+ suit inventory items (multiple sizes per product)
- 3 sample laundry orders
- 2 sample suit rentals
- 5 sample payments

---

## 👥 Default User Credentials

All users have the same password: **`Password123!`**

| Role     | Email                | Password      | Purpose                    |
|----------|---------------------|---------------|----------------------------|
| Admin    | admin@laundrix.lk   | Password123!  | Full system access         |
| Employee | kamal@laundrix.lk   | Password123!  | POS, order management      |
| Employee | nisha@laundrix.lk   | Password123!  | POS, order management      |
| Customer | roshan@example.com  | Password123!  | Customer portal            |
| Customer | thanuja@example.com | Password123!  | Customer portal            |
| Customer | sandun@example.com  | Password123!  | Customer portal            |

---

## 📊 Database Structure

### **Main Tables:**
1. **users** - System users (admin, employee, customer)
2. **cleaning_types** - Laundry service types
3. **service_times** - Turnaround time options
4. **laundry_orders** - Customer laundry orders
5. **suit_categories** - Suit categories (Business, Wedding, Formal, etc.)
6. **suit_products** - Suit designs/styles
7. **suit_inventory** - Physical suit items (by size)
8. **suit_rentals** - Rental bookings
9. **rental_cart** - Temporary cart items
10. **payments** - Payment records
11. **notifications** - User notifications
12. **order_status_history** - Order status changes
13. **rental_status_history** - Rental status changes
14. **system_settings** - Configuration settings

---

## 🔧 Configuration

### System Settings (in database)
- **Tax Rate:** 8%
- **Currency:** LKR (Sri Lankan Rupees)
- **Late Fee:** 500 LKR per day
- **Min Rental Days:** 1
- **Max Rental Days:** 14

---

## 📝 Important Notes

### **Order Status Flow:**
```
pending → in-progress → ready → completed
```

### **Rental Status Flow:**
```
reserved → active → returned
```

### **Payment Status:**
- For orders/rentals: `pending → paid → refunded`
- For payments table: `pending → completed → failed/refunded`

### **POS Orders:**
- Status starts at: `in-progress` (payment collected)
- Payment status: `paid`
- Auto-assigned to employee who created it

---

## 🛠️ Troubleshooting

### Missing Column Error
If you get "Unknown column 'pickup_address'" error:
```bash
mysql -u root -p laundrix_db < database/add_address_columns.sql
```

### Status History Issues
If status history tables have wrong structure:
```bash
mysql -u root -p < database/fix_order_status_history.sql
```

### Fresh Start
To completely reset database:
```bash
mysql -u root -p < database/schema_v2.sql
mysql -u root -p < database/seed_v2.sql
```

---

## 📞 Support

For questions or issues, contact the development team.

**Version:** 2.0  
**Last Updated:** March 1, 2026
