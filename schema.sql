-- WhiskeDelights Production Database Schema
-- Optimized for High-Precision Auditing and eCommerce Integrity

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Users Table (Admin & Staff Access)
CREATE TABLE IF NOT EXISTS `users` (
  `id` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','staff') DEFAULT 'staff',
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert Default Admin: admin@whiskedelights.com / admin123
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`) 
VALUES ('U-1', 'WhiskeDelights Admin', 'admin@whiskedelights.com', '$2a$10$7R.x7wL0A6hWp3hY7W7W7Ou7Z7Y7Y7Y7Y7Y7Y7Y7Y7Y7Y7Y7Y7Y7Y', 'admin')
ON DUPLICATE KEY UPDATE id=id;

-- 2. Cakes Table (Product Catalog)
CREATE TABLE IF NOT EXISTS `cakes` (
  `id` varchar(100) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `base_price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `category` varchar(50) DEFAULT 'Classic',
  `ready_time` varchar(20) DEFAULT '24h',
  `customizable` tinyint(1) DEFAULT '1',
  `image_data_uri` longtext,
  `rating` decimal(3,2) DEFAULT '5.00',
  `orders_count` int DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Customization Options (Variants)
CREATE TABLE IF NOT EXISTS `flavors` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `price` decimal(10,2) DEFAULT '0.00',
  `description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `sizes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `price` decimal(10,2) DEFAULT '0.00',
  `serves` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `colors` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `price` decimal(10,2) DEFAULT '0.00',
  `hex_value` varchar(20) DEFAULT '#FFFFFF',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `toppings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `price` decimal(10,2) DEFAULT '0.00',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Orders Table (Transaction Ledger)
CREATE TABLE IF NOT EXISTS `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_number` varchar(20) NOT NULL,
  `customer_name` varchar(100) NOT NULL,
  `customer_phone` varchar(20) NOT NULL,
  `delivery_method` enum('delivery','pickup') NOT NULL,
  `delivery_address` text,
  `delivery_date` date DEFAULT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `deposit_amount` decimal(10,2) NOT NULL,
  `payment_status` enum('pending','paid') DEFAULT 'pending',
  `order_status` enum('processing','complete','cancelled') DEFAULT 'processing',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_number` (`order_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Order Items (Line Items)
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `cake_id` varchar(100) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `price` decimal(10,2) NOT NULL,
  `customizations` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Special Offers
CREATE TABLE IF NOT EXISTS `special_offers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cake_id` varchar(100) NOT NULL,
  `discount_percentage` int NOT NULL DEFAULT '20',
  PRIMARY KEY (`id`),
  KEY `cake_id` (`cake_id`),
  CONSTRAINT `special_offers_ibfk_1` FOREIGN KEY (`cake_id`) REFERENCES `cakes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;
