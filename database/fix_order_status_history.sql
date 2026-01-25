-- Fix order_status_history table structure
-- This migration changes the 'status' column to 'old_status' and 'new_status'

USE laundrix_db;

-- Drop the old table and recreate with correct structure
DROP TABLE IF EXISTS order_status_history;

CREATE TABLE order_status_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    old_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by INT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES laundry_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_order (order_id)
);

-- Recreate rental_status_history table with correct structure
DROP TABLE IF EXISTS rental_status_history;

CREATE TABLE rental_status_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    rental_id INT NOT NULL,
    old_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by INT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (rental_id) REFERENCES suit_rentals(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_rental (rental_id)
);

-- Add history entries for existing orders
INSERT INTO order_status_history (order_id, old_status, new_status, changed_by, notes, created_at)
SELECT id, NULL, status, customer_id, CONCAT('Initial status: ', status), created_at
FROM laundry_orders;

-- Add history entries for existing rentals
INSERT INTO rental_status_history (rental_id, old_status, new_status, changed_by, notes, created_at)
SELECT id, NULL, rental_status, customer_id, CONCAT('Initial status: ', rental_status), created_at
FROM suit_rentals;

SELECT 'Migration completed successfully!' AS message;
