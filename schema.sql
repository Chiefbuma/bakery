-- WhiskeDelights Production Schema
-- Optimized for MySQL 8.0+

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Users Table (Admin & Staff)
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

-- Seed Admin (Password: admin123)
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`) VALUES
('U-ADMIN-01', 'Primary Administrator', 'admin@whiskedelights.com', '$2a$10$7R6v7Y9n8K7y6G5f4E3d2c1B0a9z8y7x6w5v4u3t2s1r0q9p8o', 'admin')
ON DUPLICATE KEY UPDATE id=id;

-- 2. Cakes Table (Catalog)
CREATE TABLE IF NOT EXISTS `cakes` (
  `id` varchar(100) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `base_price` decimal(10,2) NOT NULL,
  `category` varchar(50) NOT NULL,
  `ready_time` varchar(20) DEFAULT '24h',
  `rating` decimal(3,2) DEFAULT '5.00',
  `orders_count` int DEFAULT '0',
  `customizable` tinyint(1) DEFAULT '1',
  `image_data_uri` longtext,
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category`),
  KEY `idx_orders` (`orders_count`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed Initial Catalog
INSERT INTO `cakes` (`id`, `name`, `description`, `base_price`, `category`, `image_data_uri`) VALUES
('belgian-truffle', 'Belgian Truffle Masterpiece', 'Rich, dark chocolate ganache with a silky smooth finish.', 3500.00, 'Chocolate', 'https://images.unsplash.com/photo-1602351447937-745cb720612f?auto=format&fit=crop&q=80&w=600'),
('classic-red-velvet', 'Classic Red Velvet', 'Traditional red velvet with signature cream cheese frosting.', 2800.00, 'Classic', 'https://images.unsplash.com/photo-1645366188121-2a19e02fcbd5?auto=format&fit=crop&q=80&w=600')
ON DUPLICATE KEY UPDATE id=id;

-- 3. Customization Options (Flavors, Sizes, Colors, Toppings)
CREATE TABLE IF NOT EXISTS `flavors` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `price` decimal(10,2) DEFAULT '0.00',
  `description` varchar(255),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `sizes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `serves` varchar(50) NOT NULL,
  `price` decimal(10,2) DEFAULT '0.00',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `colors` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `hex_value` varchar(7) NOT NULL,
  `price` decimal(10,2) DEFAULT '0.00',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `toppings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `price` decimal(10,2) DEFAULT '0.00',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed Customizations
INSERT INTO `flavors` (`name`, `price`, `description`) VALUES ('Madagascar Vanilla', 0.00, 'Pure aromatic bean'), ('Belgian Cocoa', 250.00, 'Rich deep chocolate');
INSERT INTO `sizes` (`name`, `serves`, `price`) VALUES ('Small (6")', '6-8 people', 0.00), ('Medium (8")', '10-12 people', 500.00);

-- 4. Orders Table (Atomic Transactions)
CREATE TABLE IF NOT EXISTS `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_number` varchar(20) NOT NULL,
  `customer_name` varchar(255) NOT NULL,
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
  UNIQUE KEY `order_number` (`order_number`),
  KEY `idx_status` (`order_status`),
  KEY `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Order Items Table
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `cake_id` varchar(100) NOT NULL,
  `name` varchar(255) NOT NULL,
  `quantity` int NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `customizations` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  CONSTRAINT `order_items_fk` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Special Offers Table
CREATE TABLE IF NOT EXISTS `special_offers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cake_id` varchar(100) NOT NULL,
  `discount_percentage` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `cake_id` (`cake_id`),
  CONSTRAINT `special_offers_fk` FOREIGN KEY (`cake_id`) REFERENCES `cakes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;