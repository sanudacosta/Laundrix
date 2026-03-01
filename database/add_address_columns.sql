-- Migration: Add pickup_address and delivery_address to laundry_orders table
USE laundrix_db;

-- Add the missing columns
ALTER TABLE laundry_orders 
ADD COLUMN pickup_address TEXT AFTER special_instructions,
ADD COLUMN delivery_address TEXT AFTER pickup_address;

SELECT 'Migration completed! pickup_address and delivery_address columns added.' AS message;
