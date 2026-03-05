
-- Wamaghach Kahua-ini Hotel Management System | Production Schema
-- Optimized for MySQL 8.0+

-- 1. User Management
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) UNIQUE NOT NULL,
  `role` ENUM('admin', 'staff') DEFAULT 'staff',
  `password` VARCHAR(255) NOT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Initial Admin (Access Key: admin123)
INSERT INTO `users` (`id`, `name`, `email`, `role`, `password`) 
VALUES ('U-1', 'Super Admin', 'admin@wamaghach.com', 'admin', 'admin123')
ON DUPLICATE KEY UPDATE id=id;

-- 2. Master Stock (Sellable Products)
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
  `unit` VARCHAR(20) DEFAULT 'units',
  `image_url` TEXT,
  INDEX idx_prod_module (module)
);

-- 3. Raw Supplies (Inventory for Production)
CREATE TABLE IF NOT EXISTS `supplies` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100),
  `module` VARCHAR(100),
  `quantity` DECIMAL(10, 4) DEFAULT 0,
  `unit` VARCHAR(20) NOT NULL,
  `unitCost` DECIMAL(10, 2) DEFAULT 0,
  `lastPurchased` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Production Recipes (Consumption Logic)
CREATE TABLE IF NOT EXISTS `recipes` (
  `productId` VARCHAR(50) NOT NULL,
  `supplyId` VARCHAR(50) NOT NULL,
  `amount` DECIMAL(10, 4) NOT NULL,
  PRIMARY KEY (`productId`, `supplyId`),
  FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`supplyId`) REFERENCES `supplies`(`id`) ON DELETE CASCADE
);

-- 5. Transactions (Sales)
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
  `balance` DECIMAL(10, 2),
  INDEX idx_trans_time (timestamp),
  INDEX idx_trans_module (module),
  INDEX idx_trans_status (status)
);

-- Transaction Items (Detail)
CREATE TABLE IF NOT EXISTS `transaction_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `transactionId` VARCHAR(50) NOT NULL,
  `productId` VARCHAR(50) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `quantity` DECIMAL(10, 2) NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `costPrice` DECIMAL(10, 2) NOT NULL,
  `total` DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (`transactionId`) REFERENCES `transactions`(`id`) ON DELETE CASCADE
);

-- 6. Operating Expenses
CREATE TABLE IF NOT EXISTS `expenses` (
  `id` VARCHAR(50) PRIMARY KEY,
  `category` VARCHAR(100) NOT NULL,
  `amount` DECIMAL(10, 2) NOT NULL,
  `description` TEXT,
  `date` DATE NOT NULL,
  `module` VARCHAR(100),
  INDEX idx_exp_date (date)
);

-- SEED DATA: RESTAURANT
INSERT INTO `products` (`id`, `name`, `category`, `module`, `price`, `costPrice`, `stock`, `unit`, `image_url`) VALUES
('P-PILAU', 'Swahili Beef Pilau', 'Main Dish', 'restaurant', 450.00, 220.00, 50, 'plates', 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&q=80&w=1080'),
('P-FISH', 'Whole Tilapia (Grilled)', 'Main Dish', 'restaurant', 850.00, 400.00, 20, 'units', 'https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?auto=format&fit=crop&q=80&w=1080');

-- SEED DATA: BAR
INSERT INTO `products` (`id`, `name`, `category`, `module`, `price`, `costPrice`, `stock`, `unit`, `image_url`) VALUES
('P-BEER', 'Tusker Lager 500ml', 'Beer', 'bar', 300.00, 180.00, 120, 'bottles', 'https://images.unsplash.com/photo-1550317138-10000687ad32?auto=format&fit=crop&q=80&w=1080');

-- SEED DATA: CAR WASH
INSERT INTO `products` (`id`, `name`, `category`, `module`, `price`, `costPrice`, `stock`, `unit`, `image_url`) VALUES
('P-CW-STD', 'Body Wash & Vacuum', 'Service', 'carwash', 500.00, 100.00, 9999, 'service', 'https://images.unsplash.com/photo-1605610816700-162d1c1cfdf1?auto=format&fit=crop&q=80&w=1080');
