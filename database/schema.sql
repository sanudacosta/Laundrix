-- Laundrix Database Schema
-- Drop database if exists and create fresh
DROP DATABASE IF EXISTS laundrix_db;
CREATE DATABASE laundrix_db;
USE laundrix_db;

-- Users Table (Admin, Employee, Customer)
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    role ENUM('admin', 'employee', 'customer') NOT NULL DEFAULT 'customer',
    address TEXT,
    profile_image VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_active (is_active)
);

-- Cleaning Types Table
CREATE TABLE cleaning_types (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    base_price DECIMAL(10, 2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Service Times Table
CREATE TABLE service_times (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    duration_hours INT NOT NULL,
    price_multiplier DECIMAL(3, 2) NOT NULL DEFAULT 1.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Laundry Orders Table
CREATE TABLE laundry_orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id INT NOT NULL,
    cleaning_type_id INT NOT NULL,
    service_time_id INT NOT NULL,
    assigned_employee_id INT,
    item_description TEXT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    weight_kg DECIMAL(5, 2),
    special_instructions TEXT,
    order_type ENUM('walk-in', 'online') NOT NULL DEFAULT 'online',
    status ENUM('pending', 'in-progress', 'ready', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
    subtotal DECIMAL(10, 2) NOT NULL,
    tax DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_status ENUM('pending', 'paid', 'refunded') NOT NULL DEFAULT 'pending',
    pickup_date DATE,
    delivery_date DATE,
    actual_delivery_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (cleaning_type_id) REFERENCES cleaning_types(id),
    FOREIGN KEY (service_time_id) REFERENCES service_times(id),
    FOREIGN KEY (assigned_employee_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_order_number (order_number),
    INDEX idx_customer (customer_id),
    INDEX idx_status (status),
    INDEX idx_payment_status (payment_status),
    INDEX idx_dates (pickup_date, delivery_date)
);

-- Suit Categories Table
CREATE TABLE suit_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Suit Inventory Table
CREATE TABLE suits (
    id INT PRIMARY KEY AUTO_INCREMENT,
    suit_code VARCHAR(50) UNIQUE NOT NULL,
    category_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    size VARCHAR(20) NOT NULL,
    color VARCHAR(50) NOT NULL,
    brand VARCHAR(100),
    condition_status ENUM('excellent', 'good', 'fair', 'needs-repair') DEFAULT 'excellent',
    rental_price_per_day DECIMAL(10, 2) NOT NULL,
    deposit_amount DECIMAL(10, 2) NOT NULL,
    purchase_price DECIMAL(10, 2),
    image_url VARCHAR(255),
    is_available BOOLEAN DEFAULT TRUE,
    total_rentals INT DEFAULT 0,
    last_rented_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES suit_categories(id),
    INDEX idx_suit_code (suit_code),
    INDEX idx_category (category_id),
    INDEX idx_available (is_available),
    INDEX idx_size (size)
);

-- Suit Rentals Table
CREATE TABLE suit_rentals (
    id INT PRIMARY KEY AUTO_INCREMENT,
    rental_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id INT NOT NULL,
    suit_id INT NOT NULL,
    assigned_employee_id INT,
    rental_start_date DATE NOT NULL,
    rental_end_date DATE NOT NULL,
    actual_return_date DATE,
    rental_days INT NOT NULL,
    rental_amount DECIMAL(10, 2) NOT NULL,
    deposit_amount DECIMAL(10, 2) NOT NULL,
    late_fee DECIMAL(10, 2) DEFAULT 0,
    damage_fee DECIMAL(10, 2) DEFAULT 0,
    deposit_refunded DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_status ENUM('pending', 'paid', 'partially-refunded', 'fully-refunded') NOT NULL DEFAULT 'pending',
    rental_status ENUM('reserved', 'active', 'returned', 'overdue', 'cancelled') NOT NULL DEFAULT 'reserved',
    return_condition ENUM('excellent', 'good', 'fair', 'damaged') DEFAULT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (suit_id) REFERENCES suits(id),
    FOREIGN KEY (assigned_employee_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_rental_number (rental_number),
    INDEX idx_customer (customer_id),
    INDEX idx_suit (suit_id),
    INDEX idx_status (rental_status),
    INDEX idx_dates (rental_start_date, rental_end_date)
);

-- Payments Table
CREATE TABLE payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    payment_number VARCHAR(50) UNIQUE NOT NULL,
    user_id INT NOT NULL,
    order_id INT,
    rental_id INT,
    payment_type ENUM('laundry', 'rental', 'deposit', 'refund') NOT NULL,
    payment_method ENUM('cash', 'card', 'online', 'bank-transfer') NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    transaction_id VARCHAR(100),
    payment_status ENUM('pending', 'completed', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES laundry_orders(id) ON DELETE SET NULL,
    FOREIGN KEY (rental_id) REFERENCES suit_rentals(id) ON DELETE SET NULL,
    INDEX idx_payment_number (payment_number),
    INDEX idx_user (user_id),
    INDEX idx_order (order_id),
    INDEX idx_rental (rental_id),
    INDEX idx_type (payment_type),
    INDEX idx_status (payment_status)
);

-- Notifications Table
CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    type ENUM('order', 'rental', 'payment', 'general', 'reminder') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    send_email BOOLEAN DEFAULT FALSE,
    email_sent BOOLEAN DEFAULT FALSE,
    send_sms BOOLEAN DEFAULT FALSE,
    sms_sent BOOLEAN DEFAULT FALSE,
    related_order_id INT,
    related_rental_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (related_order_id) REFERENCES laundry_orders(id) ON DELETE SET NULL,
    FOREIGN KEY (related_rental_id) REFERENCES suit_rentals(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_read (is_read),
    INDEX idx_type (type)
);

-- Order Status History Table
CREATE TABLE order_status_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    status VARCHAR(50) NOT NULL,
    changed_by INT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES laundry_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(id),
    INDEX idx_order (order_id)
);

-- Rental Status History Table
CREATE TABLE rental_status_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    rental_id INT NOT NULL,
    status VARCHAR(50) NOT NULL,
    changed_by INT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (rental_id) REFERENCES suit_rentals(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(id),
    INDEX idx_rental (rental_id)
);

-- System Settings Table
CREATE TABLE system_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
