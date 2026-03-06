-- Core Hotel Tables
CREATE TABLE `users` (
  `id` VARCHAR(255) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `role` ENUM('admin', 'staff') NOT NULL DEFAULT 'staff',
  `password` VARCHAR(255) NOT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE `products` (
  `id` VARCHAR(255) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `category` VARCHAR(100),
  `module` ENUM('restaurant', 'bar', 'carwash', 'accommodation', 'entertainment', 'general') DEFAULT 'restaurant',
  `price` DECIMAL(10, 2) NOT NULL,
  `costPrice` DECIMAL(10, 2) DEFAULT 0,
  `stock` DECIMAL(10, 2) DEFAULT 0,
  `minStockLevel` DECIMAL(10, 2) DEFAULT 0,
  `unit` VARCHAR(50) DEFAULT 'units',
  `image_url` TEXT,
  `hasRecipe` TINYINT(1) DEFAULT 0
);

CREATE TABLE `supplies` (
  `id` VARCHAR(255) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100),
  `module` ENUM('restaurant', 'bar', 'carwash', 'accommodation', 'entertainment', 'general') DEFAULT 'restaurant',
  `quantity` DECIMAL(10, 3) DEFAULT 0,
  `unit` VARCHAR(50) NOT NULL,
  `unitCost` DECIMAL(10, 2) NOT NULL,
  `lastPurchased` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE `recipes` (
  `productId` VARCHAR(255),
  `supplyId` VARCHAR(255),
  `amount` DECIMAL(10, 3) NOT NULL,
  PRIMARY KEY (`productId`, `supplyId`),
  FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`supplyId`) REFERENCES `supplies`(`id`) ON DELETE CASCADE
);

CREATE TABLE `expenses` (
  `id` VARCHAR(255) PRIMARY KEY,
  `category` ENUM('salary', 'utility', 'maintenance', 'rent', 'miscellaneous', 'garbage') NOT NULL,
  `amount` DECIMAL(10, 2) NOT NULL,
  `description` TEXT,
  `date` DATE NOT NULL,
  `module` ENUM('restaurant', 'bar', 'carwash', 'accommodation', 'entertainment', 'general') DEFAULT 'general'
);

CREATE TABLE `transactions` (
  `id` VARCHAR(255) PRIMARY KEY,
  `orderNumber` VARCHAR(255) NOT NULL UNIQUE,
  `module` ENUM('restaurant', 'bar', 'carwash', 'accommodation', 'entertainment', 'general') DEFAULT 'restaurant',
  `totalAmount` DECIMAL(10, 2) NOT NULL,
  `totalCost` DECIMAL(10, 2) DEFAULT 0,
  `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `paymentMethod` ENUM('cash', 'mpesa', 'card', 'none') DEFAULT 'cash',
  `status` ENUM('paid', 'pending') DEFAULT 'paid',
  `customerName` VARCHAR(255),
  `amountReceived` DECIMAL(10, 2),
  `balance` DECIMAL(10, 2)
);

CREATE TABLE `transaction_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `transactionId` VARCHAR(255),
  `productId` VARCHAR(255),
  `name` VARCHAR(255),
  `quantity` DECIMAL(10, 2),
  `price` DECIMAL(10, 2),
  `costPrice` DECIMAL(10, 2),
  `total` DECIMAL(10, 2),
  FOREIGN KEY (`transactionId`) REFERENCES `transactions`(`id`) ON DELETE CASCADE
);

-- Seed Initial Data
INSERT INTO `users` (`id`, `name`, `email`, `role`, `password`) 
VALUES ('U-ADMIN', 'Administrator', 'admin@wamaghach.com', 'admin', 'admin123');
