
-- Wamaghach Kahua-ini Hotel Management System Schema

CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(255) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) UNIQUE NOT NULL,
  `role` ENUM('admin', 'staff') NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `products` (
  `id` VARCHAR(255) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `category` VARCHAR(255),
  `module` ENUM('restaurant', 'bar', 'carwash', 'accommodation', 'entertainment', 'general') NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `costPrice` DECIMAL(10, 2) NOT NULL,
  `stock` DECIMAL(10, 2) DEFAULT 0,
  `minStockLevel` DECIMAL(10, 2) DEFAULT 5,
  `unit` VARCHAR(50) DEFAULT 'units',
  `image_url` TEXT
);

CREATE TABLE IF NOT EXISTS `supplies` (
  `id` VARCHAR(255) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `category` VARCHAR(255),
  `module` ENUM('restaurant', 'bar', 'carwash', 'accommodation', 'entertainment', 'general') NOT NULL,
  `quantity` DECIMAL(10, 3) NOT NULL,
  `unit` VARCHAR(50) NOT NULL,
  `unitCost` DECIMAL(10, 2) NOT NULL,
  `lastPurchased` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `recipes` (
  `productId` VARCHAR(255),
  `supplyId` VARCHAR(255),
  `amount` DECIMAL(10, 4) NOT NULL,
  PRIMARY KEY (`productId`, `supplyId`),
  FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`supplyId`) REFERENCES `supplies`(`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `expenses` (
  `id` VARCHAR(255) PRIMARY KEY,
  `category` ENUM('salary', 'utility', 'maintenance', 'rent', 'miscellaneous', 'garbage') NOT NULL,
  `amount` DECIMAL(10, 2) NOT NULL,
  `description` TEXT,
  `date` DATE NOT NULL,
  `module` ENUM('restaurant', 'bar', 'carwash', 'accommodation', 'entertainment', 'general') NOT NULL
);

CREATE TABLE IF NOT EXISTS `transactions` (
  `id` VARCHAR(255) PRIMARY KEY,
  `orderNumber` VARCHAR(255) UNIQUE NOT NULL,
  `module` VARCHAR(50) NOT NULL,
  `totalAmount` DECIMAL(10, 2) NOT NULL,
  `totalCost` DECIMAL(10, 2) NOT NULL,
  `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `paymentMethod` ENUM('cash', 'mpesa', 'card', 'none') NOT NULL,
  `status` ENUM('paid', 'pending') NOT NULL,
  `customerName` VARCHAR(255),
  `amountReceived` DECIMAL(10, 2),
  `balance` DECIMAL(10, 2)
);

CREATE TABLE IF NOT EXISTS `transaction_items` (
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
INSERT INTO `users` (`id`, `name`, `email`, `role`, `password`) VALUES 
('U-1', 'Admin', 'admin@wamaghach.com', 'admin', 'admin123'),
('U-2', 'Staff Member', 'staff@wamaghach.com', 'staff', 'staff123');

INSERT INTO `products` (`id`, `name`, `description`, `category`, `module`, `price`, `costPrice`, `stock`, `minStockLevel`, `unit`, `image_url`) VALUES 
('P-1', 'Swahili Pilau', 'Traditional beef pilau with kachumbari', 'Main Meals', 'restaurant', 650.00, 320.00, 40, 5, 'plates', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'),
('P-2', 'Wet Fry Tilapia', 'Fresh lake tilapia served with ugali', 'Fish', 'restaurant', 950.00, 450.00, 25, 5, 'fish', 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2'),
('P-3', 'Nyama Choma (1kg)', 'Grilled goat meat', 'Grills', 'restaurant', 1200.00, 600.00, 15, 2, 'kg', 'https://images.unsplash.com/photo-1544025162-d76694265947');

INSERT INTO `supplies` (`id`, `name`, `category`, `module`, `quantity`, `unit`, `unitCost`) VALUES 
('S-1', 'Salt', 'Ingredients', 'restaurant', 5.000, 'kg', 50.00),
('S-2', 'Cooking Oil', 'Ingredients', 'restaurant', 20.000, 'liters', 200.00),
('S-3', 'Charcoal', 'Fuel', 'restaurant', 10.000, 'bags', 1500.00);

INSERT INTO `recipes` (`productId`, `supplyId`, `amount`) VALUES 
('P-1', 'S-1', 0.005), -- 5g salt per pilau
('P-1', 'S-2', 0.050), -- 50ml oil per pilau
('P-3', 'S-3', 0.100); -- 0.1 bag charcoal per kg meat
