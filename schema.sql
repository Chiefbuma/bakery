
-- Wamaghach Kahua-ini Hotel | Production Schema
-- Optimized with SQL Indexing for High-Performance Analytics

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Personnel & Access
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(255) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `role` ENUM('admin', 'staff') DEFAULT 'staff',
  `password` VARCHAR(255) NOT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Master Stock (Sellable Items)
CREATE TABLE IF NOT EXISTS `products` (
  `id` VARCHAR(255) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `category` VARCHAR(100),
  `module` ENUM('restaurant', 'bar', 'carwash', 'accommodation', 'entertainment') NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `costPrice` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `stock` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `minStockLevel` DECIMAL(10, 2) NOT NULL DEFAULT 5.00,
  `unit` VARCHAR(20) DEFAULT 'units',
  `image_url` VARCHAR(500)
);

-- 3. Raw Supplies (Ingredients/Consumables)
CREATE TABLE IF NOT EXISTS `supplies` (
  `id` VARCHAR(255) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100),
  `module` VARCHAR(100),
  `quantity` DECIMAL(10, 4) NOT NULL DEFAULT 0.0000,
  `unit` VARCHAR(20) NOT NULL DEFAULT 'units',
  `unitCost` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `lastPurchased` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Production Recipes (Mapping)
CREATE TABLE IF NOT EXISTS `recipes` (
  `productId` VARCHAR(255) NOT NULL,
  `supplyId` VARCHAR(255) NOT NULL,
  `amount` DECIMAL(10, 4) NOT NULL,
  PRIMARY KEY (`productId`, `supplyId`),
  FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`supplyId`) REFERENCES `supplies`(`id`) ON DELETE CASCADE
);

-- 5. Sales Transactions
CREATE TABLE IF NOT EXISTS `transactions` (
  `id` VARCHAR(255) PRIMARY KEY,
  `orderNumber` VARCHAR(100) NOT NULL UNIQUE,
  `module` VARCHAR(50) NOT NULL,
  `totalAmount` DECIMAL(10, 2) NOT NULL,
  `totalCost` DECIMAL(10, 2) NOT NULL,
  `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `paymentMethod` ENUM('cash', 'mpesa', 'card', 'none') DEFAULT 'none',
  `status` ENUM('paid', 'pending') DEFAULT 'pending',
  `customerName` VARCHAR(255),
  `amountReceived` DECIMAL(10, 2),
  `balance` DECIMAL(10, 2)
);

CREATE TABLE IF NOT EXISTS `transaction_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `transactionId` VARCHAR(255) NOT NULL,
  `productId` VARCHAR(255),
  `name` VARCHAR(255) NOT NULL,
  `quantity` INT NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `costPrice` DECIMAL(10, 2) NOT NULL,
  `total` DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (`transactionId`) REFERENCES `transactions`(`id`) ON DELETE CASCADE
);

-- 6. Operating Expenses
CREATE TABLE IF NOT EXISTS `expenses` (
  `id` VARCHAR(255) PRIMARY KEY,
  `category` ENUM('salary', 'utility', 'maintenance', 'rent', 'garbage', 'miscellaneous') DEFAULT 'miscellaneous',
  `amount` DECIMAL(10, 2) NOT NULL,
  `description` VARCHAR(255),
  `date` DATE NOT NULL,
  `module` VARCHAR(50) DEFAULT 'general'
);

-- Performance Indexes
CREATE INDEX idx_transactions_timestamp ON transactions(timestamp);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_expenses_date ON expenses(date);
CREATE INDEX idx_products_module ON products(module);

-- Initial Seed Data
INSERT INTO `users` (`id`, `name`, `email`, `role`, `password`) VALUES 
('u1', 'Admin User', 'admin@wamaghach.com', 'admin', 'admin123');

INSERT INTO `products` (`id`, `name`, `description`, `category`, `module`, `price`, `costPrice`, `stock`, `unit`, `image_url`) VALUES
('p1', 'Swahili Pilau', 'Spiced rice with beef', 'Main Course', 'restaurant', 450.00, 200.00, 50, 'plates', 'https://images.unsplash.com/photo-1512058560366-cd2427ff5e70?auto=format&fit=crop&q=80&w=600'),
('p2', 'Wet Fry Tilapia', 'Fresh lake fish with traditional greens', 'Fish', 'restaurant', 800.00, 350.00, 20, 'units', 'https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?auto=format&fit=crop&q=80&w=600'),
('p3', 'Whitecap Crisp 500ml', 'Chilled premium lager', 'Beers', 'bar', 350.00, 220.00, 120, 'bottles', 'https://images.unsplash.com/photo-1618885472179-5e474019f2a9?auto=format&fit=crop&q=80&w=600');

INSERT INTO `supplies` (`id`, `name`, `category`, `module`, `quantity`, `unit`, `unitCost`) VALUES
('s1', 'Rice', 'Grain', 'restaurant', 50.00, 'kg', 180.00),
('s2', 'Cooking Oil', 'Oil', 'restaurant', 20.00, 'liters', 250.00),
('s3', 'Beef', 'Meat', 'restaurant', 15.00, 'kg', 600.00);

SET FOREIGN_KEY_CHECKS = 1;
