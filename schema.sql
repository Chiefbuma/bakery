
-- Wamaghach Kahua-ini Hotel Management System Schema

-- 1. Users Table
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('admin', 'staff') DEFAULT 'staff',
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Products Table (Master Stock)
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
  `unit` VARCHAR(50) DEFAULT 'units',
  `image_url` TEXT
);

-- 3. Raw Supplies Table
CREATE TABLE IF NOT EXISTS `supplies` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100),
  `module` ENUM('restaurant', 'bar', 'carwash', 'accommodation', 'entertainment', 'general') DEFAULT 'general',
  `quantity` DECIMAL(10, 3) DEFAULT 0,
  `unit` VARCHAR(50) NOT NULL,
  `unitCost` DECIMAL(10, 2) NOT NULL,
  `lastPurchased` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Production Recipes (Linking Products to Supplies)
CREATE TABLE IF NOT EXISTS `recipes` (
  `productId` VARCHAR(50),
  `supplyId` VARCHAR(50),
  `amount` DECIMAL(10, 4) NOT NULL,
  PRIMARY KEY (`productId`, `supplyId`),
  FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`supplyId`) REFERENCES `supplies`(`id`) ON DELETE CASCADE
);

-- 5. Transactions Table
CREATE TABLE IF NOT EXISTS `transactions` (
  `id` VARCHAR(50) PRIMARY KEY,
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

-- 6. Transaction Items
CREATE TABLE IF NOT EXISTS `transaction_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `transactionId` VARCHAR(50),
  `productId` VARCHAR(50),
  `name` VARCHAR(255),
  `quantity` DECIMAL(10, 2),
  `price` DECIMAL(10, 2),
  `costPrice` DECIMAL(10, 2),
  `total` DECIMAL(10, 2),
  FOREIGN KEY (`transactionId`) REFERENCES `transactions`(`id`) ON DELETE CASCADE
);

-- 7. Expenses Table
CREATE TABLE IF NOT EXISTS `expenses` (
  `id` VARCHAR(50) PRIMARY KEY,
  `category` ENUM('salary', 'utility', 'maintenance', 'rent', 'miscellaneous', 'garbage') NOT NULL,
  `amount` DECIMAL(10, 2) NOT NULL,
  `description` TEXT,
  `date` DATE NOT NULL,
  `module` VARCHAR(50) DEFAULT 'general'
);

-- SEED DATA
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`) VALUES 
('U-ADMIN', 'Administrator', 'admin@wamaghach.com', 'admin123', 'admin');

INSERT INTO `products` (`id`, `name`, `description`, `category`, `module`, `price`, `costPrice`, `stock`, `minStockLevel`, `unit`, `image_url`) VALUES
('P-PILAU', 'Swahili Pilau', 'Authentic spiced rice with beef', 'Main Course', 'restaurant', 650.00, 350.00, 40, 5, 'plates', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80'),
('P-TILAPIA', 'Wet Fry Tilapia', 'Fresh lake fish in tomato base', 'Main Course', 'restaurant', 950.00, 500.00, 25, 5, 'fish', 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&q=80');

INSERT INTO `supplies` (`id`, `name`, `category`, `module`, `quantity`, `unit`, `unitCost`) VALUES
('S-OIL', 'Cooking Oil', 'Kitchen', 'restaurant', 50.000, 'liters', 200.00),
('S-CHAR', 'Charcoal', 'Fuel', 'restaurant', 20.000, 'bags', 1500.00),
('S-SALT', 'Salt', 'Spices', 'restaurant', 5.000, 'kg', 50.00);

INSERT INTO `recipes` (`productId`, `supplyId`, `amount`) VALUES
('P-PILAU', 'S-OIL', 0.0500),
('P-TILAPIA', 'S-OIL', 0.1000),
('P-TILAPIA', 'S-CHAR', 0.0200);
