
-- WhiskeDelights Production Database Schema
-- Optimized for MySQL 8.0+

-- 1. Admins/Users Table
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('admin', 'staff') DEFAULT 'staff',
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Artisanal Cakes Catalog
CREATE TABLE IF NOT EXISTS `cakes` (
  `id` VARCHAR(100) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `base_price` DECIMAL(10, 2) NOT NULL,
  `image_data_uri` LONGTEXT,
  `rating` DECIMAL(3, 2) DEFAULT 0.00,
  `category` VARCHAR(100) NOT NULL,
  `orders_count` INT DEFAULT 0,
  `ready_time` VARCHAR(50) NOT NULL,
  `customizable` BOOLEAN DEFAULT TRUE,
  `defaultFlavorId` VARCHAR(50)
);

-- 3. Customization Variants
CREATE TABLE IF NOT EXISTS `flavors` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `price` DECIMAL(10, 2) DEFAULT 0.00,
  `description` VARCHAR(255),
  `color` VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS `sizes` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `serves` VARCHAR(100) NOT NULL,
  `price` DECIMAL(10, 2) DEFAULT 0.00
);

CREATE TABLE IF NOT EXISTS `colors` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `hex_value` VARCHAR(20) NOT NULL,
  `price` DECIMAL(10, 2) DEFAULT 0.00
);

CREATE TABLE IF NOT EXISTS `toppings` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `price` DECIMAL(10, 2) DEFAULT 0.00
);

-- 4. Special Offers (Singleton Logic)
CREATE TABLE IF NOT EXISTS `special_offers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `cake_id` VARCHAR(100) NOT NULL,
  `discount_percentage` INT NOT NULL,
  FOREIGN KEY (`cake_id`) REFERENCES `cakes`(`id`) ON DELETE CASCADE
);

-- 5. Orders Ledger
CREATE TABLE IF NOT EXISTS `orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_number` VARCHAR(50) NOT NULL UNIQUE,
  `customer_name` VARCHAR(255) NOT NULL,
  `customer_phone` VARCHAR(50) NOT NULL,
  `delivery_method` ENUM('delivery', 'pickup') NOT NULL,
  `delivery_address` TEXT,
  `delivery_date` VARCHAR(100),
  `total_price` DECIMAL(10, 2) NOT NULL,
  `deposit_amount` DECIMAL(10, 2) NOT NULL,
  `payment_status` ENUM('pending', 'paid') DEFAULT 'pending',
  `order_status` ENUM('processing', 'complete', 'cancelled') DEFAULT 'processing',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `order_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT NOT NULL,
  `cake_id` VARCHAR(100) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `quantity` INT NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `customizations` JSON,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE
);

-- Indexing for High-Precision Auditing & Performance
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_status ON orders(order_status);
CREATE INDEX idx_cakes_category ON cakes(category);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- Initial Seed Data (Artisanal Defaults)
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`) VALUES 
('U-001', 'Master Baker', 'admin@whiskedelights.com', '$2b$10$U7vOqH0DkE0v7uU9H6tY4.WfT2.H8S/6G/oW8pX6S7u0x1G2z3A4B', 'admin'); -- Pass: admin123

INSERT INTO `flavors` (`id`, `name`, `price`, `description`, `color`) VALUES 
('f1', 'Classic Vanilla', 0.00, 'Madagascar Bean', '#F3E5AB'),
('f2', 'Rich Chocolate', 200.00, 'Belgian Cocoa', '#5D4037'),
('f3', 'Red Velvet', 250.00, 'Classic Crimson', '#9B2C2C');

INSERT INTO `sizes` (`id`, `name`, `serves`, `price`) VALUES 
('s1', '6" Standard', '6-8 people', 0.00),
('s2', '8" Large', '10-12 people', 500.00);

INSERT INTO `cakes` (`id`, `name`, `description`, `base_price`, `category`, `ready_time`, `customizable`, `rating`, `orders_count`) VALUES 
('chocolate-fudge-delight', 'Chocolate Fudge Delight', 'Decadent artisanal masterpiece.', 3200.00, 'Chocolate', '24h', TRUE, 4.9, 150);

INSERT INTO `special_offers` (`cake_id`, `discount_percentage`) VALUES ('chocolate-fudge-delight', 20);
