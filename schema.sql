
-- Wamaghach Kahua-ini Hotel | Production Schema

-- 1. Personnel Management
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(255) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `role` ENUM('admin', 'staff') DEFAULT 'staff',
  `password` VARCHAR(255) NOT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Master Inventory (Sellable Items)
CREATE TABLE IF NOT EXISTS `products` (
  `id` VARCHAR(255) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `category` VARCHAR(100),
  `module` ENUM('restaurant', 'bar', 'carwash', 'accommodation', 'entertainment', 'general') DEFAULT 'restaurant',
  `price` DECIMAL(10, 2) NOT NULL DEFAULT 0,
  `costPrice` DECIMAL(10, 2) NOT NULL DEFAULT 0, -- Fixed cost for retail items
  `stock` DECIMAL(10, 2) NOT NULL DEFAULT 0,
  `minStockLevel` DECIMAL(10, 2) NOT NULL DEFAULT 5,
  `unit` VARCHAR(50) DEFAULT 'units',
  `image_url` TEXT,
  `hasRecipe` BOOLEAN DEFAULT FALSE -- TRUE = Production, FALSE = Retail
);

-- 3. Raw Materials (Supplies Ledger)
CREATE TABLE IF NOT EXISTS `supplies` (
  `id` VARCHAR(255) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100),
  `module` VARCHAR(100),
  `quantity` DECIMAL(10, 3) NOT NULL DEFAULT 0,
  `unit` VARCHAR(50) NOT NULL,
  `unitCost` DECIMAL(10, 2) NOT NULL DEFAULT 0,
  `lastPurchased` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Production Recipes (BOM)
CREATE TABLE IF NOT EXISTS `recipes` (
  `productId` VARCHAR(255) NOT NULL,
  `supplyId` VARCHAR(255) NOT NULL,
  `amount` DECIMAL(10, 3) NOT NULL,
  PRIMARY KEY (`productId`, `supplyId`),
  FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`supplyId`) REFERENCES `supplies`(`id`) ON DELETE CASCADE
);

-- 5. Operational Ledger (Expenses)
CREATE TABLE IF NOT EXISTS `expenses` (
  `id` VARCHAR(255) PRIMARY KEY,
  `category` ENUM('salary', 'utility', 'maintenance', 'rent', 'garbage', 'miscellaneous') DEFAULT 'miscellaneous',
  `amount` DECIMAL(10, 2) NOT NULL,
  `description` TEXT NOT NULL,
  `date` DATE NOT NULL,
  `module` ENUM('restaurant', 'bar', 'carwash', 'accommodation', 'entertainment', 'general', 'administrative') DEFAULT 'general'
);

-- 6. POS Transaction Ledger
CREATE TABLE IF NOT EXISTS `transactions` (
  `id` VARCHAR(255) PRIMARY KEY,
  `orderNumber` VARCHAR(100) NOT NULL UNIQUE,
  `module` VARCHAR(100) NOT NULL,
  `totalAmount` DECIMAL(10, 2) NOT NULL,
  `totalCost` DECIMAL(10, 2) NOT NULL DEFAULT 0, -- Atomic capture of COGS at sale time
  `paymentMethod` ENUM('cash', 'mpesa', 'card', 'none') DEFAULT 'none',
  `status` ENUM('paid', 'pending') DEFAULT 'pending',
  `customerName` VARCHAR(255),
  `amountReceived` DECIMAL(10, 2),
  `balance` DECIMAL(10, 2),
  `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `transaction_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `transactionId` VARCHAR(255) NOT NULL,
  `productId` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `quantity` INT NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `costPrice` DECIMAL(10, 2) NOT NULL, -- Per-unit cost snapshot
  `total` DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (`transactionId`) REFERENCES `transactions`(`id`) ON DELETE CASCADE
);

-- Indexes for Dashboard Performance
CREATE INDEX idx_trans_date ON transactions(timestamp);
CREATE INDEX idx_trans_module ON transactions(module);
CREATE INDEX idx_exp_date ON expenses(date);

-- Initial Admin (Access Key: admin123)
INSERT INTO `users` (id, name, email, role, password) 
VALUES ('U-ADMIN', 'System Admin', 'admin@wamaghach.com', 'admin', 'admin123')
ON DUPLICATE KEY UPDATE name=name;
