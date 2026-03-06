-- Wamaghach Kahua-ini Hotel | Production Database Schema
-- Updated to support Modules, Production Recipes, and Advanced Cost Tracking

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Master Users / Personnel
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(255) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `role` ENUM('admin', 'staff') DEFAULT 'staff',
  `password` VARCHAR(255) NOT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Master Stock (Sellable Products & Services)
CREATE TABLE IF NOT EXISTS `products` (
  `id` VARCHAR(255) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `category` VARCHAR(255),
  `module` ENUM('restaurant', 'bar', 'carwash', 'accommodation', 'entertainment', 'general') DEFAULT 'restaurant',
  `price` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `costPrice` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `stock` DECIMAL(12, 2) DEFAULT 0.00,
  `minStockLevel` DECIMAL(12, 2) DEFAULT 5.00,
  `unit` VARCHAR(50) DEFAULT 'units',
  `image_url` TEXT,
  `hasRecipe` TINYINT(1) DEFAULT 0,
  INDEX idx_prod_module (module),
  INDEX idx_prod_cat (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Raw Supplies (Consumables / Ingredients)
CREATE TABLE IF NOT EXISTS `supplies` (
  `id` VARCHAR(255) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `category` VARCHAR(255),
  `module` VARCHAR(100) DEFAULT 'restaurant',
  `quantity` DECIMAL(12, 3) DEFAULT 0.000,
  `unit` VARCHAR(50) DEFAULT 'kg',
  `unitCost` DECIMAL(12, 2) DEFAULT 0.00,
  `lastPurchased` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_supp_module (module)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Production Recipes (Mapping Products to Supplies)
CREATE TABLE IF NOT EXISTS `recipes` (
  `productId` VARCHAR(255) NOT NULL,
  `supplyId` VARCHAR(255) NOT NULL,
  `amount` DECIMAL(12, 3) NOT NULL,
  PRIMARY KEY (`productId`, `supplyId`),
  FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`supplyId`) REFERENCES `supplies`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Operating Expenses
CREATE TABLE IF NOT EXISTS `expenses` (
  `id` VARCHAR(255) PRIMARY KEY,
  `category` ENUM('salary', 'utility', 'maintenance', 'rent', 'garbage', 'miscellaneous') DEFAULT 'miscellaneous',
  `amount` DECIMAL(12, 2) NOT NULL,
  `description` TEXT,
  `date` DATE NOT NULL,
  `module` ENUM('restaurant', 'bar', 'carwash', 'accommodation', 'entertainment', 'general') DEFAULT 'general',
  INDEX idx_exp_date (date),
  INDEX idx_exp_module (module)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. POS Transactions
CREATE TABLE IF NOT EXISTS `transactions` (
  `id` VARCHAR(255) PRIMARY KEY,
  `orderNumber` VARCHAR(255) UNIQUE NOT NULL,
  `module` ENUM('restaurant', 'bar', 'carwash', 'accommodation', 'entertainment', 'general') NOT NULL,
  `totalAmount` DECIMAL(12, 2) NOT NULL,
  `totalCost` DECIMAL(12, 2) NOT NULL,
  `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `paymentMethod` ENUM('cash', 'mpesa', 'card', 'none') DEFAULT 'none',
  `status` ENUM('paid', 'pending') DEFAULT 'pending',
  `customerName` VARCHAR(255) DEFAULT 'Guest',
  `amountReceived` DECIMAL(12, 2) DEFAULT 0.00,
  `balance` DECIMAL(12, 2) DEFAULT 0.00,
  INDEX idx_trans_status (status),
  INDEX idx_trans_time (timestamp),
  INDEX idx_trans_module (module)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Transaction Line Items
CREATE TABLE IF NOT EXISTS `transaction_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `transactionId` VARCHAR(255) NOT NULL,
  `productId` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `quantity` DECIMAL(12, 2) NOT NULL,
  `price` DECIMAL(12, 2) NOT NULL,
  `costPrice` DECIMAL(12, 2) NOT NULL,
  `total` DECIMAL(12, 2) NOT NULL,
  FOREIGN KEY (`transactionId`) REFERENCES `transactions`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed Initial Admin User (Default Password: admin123)
-- In production, replace this with a hashed password if using bcrypt, 
-- or use the current app's literal string logic as per login route.
INSERT INTO `users` (`id`, `name`, `email`, `role`, `password`) 
VALUES ('U-ADMIN', 'System Admin', 'admin@wamaghach.com', 'admin', 'admin123')
ON DUPLICATE KEY UPDATE name=name;

SET FOREIGN_KEY_CHECKS = 1;
