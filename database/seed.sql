-- Laundrix Database Seed Data
USE laundrix_db;

-- Seed Users (password for all: Password123!)
-- Password hash: $2a$10$XqK5K5S8ZvG.9V8xBxFxXuCvQJ6Q6Z8qGZF1E8qWqGY8xFxXuCvQJ
INSERT INTO users (full_name, email, password, phone, role, address, is_active, email_verified) VALUES
('Admin User', 'admin@laundrix.com', '$2a$10$XqK5K5S8ZvG.9V8xBxFxXuCvQJ6Q6Z8qGZF1E8qWqGY8xFxXuCvQJ', '+1234567890', 'admin', '123 Admin Street, City', TRUE, TRUE),
('John Employee', 'john.emp@laundrix.com', '$2a$10$XqK5K5S8ZvG.9V8xBxFxXuCvQJ6Q6Z8qGZF1E8qWqGY8xFxXuCvQJ', '+1234567891', 'employee', '456 Employee Ave, City', TRUE, TRUE),
('Sarah Employee', 'sarah.emp@laundrix.com', '$2a$10$XqK5K5S8ZvG.9V8xBxFxXuCvQJ6Q6Z8qGZF1E8qWqGY8xFxXuCvQJ', '+1234567892', 'employee', '789 Employee Blvd, City', TRUE, TRUE),
('Mike Customer', 'mike@example.com', '$2a$10$XqK5K5S8ZvG.9V8xBxFxXuCvQJ6Q6Z8qGZF1E8qWqGY8xFxXuCvQJ', '+1234567893', 'customer', '321 Customer Lane, City', TRUE, TRUE),
('Emily Customer', 'emily@example.com', '$2a$10$XqK5K5S8ZvG.9V8xBxFxXuCvQJ6Q6Z8qGZF1E8qWqGY8xFxXuCvQJ', '+1234567894', 'customer', '654 Customer Road, City', TRUE, TRUE),
('David Customer', 'david@example.com', '$2a$10$XqK5K5S8ZvG.9V8xBxFxXuCvQJ6Q6Z8qGZF1E8qWqGY8xFxXuCvQJ', '+1234567895', 'customer', '987 Customer Court, City', TRUE, TRUE);

-- Seed Cleaning Types
INSERT INTO cleaning_types (name, description, base_price, is_active) VALUES
('Dry Clean', 'Professional dry cleaning service for delicate fabrics', 15.00, TRUE),
('Wash & Iron', 'Regular wash with professional ironing', 10.00, TRUE),
('Wash Only', 'Standard washing service', 8.00, TRUE),
('Iron Only', 'Professional ironing service', 5.00, TRUE),
('Steam Clean', 'Deep steam cleaning for heavy fabrics', 20.00, TRUE),
('Stain Removal', 'Specialized stain removal treatment', 12.00, TRUE);

-- Seed Service Times
INSERT INTO service_times (name, description, duration_hours, price_multiplier, is_active) VALUES
('Express', '4-6 hours express service', 6, 2.00, TRUE),
('Same Day', 'Same day service (12 hours)', 12, 1.50, TRUE),
('Standard', '2-3 days standard service', 48, 1.00, TRUE),
('Economy', '4-5 days economy service', 96, 0.80, TRUE);

-- Seed Suit Categories
INSERT INTO suit_categories (name, description, is_active) VALUES
('Business Formal', 'Professional business suits', TRUE),
('Wedding Suits', 'Elegant wedding and formal event suits', TRUE),
('Tuxedos', 'Classic and modern tuxedos', TRUE),
('Casual Blazers', 'Smart casual blazers and sport coats', TRUE),
('Designer Suits', 'Premium designer brand suits', TRUE);

-- Seed Suits Inventory
INSERT INTO suits (suit_code, category_id, name, description, size, color, brand, condition_status, rental_price_per_day, deposit_amount, purchase_price, is_available) VALUES
('BS001', 1, 'Classic Navy Business Suit', 'Two-piece navy blue business suit', 'M', 'Navy Blue', 'Hugo Boss', 'excellent', 50.00, 200.00, 800.00, TRUE),
('BS002', 1, 'Charcoal Gray Business Suit', 'Professional charcoal gray suit', 'L', 'Charcoal Gray', 'Calvin Klein', 'excellent', 45.00, 180.00, 750.00, TRUE),
('BS003', 1, 'Black Business Suit', 'Classic black business suit', 'M', 'Black', 'Kenneth Cole', 'good', 40.00, 160.00, 650.00, TRUE),
('WS001', 2, 'Ivory Wedding Suit', 'Elegant ivory three-piece wedding suit', 'L', 'Ivory', 'Vera Wang', 'excellent', 120.00, 500.00, 2000.00, TRUE),
('WS002', 2, 'Light Gray Wedding Suit', 'Modern light gray wedding suit', 'M', 'Light Gray', 'Armani', 'excellent', 100.00, 450.00, 1800.00, TRUE),
('TX001', 3, 'Classic Black Tuxedo', 'Traditional black tuxedo with satin lapels', 'M', 'Black', 'Ralph Lauren', 'excellent', 80.00, 350.00, 1500.00, TRUE),
('TX002', 3, 'Modern Slim Fit Tuxedo', 'Contemporary slim fit tuxedo', 'S', 'Black', 'Ted Baker', 'good', 75.00, 320.00, 1400.00, TRUE),
('CB001', 4, 'Navy Blazer', 'Smart casual navy blazer', 'L', 'Navy', 'Zara', 'excellent', 30.00, 120.00, 400.00, TRUE),
('CB002', 4, 'Brown Tweed Blazer', 'Classic brown tweed sport coat', 'M', 'Brown', 'J.Crew', 'good', 35.00, 140.00, 450.00, TRUE),
('DS001', 5, 'Designer Italian Suit', 'Premium Italian wool suit', 'L', 'Charcoal', 'Ermenegildo Zegna', 'excellent', 150.00, 600.00, 3000.00, TRUE),
('DS002', 5, 'Designer Three-Piece Suit', 'Luxury three-piece suit', 'M', 'Navy', 'Tom Ford', 'excellent', 180.00, 700.00, 3500.00, TRUE);

-- Seed Laundry Orders
INSERT INTO laundry_orders (order_number, customer_id, cleaning_type_id, service_time_id, assigned_employee_id, item_description, quantity, weight_kg, special_instructions, order_type, status, subtotal, tax, total_amount, payment_status, pickup_date, delivery_date) VALUES
('LO-2026-0001', 4, 1, 3, 2, '2 Shirts, 1 Pants, 1 Jacket', 4, 2.5, 'Handle with care', 'online', 'in-progress', 60.00, 4.80, 64.80, 'paid', '2026-01-10', '2026-01-13'),
('LO-2026-0002', 5, 2, 2, 2, '5 Shirts, 3 Pants', 8, 3.0, 'No starch', 'walk-in', 'ready', 120.00, 9.60, 129.60, 'paid', '2026-01-11', '2026-01-12'),
('LO-2026-0003', 6, 3, 4, NULL, '10 Casual Shirts', 10, 4.5, NULL, 'online', 'pending', 64.00, 5.12, 69.12, 'pending', '2026-01-12', '2026-01-17'),
('LO-2026-0004', 4, 5, 1, 3, 'Large carpet', 1, 15.0, 'Heavy stains', 'walk-in', 'completed', 40.00, 3.20, 43.20, 'paid', '2026-01-09', '2026-01-10');

-- Seed Suit Rentals
INSERT INTO suit_rentals (rental_number, customer_id, suit_id, assigned_employee_id, rental_start_date, rental_end_date, rental_days, rental_amount, deposit_amount, late_fee, damage_fee, deposit_refunded, total_amount, payment_status, rental_status, return_condition, notes) VALUES
('SR-2026-0001', 4, 6, 2, '2026-01-15', '2026-01-17', 3, 240.00, 350.00, 0, 0, 0, 590.00, 'paid', 'reserved', NULL, 'Wedding event'),
('SR-2026-0002', 5, 1, 2, '2026-01-08', '2026-01-10', 2, 100.00, 200.00, 0, 0, 200.00, 100.00, 'fully-refunded', 'returned', 'excellent', 'Business meeting'),
('SR-2026-0003', 6, 10, 3, '2026-01-20', '2026-01-25', 5, 750.00, 600.00, 0, 0, 0, 1350.00, 'paid', 'reserved', NULL, 'Corporate event');

-- Seed Payments
INSERT INTO payments (payment_number, user_id, order_id, rental_id, payment_type, payment_method, amount, transaction_id, payment_status, payment_date) VALUES
('PAY-2026-0001', 4, 1, NULL, 'laundry', 'online', 64.80, 'TXN-1234567890', 'completed', '2026-01-10 10:30:00'),
('PAY-2026-0002', 5, 2, NULL, 'laundry', 'cash', 129.60, NULL, 'completed', '2026-01-11 14:20:00'),
('PAY-2026-0003', 4, 4, NULL, 'laundry', 'card', 43.20, 'TXN-1234567891', 'completed', '2026-01-09 16:45:00'),
('PAY-2026-0004', 4, NULL, 1, 'rental', 'online', 590.00, 'TXN-1234567892', 'completed', '2026-01-12 09:15:00'),
('PAY-2026-0005', 5, NULL, 2, 'rental', 'card', 100.00, 'TXN-1234567893', 'completed', '2026-01-08 11:00:00'),
('PAY-2026-0006', 5, NULL, 2, 'deposit', 'card', 200.00, 'TXN-1234567894', 'refunded', '2026-01-10 15:30:00'),
('PAY-2026-0007', 6, NULL, 3, 'rental', 'online', 1350.00, 'TXN-1234567895', 'completed', '2026-01-13 13:20:00');

-- Seed Notifications
INSERT INTO notifications (user_id, type, title, message, is_read, send_email, email_sent, send_sms, sms_sent, related_order_id, related_rental_id) VALUES
(4, 'order', 'Order In Progress', 'Your laundry order LO-2026-0001 is now being processed.', TRUE, TRUE, TRUE, FALSE, FALSE, 1, NULL),
(5, 'order', 'Order Ready', 'Your laundry order LO-2026-0002 is ready for pickup!', FALSE, TRUE, TRUE, TRUE, TRUE, 2, NULL),
(4, 'rental', 'Rental Confirmed', 'Your suit rental SR-2026-0001 has been confirmed.', TRUE, TRUE, TRUE, FALSE, FALSE, NULL, 1),
(6, 'reminder', 'Pickup Reminder', 'Reminder: Your order LO-2026-0003 pickup date is approaching.', FALSE, TRUE, FALSE, FALSE, FALSE, 3, NULL);

-- Seed Order Status History
INSERT INTO order_status_history (order_id, status, changed_by, notes) VALUES
(1, 'pending', 4, 'Order placed online'),
(1, 'in-progress', 2, 'Assigned to John Employee'),
(2, 'pending', 5, 'Walk-in order'),
(2, 'in-progress', 2, 'Started processing'),
(2, 'ready', 2, 'Completed and ready for pickup'),
(4, 'pending', 4, 'Walk-in order'),
(4, 'in-progress', 3, 'Started cleaning'),
(4, 'completed', 3, 'Delivered to customer');

-- Seed Rental Status History
INSERT INTO rental_status_history (rental_id, status, changed_by, notes) VALUES
(1, 'reserved', 4, 'Rental booked online'),
(2, 'reserved', 5, 'Rental booked'),
(2, 'active', 2, 'Suit picked up'),
(2, 'returned', 5, 'Suit returned in excellent condition'),
(3, 'reserved', 6, 'Rental booked online');

-- Seed System Settings
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('tax_rate', '0.08', 'Tax rate percentage (8%)'),
('late_fee_per_day', '20.00', 'Late fee charged per day for overdue rentals'),
('currency', 'USD', 'System currency'),
('business_name', 'Laundrix', 'Business name'),
('business_email', 'info@laundrix.com', 'Business contact email'),
('business_phone', '+1234567890', 'Business contact phone'),
('min_rental_days', '1', 'Minimum rental days allowed'),
('max_rental_days', '30', 'Maximum rental days allowed'),
('notification_email_enabled', 'true', 'Enable email notifications'),
('notification_sms_enabled', 'true', 'Enable SMS notifications');
