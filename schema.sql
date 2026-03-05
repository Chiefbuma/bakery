-- DEFINITIVE WAMAGHACH HOTEL SCHEMA --
-- Optimized for production with proper indexing and data relationships --

-- 1. Personnel Table
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('admin', 'staff') DEFAULT 'staff',
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_email (email)
);

-- 2. Master Stock Table
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

-- 3. Raw Supplies Table
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

-- 4. Recipe/Consumption Map
CREATE TABLE IF NOT EXISTS `recipes` (
  `productId` VARCHAR(50) NOT NULL,
  `supplyId` VARCHAR(50) NOT NULL,
  `amount` DECIMAL(10, 4) NOT NULL,
  PRIMARY KEY (`productId`, `supplyId`),
  FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`supplyId`) REFERENCES `supplies`(`id`) ON DELETE CASCADE
);

-- 5. Sales Transactions
CREATE TABLE IF NOT EXISTS `transactions` (
  `id` VARCHAR(50) PRIMARY KEY,
  `orderNumber` VARCHAR(100) NOT NULL UNIQUE,
  `module` VARCHAR(50) NOT NULL,
  `totalAmount` DECIMAL(10, 2) NOT NULL,
  `totalCost` DECIMAL(10, 2) NOT NULL,
  `paymentMethod` VARCHAR(50),
  `status` ENUM('paid', 'pending') DEFAULT 'paid',
  `customerName` VARCHAR(255),
  `amountReceived` DECIMAL(10, 2),
  `balance` DECIMAL(10, 2),
  `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_tx_timestamp (timestamp),
  INDEX idx_tx_status (status)
);

-- 6. Transaction Line Items
CREATE TABLE IF NOT EXISTS `transaction_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `transactionId` VARCHAR(50) NOT NULL,
  `productId` VARCHAR(50),
  `name` VARCHAR(255) NOT NULL,
  `quantity` DECIMAL(10, 2) NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `costPrice` DECIMAL(10, 2) NOT NULL,
  `total` DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (`transactionId`) REFERENCES `transactions`(`id`) ON DELETE CASCADE
);

-- 7. Operational Expenses
CREATE TABLE IF NOT EXISTS `expenses` (
  `id` VARCHAR(50) PRIMARY KEY,
  `category` ENUM('salary', 'utility', 'maintenance', 'rent', 'garbage', 'miscellaneous') NOT NULL,
  `amount` DECIMAL(10, 2) NOT NULL,
  `description` TEXT NOT NULL,
  `date` DATE NOT NULL,
  `module` VARCHAR(50) DEFAULT 'general',
  INDEX idx_exp_date (date)
);

-- INITIAL DATA SEEDING --
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`) VALUES 
('U-001', 'Admin User', 'admin@wamaghach.com', 'admin123', 'admin')
ON DUPLICATE KEY UPDATE name=name;

INSERT INTO `products` (`id`, `name`, `description`, `category`, `module`, `price`, `costPrice`, `stock`, `unit`, `image_url`) VALUES
('REST-01', 'Beef Pilau', 'Authentic Swahili pilau with beef.', 'Main Dishes', 'restaurant', 450.00, 250.00, 50, 'plates', 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&q=80&w=1080'),
('REST-02', 'Grilled Tilapia', 'Fresh lake fish grilled with traditional spices.', 'Main Dishes', 'restaurant', 800.00, 400.00, 20, 'pcs', 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=1080'),
('BAR-01', 'Premium Lager', 'Chilled local beverage.', 'Beers', 'bar', 300.00, 180.00, 100, 'bottles', 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=1080'),
('ROOM-01', 'Executive Suite', 'Luxurious room with panoramic views.', 'Lodging', 'accommodation', 5500.00, 1500.00, 5, 'rooms', 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=1080')
ON DUPLICATE KEY UPDATE name=name;
