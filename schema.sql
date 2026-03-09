
-- Wamaghach Kahua-ini Hotel | Full Production Schema

-- 1. Personnel Management
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(255) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `role` ENUM('admin', 'staff') DEFAULT 'staff',
  `password` VARCHAR(255) NOT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Master Product Stock
CREATE TABLE IF NOT EXISTS `products` (
  `id` VARCHAR(255) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `category` VARCHAR(100),
  `module` ENUM('restaurant', 'bar', 'carwash', 'accommodation', 'entertainment', 'general') DEFAULT 'restaurant',
  `price` DECIMAL(10, 2) NOT NULL DEFAULT 0,
  `costPrice` DECIMAL(10, 2) NOT NULL DEFAULT 0, -- Used for Retail items
  `stock` DECIMAL(10, 2) NOT NULL DEFAULT 0,
  `minStockLevel` DECIMAL(10, 2) DEFAULT 5,
  `unit` VARCHAR(50) DEFAULT 'units',
  `image_url` TEXT,
  `hasRecipe` TINYINT(1) DEFAULT 0 -- 1 for Production items, 0 for Retail
);

-- 3. Raw Supplies (Ingredients)
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

-- 4. Production Recipes
CREATE TABLE IF NOT EXISTS `recipes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `productId` VARCHAR(255) NOT NULL,
  `supplyId` VARCHAR(255) NOT NULL,
  `amount` DECIMAL(10, 3) NOT NULL,
  FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`supplyId`) REFERENCES `supplies`(`id`) ON DELETE CASCADE
);

-- 5. Transaction Ledger (Parent)
CREATE TABLE IF NOT EXISTS `transactions` (
  `id` VARCHAR(255) PRIMARY KEY,
  `orderNumber` VARCHAR(100) NOT NULL UNIQUE,
  `module` VARCHAR(50) NOT NULL,
  `totalAmount` DECIMAL(10, 2) NOT NULL,
  `totalCost` DECIMAL(10, 2) NOT NULL DEFAULT 0, -- Captured True COGS
  `paymentMethod` ENUM('cash', 'mpesa', 'card', 'none') DEFAULT 'none',
  `status` ENUM('paid', 'pending') DEFAULT 'pending',
  `customerName` VARCHAR(255),
  `amountReceived` DECIMAL(10, 2) DEFAULT 0,
  `balance` DECIMAL(10, 2) DEFAULT 0,
  `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Transaction Items (Children)
CREATE TABLE IF NOT EXISTS `transaction_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `transactionId` VARCHAR(255) NOT NULL,
  `productId` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `quantity` DECIMAL(10, 2) NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `costPrice` DECIMAL(10, 2) NOT NULL, -- Captured Unit COGS at sale
  `total` DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (`transactionId`) REFERENCES `transactions`(`id`) ON DELETE CASCADE
);

-- 7. Operating Expenses
CREATE TABLE IF NOT EXISTS `expenses` (
  `id` VARCHAR(255) PRIMARY KEY,
  `category` ENUM('salary', 'utility', 'maintenance', 'rent', 'garbage', 'miscellaneous') DEFAULT 'miscellaneous',
  `amount` DECIMAL(10, 2) NOT NULL,
  `description` TEXT,
  `module` ENUM('restaurant', 'bar', 'carwash', 'accommodation', 'entertainment', 'general') DEFAULT 'general',
  `date` DATE NOT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Initial Admin Seed
INSERT INTO `users` (`id`, `name`, `email`, `role`, `password`) 
VALUES ('U-ADMIN', 'Super Admin', 'admin@wamaghach.com', 'admin', 'admin123')
ON DUPLICATE KEY UPDATE id=id;
