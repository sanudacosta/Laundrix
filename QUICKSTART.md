# Laundrix - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Setup Database (2 minutes)

```bash
# Open MySQL Command Line or MySQL Workbench
mysql -u root -p

# Copy and paste the contents of database/schema.sql
# Then copy and paste the contents of database/seed.sql
```

### Step 2: Setup Backend (1 minute)

```bash
cd backend
npm install
copy .env.example .env

# Edit .env file - Update these values:
# DB_PASSWORD=your_mysql_password
# JWT_SECRET=any_random_string_here

npm run dev
```

✅ Backend should now be running on http://localhost:5000

### Step 3: Setup Frontend (1 minute)

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

✅ Frontend should now be running on http://localhost:5173

### Step 4: Login & Explore (1 minute)

Open http://localhost:5173 in your browser

**Login with these demo accounts:**

**Admin Dashboard:**
- Email: `admin@laundrix.com`
- Password: `Password123!`

**Employee Dashboard:**
- Email: `john.emp@laundrix.com`
- Password: `Password123!`

**Customer Dashboard:**
- Email: `mike@example.com`
- Password: `Password123!`

## 📚 What to Explore

### As Admin:
1. View dashboard statistics
2. Manage users (add/edit/delete)
3. View all orders and rentals
4. Check revenue reports
5. Manage suit inventory

### As Employee:
1. View assigned orders
2. Update order status
3. Process suit returns

### As Customer:
1. Place a new laundry order
2. Browse and rent suits
3. Track your orders
4. View payment history

## 🛠️ Common Issues

**Database connection error?**
- Check MySQL is running
- Verify DB_PASSWORD in backend/.env

**Port already in use?**
- Backend: Change PORT in backend/.env
- Frontend: It will ask for another port automatically

**Module not found?**
- Run `npm install` again in both backend and frontend

## 📞 Need Help?

Check the full README.md for detailed documentation!

---

**You're all set! Enjoy Laundrix! 🎉**
