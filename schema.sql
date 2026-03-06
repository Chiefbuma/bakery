-- Production SQL Schema for Wamaghach Kahua-ini Hotel Management System

-- Personnel Directory
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(255) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `role` ENUM('admin', 'staff') DEFAULT 'staff',
  `password` VARCHAR(255) NOT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Master Stock (Retail & Production Products)
CREATE TABLE IF NOT EXISTS `products` (
  `id` VARCHAR(255) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `category` VARCHAR(100),
  `module` ENUM('restaurant', 'bar', 'carwash', 'accommodation', 'entertainment', 'general') DEFAULT 'restaurant',
  `price` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `costPrice` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `stock` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `minStockLevel` DECIMAL(10, 2) DEFAULT 5.00,
  `unit` VARCHAR(50) DEFAULT 'units',
  `image_url` TEXT,
  `hasRecipe` BOOLEAN DEFAULT FALSE,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Raw Supplies Ledger
CREATE TABLE IF NOT EXISTS `supplies` (
  `id` VARCHAR(255) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100),
  `module` VARCHAR(100),
  `quantity` DECIMAL(10, 3) NOT NULL DEFAULT 0.000,
  `unit` VARCHAR(50) NOT NULL,
  `unitCost` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `lastPurchased` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Production Recipes Mapping
CREATE TABLE IF NOT EXISTS `recipes` (
  `productId` VARCHAR(255) NOT NULL,
  `supplyId` VARCHAR(255) NOT NULL,
  `amount` DECIMAL(10, 3) NOT NULL,
  PRIMARY KEY (`productId`, `supplyId`),
  FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`supplyId`) REFERENCES `supplies`(`id`) ON DELETE CASCADE
);

-- Operating Expenses (Overhead Ledger)
CREATE TABLE IF NOT EXISTS `expenses` (
  `id` VARCHAR(255) PRIMARY KEY,
  `category` ENUM('salary', 'utility', 'maintenance', 'rent', 'garbage', 'miscellaneous') DEFAULT 'miscellaneous',
  `amount` DECIMAL(10, 2) NOT NULL,
  `description` TEXT,
  `date` DATE NOT NULL,
  `module` ENUM('restaurant', 'bar', 'carwash', 'accommodation', 'entertainment', 'general') DEFAULT 'general',
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Consolidated Transaction Ledger
CREATE TABLE IF NOT EXISTS `transactions` (
  `id` VARCHAR(255) PRIMARY KEY,
  `orderNumber` VARCHAR(255) NOT NULL UNIQUE,
  `module` ENUM('restaurant', 'bar', 'carwash', 'accommodation', 'entertainment', 'general') NOT NULL,
  `totalAmount` DECIMAL(10, 2) NOT NULL,
  `totalCost` DECIMAL(10, 2) DEFAULT 0.00,
  `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `paymentMethod` ENUM('cash', 'mpesa', 'card', 'none') DEFAULT 'none',
  `status` ENUM('paid', 'pending') DEFAULT 'pending',
  `customerName` VARCHAR(255),
  `amountReceived` DECIMAL(10, 2),
  `balance` DECIMAL(10, 2)
);

-- Transaction Items (Atomic Snapshot)
CREATE TABLE IF NOT EXISTS `transaction_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `transactionId` VARCHAR(255) NOT NULL,
  `productId` VARCHAR(255),
  `name` VARCHAR(255) NOT NULL,
  `quantity` DECIMAL(10, 2) NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `costPrice` DECIMAL(10, 2) NOT NULL,
  `total` DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (`transactionId`) REFERENCES `transactions`(`id`) ON DELETE CASCADE
);

-- Initial Data
INSERT IGNORE INTO `users` (`id`, `name`, `email`, `role`, `password`) VALUES ('admin-1', 'Super Admin', 'admin@wamaghach.com', 'admin', 'admin123');

-- Indexes
CREATE INDEX idx_trans_month ON transactions(timestamp);
CREATE INDEX idx_exp_month ON expenses(date);
CREATE INDEX idx_trans_status ON transactions(status);
