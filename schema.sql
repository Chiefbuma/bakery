-- Wamaghach Kahua-ini Hotel | Enterprise Database Schema

-- Users & Authentication (RBAC)
CREATE TABLE `users` (
  `id` VARCHAR(255) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL, -- Bcrypt hashed
  `role` ENUM('admin', 'staff') DEFAULT 'staff',
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Master Product Catalog (Stock Controlled)
CREATE TABLE `products` (
  `id` VARCHAR(255) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `category` VARCHAR(100),
  `module` ENUM('restaurant', 'bar', 'carwash', 'accommodation', 'entertainment') NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL DEFAULT 0,
  `costPrice` DECIMAL(10, 2) NOT NULL DEFAULT 0, -- Manual cost for retail items
  `stock` DECIMAL(10, 2) NOT NULL DEFAULT 0,
  `minStockLevel` DECIMAL(10, 2) NOT NULL DEFAULT 5,
  `unit` VARCHAR(20) DEFAULT 'pcs',
  `image_url` TEXT,
  `hasRecipe` TINYINT(1) DEFAULT 0 -- 1 if COGS calculated via recipes
);

-- Raw Material Supplies
CREATE TABLE `supplies` (
  `id` VARCHAR(255) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100),
  `module` ENUM('restaurant', 'bar', 'carwash', 'accommodation', 'entertainment', 'general') DEFAULT 'restaurant',
  `quantity` DECIMAL(10, 2) NOT NULL DEFAULT 0,
  `unit` VARCHAR(20) NOT NULL,
  `unitCost` DECIMAL(10, 2) NOT NULL DEFAULT 0,
  `lastPurchased` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Production Recipes (Bill of Materials)
CREATE TABLE `recipes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `productId` VARCHAR(255) NOT NULL,
  `supplyId` VARCHAR(255) NOT NULL,
  `amount` DECIMAL(10, 4) NOT NULL,
  FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`supplyId`) REFERENCES `supplies`(`id`) ON DELETE CASCADE
);

-- Operating Expenses (OpEx Ledger)
CREATE TABLE `expenses` (
  `id` VARCHAR(255) PRIMARY KEY,
  `category` ENUM('salary', 'utility', 'maintenance', 'rent', 'garbage', 'miscellaneous') DEFAULT 'miscellaneous',
  `amount` DECIMAL(10, 2) NOT NULL DEFAULT 0,
  `description` VARCHAR(255) NOT NULL,
  `date` DATE NOT NULL,
  `module` ENUM('restaurant', 'bar', 'carwash', 'accommodation', 'entertainment', 'general') DEFAULT 'general',
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions (Financial Audit Log)
CREATE TABLE `transactions` (
  `id` VARCHAR(255) PRIMARY KEY,
  `orderNumber` VARCHAR(100) NOT NULL UNIQUE,
  `module` ENUM('restaurant', 'bar', 'carwash', 'accommodation', 'entertainment') NOT NULL,
  `totalAmount` DECIMAL(10, 2) NOT NULL DEFAULT 0,
  `totalCost` DECIMAL(10, 2) NOT NULL DEFAULT 0, -- Snapshot of COGS at time of sale
  `paymentMethod` ENUM('cash', 'mpesa', 'card', 'none') DEFAULT 'none',
  `status` ENUM('paid', 'pending') DEFAULT 'pending',
  `customerName` VARCHAR(255) DEFAULT 'Guest',
  `amountReceived` DECIMAL(10, 2) DEFAULT 0,
  `balance` DECIMAL(10, 2) DEFAULT 0,
  `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transaction Line Items
CREATE TABLE `transaction_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `transactionId` VARCHAR(255) NOT NULL,
  `productId` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `quantity` DECIMAL(10, 2) NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `costPrice` DECIMAL(10, 2) NOT NULL, -- Per-unit COGS snapshot
  `total` DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (`transactionId`) REFERENCES `transactions`(`id`) ON DELETE CASCADE
);

-- Performance Indexes
CREATE INDEX idx_trans_timestamp ON transactions(timestamp);
CREATE INDEX idx_trans_status ON transactions(status);
CREATE INDEX idx_exp_date ON expenses(date);
CREATE INDEX idx_prod_module ON products(module);
