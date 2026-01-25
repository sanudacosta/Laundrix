-- Laundrix Database Seed Data V2 (Sri Lankan Context with Size Inventory)
USE laundrix_db;

-- Clear existing data (in correct order to avoid foreign key constraints)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE rental_cart;
TRUNCATE TABLE order_status_history;
TRUNCATE TABLE rental_status_history;
TRUNCATE TABLE notifications;
TRUNCATE TABLE payments;
TRUNCATE TABLE suit_rentals;
TRUNCATE TABLE suit_inventory;
TRUNCATE TABLE suit_products;
TRUNCATE TABLE laundry_orders;
TRUNCATE TABLE suit_categories;
TRUNCATE TABLE service_times;
TRUNCATE TABLE cleaning_types;
TRUNCATE TABLE users;
TRUNCATE TABLE system_settings;
SET FOREIGN_KEY_CHECKS = 1;

-- Seed Users (password for all: Password123!)
-- Password hash for 'Password123!': $2a$10$aKIXOgI76/SWkFc.IPaFlO47/7UuU9qFCs6QPo7abSINxoRuvYjT2
INSERT INTO users (full_name, email, password, phone, role, address, is_active, email_verified) VALUES
('Admin User', 'admin@laundrix.lk', '$2a$10$aKIXOgI76/SWkFc.IPaFlO47/7UuU9qFCs6QPo7abSINxoRuvYjT2', '+94771234567', 'admin', '123 Galle Road, Colombo 03', TRUE, TRUE),
('Kamal Employee', 'kamal@laundrix.lk', '$2a$10$aKIXOgI76/SWkFc.IPaFlO47/7UuU9qFCs6QPo7abSINxoRuvYjT2', '+94771234568', 'employee', '456 Duplication Road, Colombo 04', TRUE, TRUE),
('Nisha Employee', 'nisha@laundrix.lk', '$2a$10$aKIXOgI76/SWkFc.IPaFlO47/7UuU9qFCs6QPo7abSINxoRuvYjT2', '+94771234569', 'employee', '789 Baseline Road, Colombo 09', TRUE, TRUE),
('Roshan Silva', 'roshan@example.com', '$2a$10$aKIXOgI76/SWkFc.IPaFlO47/7UuU9qFCs6QPo7abSINxoRuvYjT2', '+94771234570', 'customer', '321 Ward Place, Colombo 07', TRUE, TRUE),
('Thanuja Fernando', 'thanuja@example.com', '$2a$10$aKIXOgI76/SWkFc.IPaFlO47/7UuU9qFCs6QPo7abSINxoRuvYjT2', '+94771234571', 'customer', '654 Havelock Road, Colombo 05', TRUE, TRUE),
('Sandun Perera', 'sandun@example.com', '$2a$10$aKIXOgI76/SWkFc.IPaFlO47/7UuU9qFCs6QPo7abSINxoRuvYjT2', '+94771234572', 'customer', '987 Bauddhaloka Mawatha, Colombo 04', TRUE, TRUE);

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

-- Seed 15 Suit Products (Designs) with Sri Lankan pricing (LKR) - Adjusted for local market
INSERT INTO suit_products (product_code, category_id, name, brand, description, color, rental_price_per_day, deposit_amount, purchase_price, image_url, is_active) VALUES
('HB-NV', 1, 'Hugo Boss Navy Suit', 'Hugo Boss', 'Elegant navy blue suit perfect for business meetings and formal events. Premium wool blend with modern slim fit design.', 'Navy Blue', 2800.00, 3000.00, 75000.00, 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=500', TRUE),
('AR-TX', 2, 'Armani Tuxedo', 'Giorgio Armani', 'Premium tuxedo with satin lapels, perfect for weddings and black-tie events. Italian craftsmanship at its finest.', 'Black', 3000.00, 3000.00, 120000.00, 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500', TRUE),
('ZR-GY', 4, 'Zara Gray Suit', 'Zara', 'Contemporary slim fit design for modern occasions and smart casual events. Lightweight and comfortable.', 'Gray', 1500.00, 3000.00, 45000.00, 'https://images.unsplash.com/photo-1593030103066-0093718efeb9?w=500', TRUE),
('TB-BG', 2, 'Ted Baker Burgundy Suit', 'Ted Baker', 'Luxurious velvet blazer in deep burgundy for special occasions. Stand out with this bold choice.', 'Burgundy', 2700.00, 3000.00, 85000.00, 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=500', TRUE),
('RL-BK', 3, 'Ralph Lauren Black Suit', 'Ralph Lauren', 'Timeless black tuxedo for prom and formal events. Classic American elegance.', 'Black', 2900.00, 3000.00, 95000.00, 'https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=500', TRUE),
('MD-BG', 4, 'Massimo Dutti Beige Suit', 'Massimo Dutti', 'Light summer suit perfect for daytime events and outdoor occasions. Breathable fabric ideal for tropical climate.', 'Beige', 1800.00, 3000.00, 55000.00, 'https://images.unsplash.com/photo-1594938291221-94f18cbb5660?w=500', TRUE),
('HK-CH', 2, 'Hackett Charcoal Three-Piece', 'Hackett', 'Distinguished three-piece suit in charcoal for weddings. Includes vest for traditional formal look.', 'Charcoal', 2500.00, 3000.00, 78000.00, 'https://images.unsplash.com/photo-1593252719532-6d69bb25be5d?w=500', TRUE),
('CN-BL', 3, 'Canali Royal Blue Jacket', 'Canali', 'Bold royal blue dinner jacket for standout style at formal events. Italian luxury fabric.', 'Royal Blue', 2600.00, 3000.00, 88000.00, 'https://images.unsplash.com/photo-1598808503491-c8e77b4e8fc9?w=500', TRUE),
('BB-CR', 4, 'Brooks Brothers Cream Suit', 'Brooks Brothers', 'Breathable linen suit for outdoor events and summer weddings. Light and airy for comfort.', 'Cream', 2000.00, 3000.00, 62000.00, 'https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=500', TRUE),
('GH-NV', 5, 'Gieves & Hawkes Navy Three-Piece', 'Gieves & Hawkes', 'Classic double-breasted style for power dressing and business. British tailoring excellence.', 'Navy', 2900.00, 3000.00, 98000.00, 'https://images.unsplash.com/photo-1616091216791-a5360b5fc78a?w=500', TRUE),
('BR-CK', 1, 'Burberry Check Suit', 'Burberry', 'Sophisticated checkered pattern for style-conscious professionals. Iconic British design.', 'Brown Check', 2600.00, 3000.00, 82000.00, 'https://images.unsplash.com/photo-1593030103066-0093718efeb9?w=500', TRUE),
('DG-GR', 5, 'Dolce & Gabbana Emerald Velvet', 'Dolce & Gabbana', 'Luxurious emerald velvet for unforgettable entrances at parties. Bold Italian style.', 'Emerald Green', 3000.00, 3000.00, 115000.00, 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=500', TRUE),
('PS-NV', 1, 'Paul Smith Pinstripe Suit', 'Paul Smith', 'Classic pinstripe design for corporate settings and business meetings. Timeless professional look.', 'Navy Pinstripe', 2400.00, 3000.00, 72000.00, 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=500', TRUE),
('TF-WH', 2, 'Tom Ford White Jacket', 'Tom Ford', 'Stunning white dinner jacket for summer weddings and beach ceremonies. Ultimate luxury.', 'White', 3000.00, 3000.00, 125000.00, 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500', TRUE),
('JC-GY', 4, 'J.Crew Ludlow Suit', 'J.Crew', 'Affordable and stylish suit perfect for graduation ceremonies. Modern fit for younger generation.', 'Gray', 1600.00, 3000.00, 48000.00, 'https://images.unsplash.com/photo-1593030103066-0093718efeb9?w=500', TRUE);

-- Seed Suit Inventory (Each product in 6 sizes: 36R, 38R, 40R, 42R, 44R, 46R)
-- Product 1: Hugo Boss Navy Suit
INSERT INTO suit_inventory (product_id, size, suit_code, condition_status, is_available) VALUES
(1, '36R', 'HB-NV-36R-001', 'excellent', TRUE),
(1, '38R', 'HB-NV-38R-001', 'excellent', TRUE),
(1, '40R', 'HB-NV-40R-001', 'excellent', TRUE),
(1, '42R', 'HB-NV-42R-001', 'excellent', TRUE),
(1, '44R', 'HB-NV-44R-001', 'excellent', TRUE),
(1, '46R', 'HB-NV-46R-001', 'excellent', TRUE);

-- Product 2: Armani Tuxedo
INSERT INTO suit_inventory (product_id, size, suit_code, condition_status, is_available) VALUES
(2, '36R', 'AR-TX-36R-001', 'excellent', TRUE),
(2, '38R', 'AR-TX-38R-001', 'excellent', TRUE),
(2, '40R', 'AR-TX-40R-001', 'excellent', TRUE),
(2, '42R', 'AR-TX-42R-001', 'excellent', TRUE),
(2, '44R', 'AR-TX-44R-001', 'excellent', TRUE),
(2, '46R', 'AR-TX-46R-001', 'excellent', TRUE);

-- Product 3: Zara Gray Suit
INSERT INTO suit_inventory (product_id, size, suit_code, condition_status, is_available) VALUES
(3, '36R', 'ZR-GY-36R-001', 'excellent', TRUE),
(3, '38R', 'ZR-GY-38R-001', 'excellent', TRUE),
(3, '40R', 'ZR-GY-40R-001', 'excellent', TRUE),
(3, '42R', 'ZR-GY-42R-001', 'excellent', TRUE),
(3, '44R', 'ZR-GY-44R-001', 'excellent', TRUE),
(3, '46R', 'ZR-GY-46R-001', 'excellent', TRUE);

-- Product 4: Ted Baker Burgundy Suit
INSERT INTO suit_inventory (product_id, size, suit_code, condition_status, is_available) VALUES
(4, '36R', 'TB-BG-36R-001', 'excellent', TRUE),
(4, '38R', 'TB-BG-38R-001', 'excellent', TRUE),
(4, '40R', 'TB-BG-40R-001', 'excellent', TRUE),
(4, '42R', 'TB-BG-42R-001', 'excellent', TRUE),
(4, '44R', 'TB-BG-44R-001', 'excellent', TRUE),
(4, '46R', 'TB-BG-46R-001', 'excellent', TRUE);

-- Product 5: Ralph Lauren Black Suit
INSERT INTO suit_inventory (product_id, size, suit_code, condition_status, is_available) VALUES
(5, '36R', 'RL-BK-36R-001', 'excellent', TRUE),
(5, '38R', 'RL-BK-38R-001', 'excellent', TRUE),
(5, '40R', 'RL-BK-40R-001', 'excellent', TRUE),
(5, '42R', 'RL-BK-42R-001', 'excellent', TRUE),
(5, '44R', 'RL-BK-44R-001', 'excellent', TRUE),
(5, '46R', 'RL-BK-46R-001', 'excellent', TRUE);

-- Product 6: Massimo Dutti Beige Suit
INSERT INTO suit_inventory (product_id, size, suit_code, condition_status, is_available) VALUES
(6, '36R', 'MD-BG-36R-001', 'good', TRUE),
(6, '38R', 'MD-BG-38R-001', 'good', TRUE),
(6, '40R', 'MD-BG-40R-001', 'good', TRUE),
(6, '42R', 'MD-BG-42R-001', 'good', TRUE),
(6, '44R', 'MD-BG-44R-001', 'good', TRUE),
(6, '46R', 'MD-BG-46R-001', 'good', TRUE);

-- Product 7: Hackett Charcoal Three-Piece
INSERT INTO suit_inventory (product_id, size, suit_code, condition_status, is_available) VALUES
(7, '36R', 'HK-CH-36R-001', 'excellent', TRUE),
(7, '38R', 'HK-CH-38R-001', 'excellent', TRUE),
(7, '40R', 'HK-CH-40R-001', 'excellent', TRUE),
(7, '42R', 'HK-CH-42R-001', 'excellent', TRUE),
(7, '44R', 'HK-CH-44R-001', 'excellent', TRUE),
(7, '46R', 'HK-CH-46R-001', 'excellent', TRUE);

-- Product 8: Canali Royal Blue Jacket
INSERT INTO suit_inventory (product_id, size, suit_code, condition_status, is_available) VALUES
(8, '36R', 'CN-BL-36R-001', 'excellent', TRUE),
(8, '38R', 'CN-BL-38R-001', 'excellent', TRUE),
(8, '40R', 'CN-BL-40R-001', 'excellent', TRUE),
(8, '42R', 'CN-BL-42R-001', 'excellent', TRUE),
(8, '44R', 'CN-BL-44R-001', 'excellent', TRUE),
(8, '46R', 'CN-BL-46R-001', 'excellent', TRUE);

-- Product 9: Brooks Brothers Cream Suit
INSERT INTO suit_inventory (product_id, size, suit_code, condition_status, is_available) VALUES
(9, '36R', 'BB-CR-36R-001', 'good', TRUE),
(9, '38R', 'BB-CR-38R-001', 'good', TRUE),
(9, '40R', 'BB-CR-40R-001', 'good', TRUE),
(9, '42R', 'BB-CR-42R-001', 'good', TRUE),
(9, '44R', 'BB-CR-44R-001', 'good', TRUE),
(9, '46R', 'BB-CR-46R-001', 'good', TRUE);

-- Product 10: Gieves & Hawkes Navy Three-Piece
INSERT INTO suit_inventory (product_id, size, suit_code, condition_status, is_available) VALUES
(10, '36R', 'GH-NV-36R-001', 'excellent', TRUE),
(10, '38R', 'GH-NV-38R-001', 'excellent', TRUE),
(10, '40R', 'GH-NV-40R-001', 'excellent', TRUE),
(10, '42R', 'GH-NV-42R-001', 'excellent', TRUE),
(10, '44R', 'GH-NV-44R-001', 'excellent', TRUE),
(10, '46R', 'GH-NV-46R-001', 'excellent', TRUE);

-- Product 11: Burberry Check Suit
INSERT INTO suit_inventory (product_id, size, suit_code, condition_status, is_available) VALUES
(11, '36R', 'BR-CK-36R-001', 'excellent', TRUE),
(11, '38R', 'BR-CK-38R-001', 'excellent', TRUE),
(11, '40R', 'BR-CK-40R-001', 'excellent', TRUE),
(11, '42R', 'BR-CK-42R-001', 'excellent', TRUE),
(11, '44R', 'BR-CK-44R-001', 'excellent', TRUE),
(11, '46R', 'BR-CK-46R-001', 'excellent', TRUE);

-- Product 12: Dolce & Gabbana Emerald Velvet
INSERT INTO suit_inventory (product_id, size, suit_code, condition_status, is_available) VALUES
(12, '36R', 'DG-GR-36R-001', 'excellent', TRUE),
(12, '38R', 'DG-GR-38R-001', 'excellent', TRUE),
(12, '40R', 'DG-GR-40R-001', 'excellent', TRUE),
(12, '42R', 'DG-GR-42R-001', 'excellent', TRUE),
(12, '44R', 'DG-GR-44R-001', 'excellent', TRUE),
(12, '46R', 'DG-GR-46R-001', 'excellent', TRUE);

-- Product 13: Paul Smith Pinstripe Suit
INSERT INTO suit_inventory (product_id, size, suit_code, condition_status, is_available) VALUES
(13, '36R', 'PS-NV-36R-001', 'excellent', TRUE),
(13, '38R', 'PS-NV-38R-001', 'excellent', TRUE),
(13, '40R', 'PS-NV-40R-001', 'excellent', TRUE),
(13, '42R', 'PS-NV-42R-001', 'excellent', TRUE),
(13, '44R', 'PS-NV-44R-001', 'excellent', TRUE),
(13, '46R', 'PS-NV-46R-001', 'excellent', TRUE);

-- Product 14: Tom Ford White Jacket
INSERT INTO suit_inventory (product_id, size, suit_code, condition_status, is_available) VALUES
(14, '36R', 'TF-WH-36R-001', 'excellent', TRUE),
(14, '38R', 'TF-WH-38R-001', 'excellent', TRUE),
(14, '40R', 'TF-WH-40R-001', 'excellent', TRUE),
(14, '42R', 'TF-WH-42R-001', 'excellent', TRUE),
(14, '44R', 'TF-WH-44R-001', 'excellent', TRUE),
(14, '46R', 'TF-WH-46R-001', 'excellent', TRUE);

-- Product 15: J.Crew Ludlow Suit
INSERT INTO suit_inventory (product_id, size, suit_code, condition_status, is_available) VALUES
(15, '36R', 'JC-GY-36R-001', 'good', TRUE),
(15, '38R', 'JC-GY-38R-001', 'good', TRUE),
(15, '40R', 'JC-GY-40R-001', 'good', TRUE),
(15, '42R', 'JC-GY-42R-001', 'good', TRUE),
(15, '44R', 'JC-GY-44R-001', 'good', TRUE),
(15, '46R', 'JC-GY-46R-001', 'good', TRUE);

-- Seed Sample Orders (with Colombo addresses)
INSERT INTO laundry_orders (order_number, customer_id, cleaning_type_id, service_time_id, assigned_employee_id, item_description, quantity, weight_kg, special_instructions, order_type, status, subtotal, tax, total_amount, payment_status, pickup_date, delivery_date) VALUES
('LO-2026-0001', 4, 2, 3, 2, '3 Shirts, 2 Pants, 1 Jacket', 6, 3.5, 'Please use hypoallergenic detergent', 'online', 'in-progress', 900.00, 72.00, 972.00, 'paid', '2026-01-20', '2026-01-22'),
('LO-2026-0002', 5, 3, 2, 2, '10 Casual Shirts, 5 Pants', 15, 5.0, 'No starch please', 'walk-in', 'ready', 2250.00, 180.00, 2430.00, 'paid', '2026-01-21', '2026-01-22'),
('LO-2026-0003', 6, 1, 4, NULL, '2 Suits for dry cleaning', 2, 2.0, 'Handle with care', 'online', 'pending', 1280.00, 102.40, 1382.40, 'pending', '2026-01-23', '2026-01-27');

-- Seed Sample Rentals (using inventory IDs)
INSERT INTO suit_rentals (rental_number, customer_id, inventory_id, assigned_employee_id, rental_start_date, rental_end_date, rental_days, rental_amount, deposit_amount, total_amount, payment_status, rental_status, occasion, delivery_address, notes) VALUES
('SR-2026-0001', 4, 10, 2, '2026-01-28', '2026-01-30', 2, 6000.00, 3000.00, 9000.00, 'paid', 'reserved', 'Wedding ceremony', '321 Ward Place, Colombo 07', 'Size 42R Armani Tuxedo'),
('SR-2026-0002', 5, 3, 2, '2026-01-18', '2026-01-19', 1, 2800.00, 3000.00, 5800.00, 'fully-refunded', 'returned', 'Business conference', '654 Havelock Road, Colombo 05', 'Size 40R Hugo Boss Navy returned in excellent condition');

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('business_name', 'Laundrix', 'Business name'),
('tax_rate', '8', 'Tax rate percentage'),
('currency', 'LKR', 'Currency code'),
('late_fee_per_day', '500', 'Late fee per day for overdue rentals');
