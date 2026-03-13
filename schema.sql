-- WhiskeDelights Artisanal Bakery | Production Database Schema
-- Optimized for MySQL 8.0+ on CloudLinux/cPanel environments

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. CAKES TABLE (The Core Catalog)
DROP TABLE IF EXISTS `cakes`;
CREATE TABLE `cakes` (
  `id` varchar(100) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `base_price` decimal(15,2) NOT NULL DEFAULT '0.00',
  `category` varchar(100) NOT NULL DEFAULT 'Classic',
  `ready_time` varchar(50) DEFAULT '24h',
  `image_data_uri` longtext,
  `rating` decimal(3,1) DEFAULT '5.0',
  `orders_count` int DEFAULT '0',
  `customizable` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. CUSTOMIZATION OPTIONS (Flavors, Sizes, Frosting, Toppings)
DROP TABLE IF EXISTS `flavors`;
CREATE TABLE `flavors` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `price` decimal(15,2) DEFAULT '0.00',
  `description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS `sizes`;
CREATE TABLE `sizes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `price` decimal(15,2) DEFAULT '0.00',
  `serves` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS `colors`;
CREATE TABLE `colors` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `hex_value` varchar(20) DEFAULT NULL,
  `price` decimal(15,2) DEFAULT '0.00',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS `toppings`;
CREATE TABLE `toppings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `price` decimal(15,2) DEFAULT '0.00',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. ORDERS TABLE (Atomic Transaction Ledger)
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_number` varchar(50) NOT NULL,
  `customer_name` varchar(255) NOT NULL,
  `customer_phone` varchar(50) NOT NULL,
  `delivery_method` enum('delivery','pickup') NOT NULL DEFAULT 'pickup',
  `delivery_address` text,
  `delivery_date` varchar(50) DEFAULT NULL,
  `total_price` decimal(15,2) NOT NULL,
  `deposit_amount` decimal(15,2) NOT NULL,
  `payment_status` enum('pending','paid') DEFAULT 'pending',
  `order_status` enum('processing','complete','cancelled') DEFAULT 'processing',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_number` (`order_number`),
  KEY `idx_status` (`order_status`),
  KEY `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. ORDER ITEMS (Line Item Details)
DROP TABLE IF EXISTS `order_items`;
CREATE TABLE `order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `cake_id` varchar(100) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `quantity` int DEFAULT '1',
  `price` decimal(15,2) NOT NULL,
  `customizations` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. SPECIAL OFFERS (Storefront Highlight)
DROP TABLE IF EXISTS `special_offers`;
CREATE TABLE `special_offers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cake_id` varchar(100) NOT NULL,
  `discount_percentage` int NOT NULL DEFAULT '20',
  PRIMARY KEY (`id`),
  KEY `cake_id` (`cake_id`),
  CONSTRAINT `special_offers_ibfk_1` FOREIGN KEY (`cake_id`) REFERENCES `cakes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. USERS TABLE (Administrative Personnel)
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` varchar(100) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','staff') DEFAULT 'staff',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- INITIAL SEED DATA
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`) VALUES
('U-ADMIN-01', 'Primary Administrator', 'admin@whiskedelights.com', '$2a$10$C8.6vXjXq9l6M9e1XGfRZeB3nOq1M1Z5M8M9e1XGfRZeB3nOq1M1Z', 'admin');
-- Note: Password is 'admin123' (BCrypt hashed)

INSERT INTO `cakes` (`id`, `name`, `description`, `base_price`, `category`, `ready_time`, `customizable`, `rating`, `orders_count`) VALUES
('belgian-truffle', 'Belgian Truffle Masterpiece', 'A rich, decadent chocolate cake layered with silky Belgian ganache.', 3200.00, 'Chocolate', '24h', 1, 4.9, 150),
('red-velvet-heritage', 'Red Velvet Heritage', 'Timeless scarlet cocoa sponge with our signature cream cheese frosting.', 2800.00, 'Classic', '24h', 1, 4.8, 120),
('strawberry-dream-sponge', 'Strawberry Dream Sponge', 'Light vanilla sponge filled with fresh Nyeri strawberries and whipped cream.', 2500.00, 'Fruit', '24h', 0, 4.7, 95);

INSERT INTO `flavors` (`name`, `price`, `description`) VALUES
('Madagascar Vanilla', 0.00, 'Pure aromatic bean extract.'),
('Rich Dark Chocolate', 250.00, '70% Cocoa depth.'),
('Passion Fruit Tang', 150.00, 'Zesty tropical notes.');

INSERT INTO `sizes` (`name`, `price`, `serves`) VALUES
('6\" Intimate', 0.00, '6-8 people'),
('8\" Standard', 600.00, '10-12 people'),
('10\" Celebration', 1200.00, '18-22 people');

INSERT INTO `colors` (`name`, `hex_value`, `price`) VALUES
('Artisan White', '#FFFFFF', 0.00),
('Rose Blush', '#FFD1DC', 150.00),
('Midnight Gold', '#D4AF37', 300.00);

INSERT INTO `special_offers` (`cake_id`, `discount_percentage`) VALUES ('belgian-truffle', 20);

SET FOREIGN_KEY_CHECKS = 1;