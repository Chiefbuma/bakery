
-- WhiskeDelights Artisanal Bakery | Production Database Schema
-- Optimized for high-precision auditing and performance.

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for cakes
-- ----------------------------
DROP TABLE IF EXISTS `cakes`;
CREATE TABLE `cakes` (
  `id` varchar(100) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `base_price` decimal(10, 2) NOT NULL,
  `category` varchar(50) DEFAULT 'Classic',
  `ready_time` varchar(20) DEFAULT '24h',
  `rating` decimal(3, 1) DEFAULT 0.0,
  `orders_count` int DEFAULT 0,
  `customizable` tinyint(1) DEFAULT 1,
  `image_data_uri` longtext,
  `default_flavor_id` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category`),
  KEY `idx_price` (`base_price`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Table structure for customization options
-- ----------------------------
DROP TABLE IF EXISTS `flavors`;
CREATE TABLE `flavors` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `price` decimal(10, 2) DEFAULT 0.00,
  `hex_color` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS `sizes`;
CREATE TABLE `sizes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `serves` varchar(50) DEFAULT NULL,
  `price` decimal(10, 2) DEFAULT 0.00,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS `colors`;
CREATE TABLE `colors` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `hex_value` varchar(20) NOT NULL,
  `price` decimal(10, 2) DEFAULT 0.00,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS `toppings`;
CREATE TABLE `toppings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `price` decimal(10, 2) DEFAULT 0.00,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Table structure for orders
-- ----------------------------
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_number` varchar(50) NOT NULL,
  `customer_name` varchar(255) NOT NULL,
  `customer_phone` varchar(20) NOT NULL,
  `delivery_method` enum('delivery','pickup') NOT NULL,
  `delivery_address` text,
  `delivery_date` varchar(50) DEFAULT NULL,
  `total_price` decimal(10, 2) NOT NULL,
  `deposit_amount` decimal(10, 2) NOT NULL,
  `payment_status` enum('pending','paid') DEFAULT 'pending',
  `order_status` enum('processing','complete', 'cancelled') DEFAULT 'processing',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_order_number` (`order_number`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_status` (`order_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Table structure for order items
-- ----------------------------
DROP TABLE IF EXISTS `order_items`;
CREATE TABLE `order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `cake_id` varchar(100) NOT NULL,
  `name` varchar(255) NOT NULL,
  `quantity` int NOT NULL DEFAULT 1,
  `price` decimal(10, 2) NOT NULL,
  `customizations` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` varchar(100) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `role` enum('admin','staff') DEFAULT 'staff',
  `password` varchar(255) NOT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Initial Data (Default Admin: admin@whiskedelights.com / admin123)
-- ----------------------------
INSERT INTO `users` (`id`, `name`, `email`, `role`, `password`) VALUES ('U-ADMIN-01', 'Master Baker', 'admin@whiskedelights.com', 'admin', '$2a$10$8K1G6U1f6X8n9M5/X6j1u.f9v8Qv9/X6j1u.f9v8Qv9/X6j1u.f9');

-- ----------------------------
-- Seed Catalog
-- ----------------------------
INSERT INTO `cakes` (`id`, `name`, `description`, `base_price`, `category`, `ready_time`, `rating`, `orders_count`, `customizable`) VALUES 
('chocolate-fudge-delight', 'Chocolate Fudge Delight', 'A rich and decadent chocolate fudge cake layered with silky ganache.', 3200.00, 'Chocolate', '24h', 4.9, 150, 1),
('red-velvet-delight', 'Red Velvet Delight', 'The timeless classic with signature cream cheese frosting.', 2800.00, 'Classic', '24h', 4.8, 120, 1),
('strawberry-dream', 'Strawberry Dream', 'A light and fluffy vanilla sponge cake with fresh strawberries.', 2500.00, 'Fruit', '24h', 4.7, 95, 0);

INSERT INTO `flavors` (`name`, `description`, `price`) VALUES ('Classic Vanilla', 'Timeless aromatic vanilla', 0.00), ('Rich Chocolate', 'Deep decadent cocoa', 200.00);
INSERT INTO `sizes` (`name`, `serves`, `price`) VALUES ('6" Cake', '6-8 people', 0.00), ('8" Cake', '10-12 people', 500.00);

SET FOREIGN_KEY_CHECKS = 1;
