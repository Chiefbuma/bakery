-- WhiskeDelights Production Database Schema
-- Optimized for High-Precision Auditing and Atomic Transactions

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Users & Staff Management
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('admin', 'staff') DEFAULT 'staff',
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Cake Catalog
CREATE TABLE IF NOT EXISTS `cakes` (
  `id` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `base_price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `category` VARCHAR(100),
  `ready_time` VARCHAR(50) DEFAULT '24h',
  `image_data_uri` LONGTEXT,
  `rating` DECIMAL(2,1) DEFAULT 0.0,
  `orders_count` INT DEFAULT 0,
  `customizable` TINYINT(1) DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Customization Options
CREATE TABLE IF NOT EXISTS `flavors` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `price` DECIMAL(10,2) DEFAULT 0.00,
  `description` TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `sizes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `price` DECIMAL(10,2) DEFAULT 0.00,
  `serves` VARCHAR(50)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `colors` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `price` DECIMAL(10,2) DEFAULT 0.00,
  `hex_value` VARCHAR(20)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `toppings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `price` DECIMAL(10,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Orders Ledger
CREATE TABLE IF NOT EXISTS `orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_number` VARCHAR(50) NOT NULL,
  `customer_name` VARCHAR(255) NOT NULL,
  `customer_phone` VARCHAR(50) NOT NULL,
  `delivery_method` ENUM('delivery', 'pickup') NOT NULL,
  `delivery_address` TEXT,
  `delivery_date` DATE,
  `total_price` DECIMAL(10,2) NOT NULL,
  `deposit_amount` DECIMAL(10,2) NOT NULL,
  `payment_status` ENUM('pending', 'paid') DEFAULT 'pending',
  `order_status` ENUM('processing', 'complete', 'cancelled') DEFAULT 'processing',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `order_num_unique` (`order_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `order_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT,
  `cake_id` VARCHAR(255),
  `name` VARCHAR(255),
  `quantity` INT,
  `price` DECIMAL(10,2),
  `customizations` JSON,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Special Offers
CREATE TABLE IF NOT EXISTS `special_offers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `cake_id` VARCHAR(255),
  `discount_percentage` INT DEFAULT 0,
  FOREIGN KEY (`cake_id`) REFERENCES `cakes`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Initial Seed Data
-- Default Admin: admin@whiskedelights.com / admin123
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`) 
VALUES ('admin-init', 'WhiskeDelights Admin', 'admin@whiskedelights.com', '$2b$10$vI8aWBnW3fID.91T.K5W2.e2x.1Xv9R3J3lB7S8S7S8S7S8S7S8S7', 'admin')
ON DUPLICATE KEY UPDATE `name`=`name`;

-- Seed Flavors
INSERT INTO `flavors` (`name`, `price`, `description`) VALUES 
('Classic Vanilla', 0.00, 'Aromatic vanilla bean sponge'),
('Rich Chocolate', 200.00, 'Premium cocoa with ganache layers'),
('Red Velvet', 250.00, 'Signature cream cheese pairing');

-- Seed Sizes
INSERT INTO `sizes` (`name`, `price`, `serves`) VALUES 
('6 inch', 0.00, '6-8 people'),
('8 inch', 500.00, '10-12 people'),
('10 inch', 1000.00, '15-20 people');

SET FOREIGN_KEY_CHECKS = 1;
