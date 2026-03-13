-- WhiskeDelights Production Database Schema
-- Optimized for MySQL 8.0+

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for users (Admin & Staff)
-- ----------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','staff') DEFAULT 'staff',
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Seed Default Admin: admin@whiskedelights.com / admin123
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`) 
VALUES ('U-ADMIN-01', 'System Administrator', 'admin@whiskedelights.com', '$2a$10$wE9mHlW/v6Z3mH1k.G3Q.euH0W7Fp.Q6G0V9oY1mG0V9oY1mG0V9o', 'admin')
ON DUPLICATE KEY UPDATE id=id;

-- ----------------------------
-- Table structure for cakes (Catalog)
-- ----------------------------
CREATE TABLE IF NOT EXISTS `cakes` (
  `id` varchar(100) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `base_price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `category` varchar(100) DEFAULT 'Classic',
  `image_data_uri` longtext,
  `ready_time` varchar(50) DEFAULT '24h',
  `rating` decimal(3,1) DEFAULT '5.0',
  `orders_count` int DEFAULT '0',
  `customizable` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category`),
  KEY `idx_rating` (`rating`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Seed Initial Catalog
INSERT INTO `cakes` (`id`, `name`, `description`, `base_price`, `category`, `ready_time`, `rating`, `orders_count`) VALUES
('chocolate-fudge-delight', 'Chocolate Fudge Delight', 'Rich decadent chocolate layers with silky ganache.', 3200.00, 'Chocolate', '24h', 4.9, 150),
('red-velvet-classic', 'Red Velvet Classic', 'Timeless red velvet with premium cream cheese frosting.', 2800.00, 'Classic', '24h', 4.8, 120),
('vanilla-bean-masterpiece', 'Vanilla Bean Masterpiece', 'Infused with organic Madagascar vanilla beans.', 2400.00, 'Classic', '24h', 4.7, 95)
ON DUPLICATE KEY UPDATE id=id;

-- ----------------------------
-- Table structure for customization options
-- ----------------------------
CREATE TABLE IF NOT EXISTS `flavors` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `price` decimal(10,2) DEFAULT '0.00',
  `description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `sizes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `price` decimal(10,2) DEFAULT '0.00',
  `serves` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `colors` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `price` decimal(10,2) DEFAULT '0.00',
  `hex_value` varchar(20) DEFAULT '#FFFFFF',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `toppings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `price` decimal(10,2) DEFAULT '0.00',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Table structure for orders
-- ----------------------------
CREATE TABLE IF NOT EXISTS `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_number` varchar(50) NOT NULL,
  `customer_name` varchar(255) NOT NULL,
  `customer_phone` varchar(50) NOT NULL,
  `delivery_method` enum('delivery','pickup') NOT NULL,
  `delivery_address` text,
  `delivery_date` varchar(100) DEFAULT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `deposit_amount` decimal(10,2) NOT NULL,
  `payment_status` enum('pending','paid') DEFAULT 'pending',
  `order_status` enum('processing','complete','cancelled') DEFAULT 'processing',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_number` (`order_number`),
  KEY `idx_status` (`order_status`),
  KEY `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;
