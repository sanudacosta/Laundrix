-- Laundrix Database Seed Data (Sri Lankan Context)
USE laundrix_db;

-- Clear existing data (in correct order to avoid foreign key constraints)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE order_status_history;
TRUNCATE TABLE rental_status_history;
TRUNCATE TABLE notifications;
TRUNCATE TABLE payments;
TRUNCATE TABLE suit_rentals;
TRUNCATE TABLE laundry_orders;
TRUNCATE TABLE suits;
TRUNCATE TABLE suit_categories;
TRUNCATE TABLE service_times;
TRUNCATE TABLE cleaning_types;
TRUNCATE TABLE users;
TRUNCATE TABLE system_settings;
SET FOREIGN_KEY_CHECKS = 1;

-- Seed Users (password for all: Password123!)
-- Password hash for 'Password123!': $2a$10$rVYQnX5N3qQJwCxZvY8x5.ZXZyX5X5X5X5X5X5X5X5X5X5X5X5X5
INSERT INTO users (full_name, email, password, phone, role, address, is_active, email_verified) VALUES
('Admin User', 'admin@laundrix.lk', '$2a$10$rVYQnX5N3qQJwCxZvY8x5.ZXZyX5X5X5X5X5X5X5X5X5X5X5X5X5', '+94771234567', 'admin', '123 Galle Road, Colombo 03', TRUE, TRUE),
('Kamal Employee', 'kamal@laundrix.lk', '$2a$10$rVYQnX5N3qQJwCxZvY8x5.ZXZyX5X5X5X5X5X5X5X5X5X5X5X5X5', '+94771234568', 'employee', '456 Duplication Road, Colombo 04', TRUE, TRUE),
('Nisha Employee', 'nisha@laundrix.lk', '$2a$10$rVYQnX5N3qQJwCxZvY8x5.ZXZyX5X5X5X5X5X5X5X5X5X5X5X5X5', '+94771234569', 'employee', '789 Baseline Road, Colombo 09', TRUE, TRUE),
('Roshan Silva', 'roshan@example.com', '$2a$10$rVYQnX5N3qQJwCxZvY8x5.ZXZyX5X5X5X5X5X5X5X5X5X5X5X5X5', '+94771234570', 'customer', '321 Ward Place, Colombo 07', TRUE, TRUE),
('Thanuja Fernando', 'thanuja@example.com', '$2a$10$rVYQnX5N3qQJwCxZvY8x5.ZXZyX5X5X5X5X5X5X5X5X5X5X5X5X5', '+94771234571', 'customer', '654 Havelock Road, Colombo 05', TRUE, TRUE),
('Sandun Perera', 'sandun@example.com', '$2a$10$rVYQnX5N3qQJwCxZvY8x5.ZXZyX5X5X5X5X5X5X5X5X5X5X5X5X5', '+94771234572', 'customer', '987 Bauddhaloka Mawatha, Colombo 04', TRUE, TRUE);

-- Seed Cleaning Types (LKR pricing)
INSERT INTO cleaning_types (name, description, base_price, is_active) VALUES
('Dry Cleaning', 'Professional dry cleaning for delicate fabrics and formal wear', 800.00, TRUE),
('Wash & Iron', 'Regular wash with professional ironing - shirts, pants, casual wear', 150.00, TRUE),
('Wash & Fold', 'Standard washing and folding service for everyday clothes', 100.00, TRUE),
('Ironing Only', 'Professional ironing service without washing', 80.00, TRUE),
('Steam Cleaning', 'Deep steam cleaning for carpets, curtains, and heavy fabrics', 1200.00, TRUE),
('Stain Removal', 'Specialized stain removal treatment with care', 600.00, TRUE);

-- Seed Service Times (with multipliers)
INSERT INTO service_times (name, description, duration_hours, price_multiplier, is_active) VALUES
('Express (6 hours)', 'Super-fast 6-hour service for urgent needs', 6, 2.00, TRUE),
('Same Day (12 hours)', 'Same day service - drop off in morning, collect evening', 12, 1.50, TRUE),
('Standard (48 hours)', 'Regular 2-day service with best value', 48, 1.00, TRUE),
('Economy (96 hours)', '4-day economy service with discounted rates', 96, 0.80, TRUE);

-- Seed Suit Categories
INSERT INTO suit_categories (name, description, is_active) VALUES
('Business', 'Professional business suits for corporate settings', TRUE),
('Wedding', 'Elegant suits for weddings and formal ceremonies', TRUE),
('Formal', 'Classic formal wear including tuxedos', TRUE),
('Casual', 'Smart casual blazers and modern fits', TRUE),
('Premium', 'Designer and luxury brand suits', TRUE);

-- Seed 15 Suits with Sri Lankan pricing (LKR)
INSERT INTO suits (suit_code, category_id, name, description, size, color, brand, condition_status, rental_price_per_day, deposit_amount, purchase_price, image_url, is_available) VALUES
('HB-NV-001', 1, 'Hugo Boss Navy Suit', 'Elegant navy blue suit perfect for business meetings and formal events', '40R', 'Navy Blue', 'Hugo Boss', 'excellent', 8000.00, 10000.00, 75000.00, 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=500', TRUE),
('AR-TX-002', 2, 'Armani Tuxedo', 'Premium tuxedo with satin lapels, perfect for weddings and black-tie events', '42R', 'Black', 'Giorgio Armani', 'excellent', 12000.00, 10000.00, 120000.00, 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500', TRUE),
('ZR-GY-003', 4, 'Zara Gray Suit', 'Contemporary slim fit design for modern occasions and smart casual events', '38R', 'Gray', 'Zara', 'excellent', 5000.00, 10000.00, 45000.00, 'https://images.unsplash.com/photo-1593030103066-0093718efeb9?w=500', TRUE),
('TB-BG-004', 2, 'Ted Baker Burgundy Suit', 'Luxurious velvet blazer in deep burgundy for special occasions', '40R', 'Burgundy', 'Ted Baker', 'excellent', 10000.00, 10000.00, 85000.00, 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=500', TRUE),
('RL-BK-005', 3, 'Ralph Lauren Black Suit', 'Timeless black tuxedo for prom and formal events', '42L', 'Black', 'Ralph Lauren', 'excellent', 11000.00, 10000.00, 95000.00, 'https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=500', TRUE),
('MD-BG-006', 4, 'Massimo Dutti Beige Suit', 'Light summer suit perfect for daytime events and outdoor occasions', '38R', 'Beige', 'Massimo Dutti', 'good', 6000.00, 10000.00, 55000.00, 'https://images.unsplash.com/photo-1594938291221-94f18cbb5660?w=500', TRUE),
('HK-CH-007', 2, 'Hackett Charcoal Three-Piece', 'Distinguished three-piece suit in charcoal for weddings', '40R', 'Charcoal', 'Hackett', 'excellent', 9000.00, 10000.00, 78000.00, 'https://images.unsplash.com/photo-1593252719532-6d69bb25be5d?w=500', TRUE),
('CN-BL-008', 3, 'Canali Royal Blue Jacket', 'Bold royal blue dinner jacket for standout style at formal events', '42R', 'Royal Blue', 'Canali', 'excellent', 10500.00, 10000.00, 88000.00, 'https://images.unsplash.com/photo-1598808503491-c8e77b4e8fc9?w=500', TRUE),
('BB-CR-009', 4, 'Brooks Brothers Cream Suit', 'Breathable linen suit for outdoor events and summer weddings', '40L', 'Cream', 'Brooks Brothers', 'good', 7000.00, 10000.00, 62000.00, 'https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=500', TRUE),
('GH-NV-010', 5, 'Gieves & Hawkes Navy Three-Piece', 'Classic double-breasted style for power dressing and business', '42R', 'Navy', 'Gieves & Hawkes', 'excellent', 11500.00, 10000.00, 98000.00, 'https://images.unsplash.com/photo-1616091216791-a5360b5fc78a?w=500', TRUE),
('BR-CK-011', 1, 'Burberry Check Suit', 'Sophisticated checkered pattern for style-conscious professionals', '38R', 'Brown Check', 'Burberry', 'excellent', 9500.00, 10000.00, 82000.00, 'https://images.unsplash.com/photo-1593030103066-0093718efeb9?w=500', TRUE),
('DG-GR-012', 5, 'Dolce & Gabbana Emerald Velvet', 'Luxurious emerald velvet for unforgettable entrances at parties', '40R', 'Emerald Green', 'Dolce & Gabbana', 'excellent', 13000.00, 10000.00, 115000.00, 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=500', TRUE),
('PS-NV-013', 1, 'Paul Smith Pinstripe Suit', 'Classic pinstripe design for corporate settings and business meetings', '42R', 'Navy Pinstripe', 'Paul Smith', 'excellent', 8500.00, 10000.00, 72000.00, 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=500', TRUE),
('TF-WH-014', 2, 'Tom Ford White Jacket', 'Stunning white dinner jacket for summer weddings and beach ceremonies', '40R', 'White', 'Tom Ford', 'excellent', 14000.00, 10000.00, 125000.00, 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500', TRUE),
('JC-GY-015', 4, 'J.Crew Ludlow Suit', 'Affordable and stylish suit perfect for graduation ceremonies', '38L', 'Gray', 'J.Crew', 'good', 5500.00, 10000.00, 48000.00, 'https://images.unsplash.com/photo-1593030103066-0093718efeb9?w=500', TRUE);

-- Seed Sample Orders (with Colombo addresses)
INSERT INTO laundry_orders (order_number, customer_id, cleaning_type_id, service_time_id, assigned_employee_id, item_description, quantity, weight_kg, special_instructions, order_type, status, subtotal, tax, total_amount, payment_status, pickup_date, delivery_date) VALUES
('LO-2026-0001', 4, 2, 3, 2, '3 Shirts, 2 Pants, 1 Jacket', 6, 3.5, 'Please use hypoallergenic detergent', 'online', 'in-progress', 900.00, 72.00, 972.00, 'paid', '2026-01-20', '2026-01-22'),
('LO-2026-0002', 5, 3, 2, 2, '10 Casual Shirts, 5 Pants', 15, 5.0, 'No starch please', 'walk-in', 'ready', 2250.00, 180.00, 2430.00, 'paid', '2026-01-21', '2026-01-22'),
('LO-2026-0003', 6, 1, 4, NULL, '2 Suits for dry cleaning', 2, 2.0, 'Handle with care', 'online', 'pending', 1280.00, 102.40, 1382.40, 'pending', '2026-01-23', '2026-01-27');

-- Seed Sample Rentals
INSERT INTO suit_rentals (rental_number, customer_id, suit_id, assigned_employee_id, rental_start_date, rental_end_date, rental_days, rental_amount, deposit_amount, total_amount, payment_status, rental_status, notes) VALUES
('SR-2026-0001', 4, 2, 2, '2026-01-28', '2026-01-30', 2, 24000.00, 10000.00, 34000.00, 'paid', 'reserved', 'Wedding ceremony'),
('SR-2026-0002', 5, 1, 2, '2026-01-18', '2026-01-19', 1, 8000.00, 10000.00, 18000.00, 'fully-refunded', 'returned', 'Business conference');

-- Seed Payments
INSERT INTO payments (payment_number, user_id, order_id, rental_id, payment_type, payment_method, amount, payment_status, payment_date) VALUES
('PAY-2026-0001', 4, 1, NULL, 'laundry', 'online', 972.00, 'completed', '2026-01-20 10:30:00'),
('PAY-2026-0002', 5, 2, NULL, 'laundry', 'cash', 2430.00, 'completed', '2026-01-21 14:20:00'),
('PAY-2026-0003', 4, NULL, 1, 'rental', 'online', 34000.00, 'completed', '2026-01-23 09:15:00'),
('PAY-2026-0004', 5, NULL, 2, 'rental', 'online', 18000.00, 'completed', '2026-01-18 11:00:00'),
('PAY-2026-0005', 5, NULL, 2, 'deposit', 'online', 10000.00, 'refunded', '2026-01-19 16:30:00');

-- Seed System Settings (LKR currency)
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('tax_rate', '0.08', 'Tax rate percentage (8%)'),
('late_fee_per_day', '1000', 'Late fee charged per day for overdue suit rentals (LKR)'),
('currency', 'LKR', 'System currency - Sri Lankan Rupees'),
('business_name', 'Laundrix', 'Business name'),
('business_email', 'info@laundrix.lk', 'Business contact email'),
('business_phone', '+94112345678', 'Business contact phone'),
('min_rental_days', '1', 'Minimum rental days allowed'),
('max_rental_days', '30', 'Maximum rental days allowed'),
('notification_email_enabled', 'true', 'Enable email notifications'),
('notification_sms_enabled', 'true', 'Enable SMS notifications');
