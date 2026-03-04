
-- Wamaghach Kahua-ini Hotel | Production Schema
-- Import this into your phpMyAdmin 'gledcapi_hotel' database.

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+03:00";

-- 1. Users & Personnel
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `role` ENUM('admin', 'staff') DEFAULT 'staff',
  `password` VARCHAR(255) NOT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Master Stock (Products)
CREATE TABLE IF NOT EXISTS `products` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `category` VARCHAR(100),
  `module` ENUM('restaurant', 'bar', 'carwash', 'accommodation', 'entertainment') NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `costPrice` DECIMAL(10, 2) DEFAULT 0,
  `stock` DECIMAL(10, 2) DEFAULT 0,
  `minStockLevel` DECIMAL(10, 2) DEFAULT 5,
  `unit` VARCHAR(50) DEFAULT 'units',
  `image_url` TEXT,
  INDEX idx_module (module),
  INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Raw Supplies (Ingredients)
CREATE TABLE IF NOT EXISTS `supplies` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100),
  `module` VARCHAR(100),
  `quantity` DECIMAL(10, 4) DEFAULT 0,
  `unit` VARCHAR(50) NOT NULL,
  `unitCost` DECIMAL(10, 2) DEFAULT 0,
  `lastPurchased` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_supp_module (module)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Production Recipes (Consumption Mapping)
CREATE TABLE IF NOT EXISTS `recipes` (
  `productId` VARCHAR(50) NOT NULL,
  `supplyId` VARCHAR(50) NOT NULL,
  `amount` DECIMAL(10, 4) NOT NULL,
  PRIMARY KEY (`productId`, `supplyId`),
  FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`supplyId`) REFERENCES `supplies`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Operating Expenses
CREATE TABLE IF NOT EXISTS `expenses` (
  `id` VARCHAR(50) PRIMARY KEY,
  `category` ENUM('salary', 'utility', 'maintenance', 'rent', 'miscellaneous', 'garbage') NOT NULL,
  `amount` DECIMAL(10, 2) NOT NULL,
  `description` TEXT,
  `date` DATE NOT NULL,
  `module` VARCHAR(100),
  INDEX idx_date (date),
  INDEX idx_exp_cat (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Sales Transactions
CREATE TABLE IF NOT EXISTS `transactions` (
  `id` VARCHAR(50) PRIMARY KEY,
  `orderNumber` VARCHAR(100) NOT NULL UNIQUE,
  `module` ENUM('restaurant', 'bar', 'carwash', 'accommodation', 'entertainment') NOT NULL,
  `totalAmount` DECIMAL(10, 2) NOT NULL,
  `totalCost` DECIMAL(10, 2) DEFAULT 0,
  `paymentMethod` ENUM('cash', 'mpesa', 'card', 'none') DEFAULT 'cash',
  `status` ENUM('paid', 'pending') DEFAULT 'pending',
  `customerName` VARCHAR(255),
  `amountReceived` DECIMAL(10, 2),
  `balance` DECIMAL(10, 2),
  `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_timestamp (timestamp),
  INDEX idx_trans_module (module),
  INDEX idx_trans_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Transaction Line Items
CREATE TABLE IF NOT EXISTS `transaction_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `transactionId` VARCHAR(50) NOT NULL,
  `productId` VARCHAR(50),
  `name` VARCHAR(255) NOT NULL,
  `quantity` DECIMAL(10, 2) NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `costPrice` DECIMAL(10, 2) DEFAULT 0,
  `total` DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (`transactionId`) REFERENCES `transactions`(`id`) ON DELETE CASCADE,
  INDEX idx_item_prod (productId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Initial Seed Data
INSERT INTO `users` (id, name, email, role, password) VALUES 
('U-1', 'Admin Manager', 'admin@wamaghach.com', 'admin', 'admin123');

INSERT INTO `products` (id, name, description, category, module, price, costPrice, stock, minStockLevel, unit, image_url) VALUES 
('PROD-1', 'Swahili Pilau', 'Spiced rice with tender beef', 'Main Meals', 'restaurant', 450.00, 200.00, 50, 10, 'plates', 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=600'),
('PROD-2', 'Wet Fry Tilapia', 'Fresh lake fish in spicy tomato gravy', 'Fish', 'restaurant', 800.00, 400.00, 20, 5, 'fish', 'https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?q=80&w=600');

INSERT INTO `supplies` (id, name, category, module, quantity, unit, unitCost) VALUES 
('SUP-1', 'Cooking Oil', 'Kitchen', 'restaurant', 50.00, 'liters', 200.00),
('SUP-2', 'Charcoal', 'Fuel', 'restaurant', 10.00, 'bags', 1500.00);

INSERT INTO `recipes` (productId, supplyId, amount) VALUES 
('PROD-1', 'SUP-1', 0.05),
('PROD-2', 'SUP-1', 0.1);
