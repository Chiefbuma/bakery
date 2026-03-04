
-- Wamaghach Kahua-ini Hotel Management System - Production Schema

-- Users Table (Staff & Admins)
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(255) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `role` ENUM('admin', 'staff') DEFAULT 'staff',
  `password` VARCHAR(255) NOT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Master Stock Table (Sellable Products)
CREATE TABLE IF NOT EXISTS `products` (
  `id` VARCHAR(255) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `category` VARCHAR(100) NOT NULL,
  `module` ENUM('restaurant', 'bar', 'carwash', 'accommodation', 'entertainment') NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `costPrice` DECIMAL(10, 2) NOT NULL,
  `stock` INT DEFAULT 0,
  `minStockLevel` INT DEFAULT 5,
  `unit` VARCHAR(50) DEFAULT 'units',
  `image_url` TEXT
);

-- Raw Supplies Table (Ingredients/Consumables)
CREATE TABLE IF NOT EXISTS `supplies` (
  `id` VARCHAR(255) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100),
  `module` VARCHAR(100),
  `quantity` DECIMAL(10, 3) DEFAULT 0,
  `unit` VARCHAR(50) NOT NULL,
  `unitCost` DECIMAL(10, 2) NOT NULL,
  `lastPurchased` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Production Recipes (Links Products to Supplies)
CREATE TABLE IF NOT EXISTS `recipes` (
  `productId` VARCHAR(255) NOT NULL,
  `supplyId` VARCHAR(255) NOT NULL,
  `amount` DECIMAL(10, 4) NOT NULL,
  PRIMARY KEY (`productId`, `supplyId`),
  FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`supplyId`) REFERENCES `supplies`(`id`) ON DELETE CASCADE
);

-- Operating Expenses Table
CREATE TABLE IF NOT EXISTS `expenses` (
  `id` VARCHAR(255) PRIMARY KEY,
  `category` ENUM('salary', 'utility', 'maintenance', 'rent', 'garbage', 'miscellaneous') NOT NULL,
  `amount` DECIMAL(10, 2) NOT NULL,
  `description` TEXT,
  `date` DATE NOT NULL,
  `module` VARCHAR(100) DEFAULT 'general'
);

-- Sales Transactions Table
CREATE TABLE IF NOT EXISTS `transactions` (
  `id` VARCHAR(255) PRIMARY KEY,
  `orderNumber` VARCHAR(255) NOT NULL UNIQUE,
  `module` VARCHAR(100) NOT NULL,
  `totalAmount` DECIMAL(10, 2) NOT NULL,
  `totalCost` DECIMAL(10, 2) NOT NULL,
  `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `paymentMethod` ENUM('cash', 'mpesa', 'card', 'none') DEFAULT 'cash',
  `status` ENUM('paid', 'pending') DEFAULT 'paid',
  `customerName` VARCHAR(255),
  `amountReceived` DECIMAL(10, 2),
  `balance` DECIMAL(10, 2)
);

-- Transaction Items Table
CREATE TABLE IF NOT EXISTS `transaction_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `transactionId` VARCHAR(255) NOT NULL,
  `productId` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `quantity` INT NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `costPrice` DECIMAL(10, 2) NOT NULL,
  `total` DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (`transactionId`) REFERENCES `transactions`(`id`) ON DELETE CASCADE
);

-- SEED DATA
INSERT INTO `users` (`id`, `name`, `email`, `role`, `password`) VALUES 
('U-ADMIN', 'Administrator', 'admin@wamaghach.com', 'admin', 'pk_live_8d9017d3458e0213efd55c219527b9171482e87d');

INSERT INTO `products` (`id`, `name`, `description`, `category`, `module`, `price`, `costPrice`, `stock`, `image_url`) VALUES 
('P-PILAU', 'Swahili Pilau', 'Traditional aromatic rice with beef', 'Main Course', 'restaurant', 650.00, 320.00, 40, 'https://images.unsplash.com/photo-1512058560366-cd2427ffbb62?w=800'),
('P-TILAPIA', 'Wet Fry Tilapia', 'Fresh lake tilapia served with greens', 'Main Course', 'restaurant', 950.00, 450.00, 25, 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800');

INSERT INTO `supplies` (`id`, `name`, `category`, `module`, `quantity`, `unit`, `unitCost`) VALUES 
('S-OIL', 'Cooking Oil', 'Kitchen', 'restaurant', 50.00, 'liters', 200.00),
('S-SALT', 'Table Salt', 'Kitchen', 'restaurant', 10.00, 'kg', 50.00),
('S-CHARCOAL', 'Charcoal', 'Fuel', 'restaurant', 20.00, 'bags', 1500.00);

INSERT INTO `recipes` (`productId`, `supplyId`, `amount`) VALUES 
('P-PILAU', 'S-OIL', 0.05),
('P-PILAU', 'S-SALT', 0.002);
