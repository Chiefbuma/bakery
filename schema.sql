
-- WAMAGHACH KAHUA-INI HOTEL MANAGEMENT SYSTEM
-- PRODUCTION DATABASE SCHEMA

-- 1. Users Table (Authentication)
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) UNIQUE NOT NULL,
  `role` ENUM('admin', 'staff') DEFAULT 'staff',
  `password` VARCHAR(255) NOT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_DATE
);

-- 2. Products Table (Master Stock)
CREATE TABLE IF NOT EXISTS `products` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `category` VARCHAR(100),
  `module` ENUM('restaurant', 'bar', 'carwash', 'accommodation', 'entertainment', 'general') DEFAULT 'restaurant',
  `price` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `costPrice` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `stock` DECIMAL(10, 2) DEFAULT 0.00,
  `minStockLevel` DECIMAL(10, 2) DEFAULT 5.00,
  `unit` VARCHAR(20) DEFAULT 'units',
  `image_url` VARCHAR(255)
);

-- 3. Supplies Table (Raw Materials)
CREATE TABLE IF NOT EXISTS `supplies` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100),
  `module` VARCHAR(50),
  `quantity` DECIMAL(10, 3) DEFAULT 0.000,
  `unit` VARCHAR(20) NOT NULL,
  `unitCost` DECIMAL(10, 2) DEFAULT 0.00,
  `lastPurchased` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Production Recipes
CREATE TABLE IF NOT EXISTS `recipes` (
  `productId` VARCHAR(50),
  `supplyId` VARCHAR(50),
  `amount` DECIMAL(10, 4) NOT NULL,
  PRIMARY KEY (`productId`, `supplyId`),
  FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`supplyId`) REFERENCES `supplies`(`id`) ON DELETE CASCADE
);

-- 5. Expenses Table
CREATE TABLE IF NOT EXISTS `expenses` (
  `id` VARCHAR(50) PRIMARY KEY,
  `category` ENUM('salary', 'utility', 'maintenance', 'rent', 'miscellaneous', 'garbage') DEFAULT 'miscellaneous',
  `amount` DECIMAL(10, 2) NOT NULL,
  `description` VARCHAR(255) NOT NULL,
  `date` DATE NOT NULL,
  `module` VARCHAR(50)
);

-- 6. Transactions Table (POS Sales)
CREATE TABLE IF NOT EXISTS `transactions` (
  `id` VARCHAR(50) PRIMARY KEY,
  `orderNumber` VARCHAR(100) UNIQUE NOT NULL,
  `module` VARCHAR(50) NOT NULL,
  `totalAmount` DECIMAL(10, 2) NOT NULL,
  `totalCost` DECIMAL(10, 2) NOT NULL,
  `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `paymentMethod` ENUM('cash', 'mpesa', 'card', 'none') DEFAULT 'cash',
  `status` ENUM('paid', 'pending') DEFAULT 'paid',
  `customerName` VARCHAR(255),
  `amountReceived` DECIMAL(10, 2),
  `balance` DECIMAL(10, 2)
);

-- 7. Transaction Items
CREATE TABLE IF NOT EXISTS `transaction_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `transactionId` VARCHAR(50),
  `productId` VARCHAR(50),
  `name` VARCHAR(255),
  `quantity` INT NOT NULL,
  `price` DECIMAL(10, 2),
  `costPrice` DECIMAL(10, 2),
  `total` DECIMAL(10, 2),
  FOREIGN KEY (`transactionId`) REFERENCES `transactions`(`id`) ON DELETE CASCADE
);

-- INITIAL SEED DATA
INSERT INTO `users` (`id`, `name`, `email`, `role`, `password`) VALUES 
('U-ADMIN', 'Admin User', 'admin@wamaghach.com', 'admin', 'admin123');

INSERT INTO `supplies` (`id`, `name`, `category`, `module`, `quantity`, `unit`, `unitCost`) VALUES
('SUP-OIL', 'Cooking Oil', 'Kitchen', 'restaurant', 50.000, 'liters', 200.00),
('SUP-COAL', 'Charcoal', 'Fuel', 'restaurant', 20.000, 'bags', 1500.00),
('SUP-SALT', 'Salt', 'Kitchen', 'restaurant', 10.000, 'kg', 50.00);

INSERT INTO `products` (`id`, `name`, `description`, `category`, `module`, `price`, `costPrice`, `stock`, `unit`, `image_url`) VALUES
('PROD-PILAU', 'Swahili Pilau', 'Spiced rice with beef', 'Main Course', 'restaurant', 650.00, 300.00, 40, 'plates', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'),
('PROD-TILAPIA', 'Wet Fry Tilapia', 'Fresh lake fish in tomato sauce', 'Seafood', 'restaurant', 950.00, 450.00, 25, 'fish', 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2');

INSERT INTO `recipes` (`productId`, `supplyId`, `amount`) VALUES
('PROD-PILAU', 'SUP-OIL', 0.0500),
('PROD-PILAU', 'SUP-SALT', 0.0020),
('PROD-TILAPIA', 'SUP-OIL', 0.1000);
