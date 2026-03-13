-- WhiskeDelights Production Schema
-- Optimized for Atomic Transactions and High-Precision Auditing

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Users Table (Admin & Staff)
CREATE TABLE IF NOT EXISTS `users` (
  `id` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin', 'staff') DEFAULT 'staff',
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed Admin (Password: admin123)
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`) 
VALUES ('admin-001', 'Master Admin', 'admin@whiskedelights.com', '$2a$10$7zD0M0/z6x2g6J9Jq2W2u.eP5f6k2.Q5f6k2.Q5f6k2.Q5f6k2.', 'admin')
ON DUPLICATE KEY UPDATE `email` = `email`;

-- 2. Cakes Catalog
CREATE TABLE IF NOT EXISTS `cakes` (
  `id` varchar(100) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text,
  `base_price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `category` varchar(50) DEFAULT 'Classic',
  `image_data_uri` longtext,
  `ready_time` varchar(20) DEFAULT '24h',
  `rating` decimal(3,1) DEFAULT '4.5',
  `orders_count` int DEFAULT '0',
  `customizable` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Customization Options
CREATE TABLE IF NOT EXISTS `flavors` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `price` decimal(10,2) DEFAULT '0.00',
  `description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `sizes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `price` decimal(10,2) DEFAULT '0.00',
  `serves` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `colors` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `price` decimal(10,2) DEFAULT '0.00',
  `hex_value` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `toppings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `price` decimal(10,2) DEFAULT '0.00',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Orders Ledger
CREATE TABLE IF NOT EXISTS `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_number` varchar(20) NOT NULL,
  `customer_name` varchar(100) NOT NULL,
  `customer_phone` varchar(20) NOT NULL,
  `delivery_method` enum('delivery', 'pickup') DEFAULT 'pickup',
  `delivery_address` text,
  `delivery_date` varchar(50) DEFAULT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `deposit_amount` decimal(10,2) NOT NULL,
  `payment_status` enum('pending', 'paid') DEFAULT 'pending',
  `order_status` enum('processing', 'complete', 'cancelled') DEFAULT 'processing',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_number` (`order_number`),
  KEY `idx_phone` (`customer_phone`),
  KEY `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Order Line Items (Atomic Children)
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `cake_id` varchar(100) DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `quantity` int DEFAULT '1',
  `price` decimal(10,2) DEFAULT NULL,
  `customizations` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_order_id` (`order_id`),
  CONSTRAINT `fk_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Special Offers
CREATE TABLE IF NOT EXISTS `special_offers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cake_id` varchar(100) NOT NULL,
  `discount_percentage` int NOT NULL DEFAULT '20',
  PRIMARY KEY (`id`),
  KEY `fk_cake_offer` (`cake_id`),
  CONSTRAINT `fk_cake_offer` FOREIGN KEY (`cake_id`) REFERENCES `cakes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;
