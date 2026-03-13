-- WhiskeDelights Artisanal Bakery - Production Schema
-- Optimized for MySQL 8.0+

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for users
-- ----------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','staff') DEFAULT 'staff',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email_idx` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed Admin (Password: admin123)
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`) 
VALUES ('admin-01', 'Primary Admin', 'admin@whiskedelights.com', '$2a$10$7/O8ZcK.bO6S5Xm7XfP1zeK2v3.P2mR0T6Y.R6V8V9V.V9V9V9V9V', 'admin')
ON DUPLICATE KEY UPDATE `email`=`email`;

-- ----------------------------
-- Table structure for cakes
-- ----------------------------
CREATE TABLE IF NOT EXISTS `cakes` (
  `id` varchar(100) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `base_price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `category` varchar(50) DEFAULT 'Classic',
  `ready_time` varchar(20) DEFAULT '24h',
  `customizable` tinyint(1) DEFAULT '1',
  `image_data_uri` text,
  `rating` decimal(3,1) DEFAULT '5.0',
  `orders_count` int DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `cat_idx` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed Initial Catalog
INSERT INTO `cakes` (id, name, description, base_price, category, ready_time, customizable, image_data_uri, rating, orders_count) VALUES 
('chocolate-fudge-delight', 'Chocolate Fudge Delight', 'A rich and decadent chocolate fudge cake layered with silky ganache.', 3200.00, 'Chocolate', '24h', 1, 'https://images.unsplash.com/photo-1602351447937-745cb720612f?auto=format&fit=crop&q=80&w=600', 4.9, 150),
('red-velvet-delight', 'Red Velvet Delight', 'The timeless classic with signature cream cheese frosting.', 2800.00, 'Classic', '24h', 1, 'https://images.unsplash.com/photo-1645366188121-2a19e02fcbd5?auto=format&fit=crop&q=80&w=600', 4.8, 120);

-- ----------------------------
-- Customization Tables
-- ----------------------------
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
  `serves` varchar(50) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT '0.00',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `colors` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `hex_value` varchar(7) DEFAULT '#FFFFFF',
  `price` decimal(10,2) DEFAULT '0.00',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `toppings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `price` decimal(10,2) DEFAULT '0.00',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Table structure for special_offers
-- ----------------------------
CREATE TABLE IF NOT EXISTS `special_offers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cake_id` varchar(100) NOT NULL,
  `discount_percentage` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `cake_fk` (`cake_id`),
  CONSTRAINT `cake_fk_constraint` FOREIGN KEY (`cake_id`) REFERENCES `cakes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Table structure for orders
-- ----------------------------
CREATE TABLE IF NOT EXISTS `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_number` varchar(50) NOT NULL,
  `customer_name` varchar(255) NOT NULL,
  `customer_phone` varchar(20) NOT NULL,
  `delivery_method` enum('delivery','pickup') NOT NULL,
  `delivery_address` text,
  `delivery_date` date DEFAULT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `deposit_amount` decimal(10,2) NOT NULL,
  `payment_status` enum('pending','paid') DEFAULT 'pending',
  `order_status` enum('processing','complete','cancelled') DEFAULT 'processing',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_num_idx` (`order_number`),
  KEY `status_idx` (`order_status`),
  KEY `date_idx` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Table structure for order_items
-- ----------------------------
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `cake_id` varchar(100) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `price` decimal(10,2) NOT NULL,
  `customizations` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `order_fk` (`order_id`),
  CONSTRAINT `order_fk_constraint` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;
