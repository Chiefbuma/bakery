
-- Wamaghach Hotel Management System | Production Database Schema
-- Optimized for MySQL 8.0+

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Personnel Table
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) UNIQUE NOT NULL,
  `role` ENUM('admin', 'staff') DEFAULT 'staff',
  `password` VARCHAR(255) NOT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Master Stock Table
CREATE TABLE IF NOT EXISTS `products` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `category` VARCHAR(100),
  `module` ENUM('restaurant', 'bar', 'carwash', 'accommodation', 'entertainment') NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `costPrice` DECIMAL(10, 2) NOT NULL,
  `stock` DECIMAL(10, 2) DEFAULT 0,
  `minStockLevel` DECIMAL(10, 2) DEFAULT 5,
  `unit` VARCHAR(50) DEFAULT 'units',
  `image_url` TEXT,
  INDEX `idx_prod_module` (`module`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Raw Supplies Table
CREATE TABLE IF NOT EXISTS `supplies` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100),
  `module` VARCHAR(100),
  `quantity` DECIMAL(15, 4) DEFAULT 0,
  `unit` VARCHAR(50) NOT NULL,
  `unitCost` DECIMAL(10, 2) NOT NULL,
  `lastPurchased` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_supp_module` (`module`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Consumption Recipes
CREATE TABLE IF NOT EXISTS `recipes` (
  `productId` VARCHAR(50) NOT NULL,
  `supplyId` VARCHAR(50) NOT NULL,
  `amount` DECIMAL(15, 4) NOT NULL,
  PRIMARY KEY (`productId`, `supplyId`),
  FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`supplyId`) REFERENCES `supplies`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Sales Transactions
CREATE TABLE IF NOT EXISTS `transactions` (
  `id` VARCHAR(50) PRIMARY KEY,
  `orderNumber` VARCHAR(100) UNIQUE NOT NULL,
  `module` VARCHAR(50) NOT NULL,
  `totalAmount` DECIMAL(12, 2) NOT NULL,
  `totalCost` DECIMAL(12, 2) NOT NULL,
  `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `paymentMethod` ENUM('cash', 'mpesa', 'card', 'none') DEFAULT 'none',
  `status` ENUM('paid', 'pending') DEFAULT 'pending',
  `customerName` VARCHAR(255),
  `amountReceived` DECIMAL(12, 2),
  `balance` DECIMAL(12, 2),
  INDEX `idx_tx_timestamp` (`timestamp`),
  INDEX `idx_tx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Sale Items Detail
CREATE TABLE IF NOT EXISTS `transaction_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `transactionId` VARCHAR(50) NOT NULL,
  `productId` VARCHAR(50) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `quantity` INT NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `costPrice` DECIMAL(10, 2) NOT NULL,
  `total` DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (`transactionId`) REFERENCES `transactions`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Operating Expenses
CREATE TABLE IF NOT EXISTS `expenses` (
  `id` VARCHAR(50) PRIMARY KEY,
  `category` VARCHAR(100) NOT NULL,
  `amount` DECIMAL(12, 2) NOT NULL,
  `description` TEXT,
  `date` DATE NOT NULL,
  `module` VARCHAR(50) DEFAULT 'general',
  INDEX `idx_exp_date` (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Initial Seed Data
INSERT INTO `users` (`id`, `name`, `email`, `role`, `password`) VALUES 
('U1', 'Admin User', 'admin@wamaghach.com', 'admin', 'admin123');

INSERT INTO `products` (`id`, `name`, `category`, `module`, `price`, `costPrice`, `stock`, `unit`, `image_url`) VALUES
('P1', 'Beef Pilau (Full)', 'Main Dish', 'restaurant', 450.00, 200.00, 100, 'plates', 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&q=80&w=1080'),
('P2', 'Grilled Tilapia', 'Main Dish', 'restaurant', 800.00, 450.00, 50, 'plates', 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=1080'),
('P3', 'Standard Double Room', 'Accommodation', 'accommodation', 3500.00, 1000.00, 10, 'night', 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=1080');

SET FOREIGN_KEY_CHECKS = 1;
