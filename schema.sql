-- WhiskeDelights Production Database Schema
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
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Table structure for cakes
-- ----------------------------
CREATE TABLE IF NOT EXISTS `cakes` (
  `id` varchar(100) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `base_price` decimal(10,2) NOT NULL,
  `category` varchar(50) DEFAULT 'Classic',
  `ready_time` varchar(20) DEFAULT '24h',
  `customizable` tinyint(1) DEFAULT '1',
  `image_data_uri` longtext,
  `rating` decimal(2,1) DEFAULT '5.0',
  `orders_count` int DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Table structure for orders
-- ----------------------------
CREATE TABLE IF NOT EXISTS `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_number` varchar(50) NOT NULL,
  `customer_name` varchar(255) NOT NULL,
  `customer_phone` varchar(20) NOT NULL,
  `delivery_method` enum('delivery','pickup') DEFAULT 'pickup',
  `delivery_address` text,
  `delivery_date` varchar(50) DEFAULT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `deposit_amount` decimal(10,2) NOT NULL,
  `payment_status` enum('pending','paid') DEFAULT 'pending',
  `order_status` enum('processing','complete','cancelled') DEFAULT 'processing',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_number` (`order_number`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_status` (`order_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
  KEY `order_id` (`order_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Table structure for flavors
-- ----------------------------
CREATE TABLE IF NOT EXISTS `flavors` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `price` decimal(10,2) DEFAULT '0.00',
  `description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Table structure for sizes
-- ----------------------------
CREATE TABLE IF NOT EXISTS `sizes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `serves` varchar(100) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT '0.00',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Table structure for colors
-- ----------------------------
CREATE TABLE IF NOT EXISTS `colors` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `hex_value` varchar(20) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT '0.00',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Table structure for toppings
-- ----------------------------
CREATE TABLE IF NOT EXISTS `toppings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `price` decimal(10,2) DEFAULT '0.00',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Table structure for special_offers
-- ----------------------------
CREATE TABLE IF NOT EXISTS `special_offers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cake_id` varchar(100) NOT NULL,
  `discount_percentage` int NOT NULL DEFAULT '20',
  PRIMARY KEY (`id`),
  KEY `cake_id` (`cake_id`),
  CONSTRAINT `special_offers_ibfk_1` FOREIGN KEY (`cake_id`) REFERENCES `cakes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- SEED DATA
-- ----------------------------

-- Default Admin: admin@whiskedelights.com / admin123
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`) VALUES 
('U-ADMIN', 'Artisan Admin', 'admin@whiskedelights.com', '$2a$10$tM.yvjB.0mCg1Yh.A3Mv6uvB8n.6iL9L8L8L8L8L8L8L8L8L8L8L8', 'admin');

INSERT INTO `flavors` (`name`, `price`, `description`) VALUES 
('Classic Vanilla', 0.00, 'Aromatic Madagascar vanilla bean.'),
('Belgian Chocolate', 350.00, 'Rich 70% dark cocoa indulgence.'),
('Red Velvet', 400.00, 'Signature cocoa and buttermilk base.');

INSERT INTO `sizes` (`name`, `serves`, `price`) VALUES 
('6" Regular', '6-8 People', 0.00),
('8" Large', '12-15 People', 1200.00),
('10" Party', '20-25 People', 2500.00);

INSERT INTO `colors` (`name`, `hex_value`, `price`) VALUES 
('Signature Gold', '#C68324', 0.00),
('Pure Ivory', '#FAF5EB', 0.00),
('Royal Burgundy', '#800020', 200.00);

INSERT INTO `cakes` (`id`, `name`, `description`, `base_price`, `category`, `ready_time`, `customizable`, `rating`, `orders_count`) VALUES 
('chocolate-fudge', 'Chocolate Fudge Masterpiece', 'Layered Belgian chocolate with rich ganache.', 3800.00, 'Chocolate', '24h', 1, 4.9, 142),
('vanilla-bean', 'Classic Vanilla Bean', 'Light sponge infused with fresh vanilla pods.', 3200.00, 'Classic', '24h', 1, 4.8, 98);

INSERT INTO `special_offers` (`cake_id`, `discount_percentage`) VALUES ('chocolate-fudge', 20);

SET FOREIGN_KEY_CHECKS = 1;
