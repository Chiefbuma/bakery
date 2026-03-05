-- DEFINITIVE HOTEL MANAGEMENT SCHEMA FOR PRODUCTION (gledcapi_hotel)

CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) UNIQUE NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('admin', 'staff') DEFAULT 'staff',
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `products` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `category` VARCHAR(100),
  `module` ENUM('restaurant', 'bar', 'carwash', 'accommodation', 'entertainment') NOT NULL,
  `price` DECIMAL(12, 2) NOT NULL,
  `costPrice` DECIMAL(12, 2) DEFAULT 0,
  `stock` DECIMAL(12, 2) DEFAULT 0,
  `minStockLevel` DECIMAL(12, 2) DEFAULT 5,
  `unit` VARCHAR(20) DEFAULT 'units',
  `image_url` TEXT,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `supplies` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100),
  `module` VARCHAR(100),
  `quantity` DECIMAL(12, 2) DEFAULT 0,
  `unit` VARCHAR(20) NOT NULL,
  `unitCost` DECIMAL(12, 2) DEFAULT 0,
  `lastPurchased` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `recipes` (
  `productId` VARCHAR(50) NOT NULL,
  `supplyId` VARCHAR(50) NOT NULL,
  `amount` DECIMAL(12, 4) NOT NULL,
  PRIMARY KEY (`productId`, `supplyId`),
  FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`supplyId`) REFERENCES `supplies`(`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `expenses` (
  `id` VARCHAR(50) PRIMARY KEY,
  `category` ENUM('salary', 'utility', 'maintenance', 'rent', 'miscellaneous', 'garbage') NOT NULL,
  `amount` DECIMAL(12, 2) NOT NULL,
  `description` TEXT,
  `date` DATE NOT NULL,
  `module` VARCHAR(50) DEFAULT 'general',
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `transactions` (
  `id` VARCHAR(50) PRIMARY KEY,
  `orderNumber` VARCHAR(100) UNIQUE NOT NULL,
  `module` VARCHAR(50) NOT NULL,
  `totalAmount` DECIMAL(12, 2) NOT NULL,
  `totalCost` DECIMAL(12, 2) DEFAULT 0,
  `paymentMethod` ENUM('cash', 'mpesa', 'card', 'none') DEFAULT 'none',
  `status` ENUM('paid', 'pending') DEFAULT 'pending',
  `customerName` VARCHAR(255),
  `amountReceived` DECIMAL(12, 2) DEFAULT 0,
  `balance` DECIMAL(12, 2) DEFAULT 0,
  `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `transaction_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `transactionId` VARCHAR(50) NOT NULL,
  `productId` VARCHAR(50) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `quantity` DECIMAL(12, 2) NOT NULL,
  `price` DECIMAL(12, 2) NOT NULL,
  `costPrice` DECIMAL(12, 2) DEFAULT 0,
  `total` DECIMAL(12, 2) NOT NULL,
  FOREIGN KEY (`transactionId`) REFERENCES `transactions`(`id`) ON DELETE CASCADE
);

-- Optimization Indexes
CREATE INDEX idx_products_module ON products(module);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_timestamp ON transactions(timestamp);
CREATE INDEX idx_expenses_date ON expenses(date);

-- Initial Admin User
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`) 
VALUES ('U-1', 'Administrator', 'admin@wamaghach.com', 'admin123', 'admin')
ON DUPLICATE KEY UPDATE name=name;

-- Initial Hotel Menu Items
INSERT INTO `products` (id, name, description, category, module, price, costPrice, stock, minStockLevel, unit, image_url) VALUES 
('P-1', 'Beef Pilau Standard', 'Standard portion of Swahili Pilau', 'Rice', 'restaurant', 450, 180, 100, 10, 'plates', 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&q=80&w=1080'),
('P-2', 'Whole Tilapia Grilled', 'Fresh grilled lake fish', 'Main Course', 'restaurant', 850, 420, 50, 5, 'pcs', 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=1080'),
('P-3', 'Local Brew Selection', 'Cold assorted beverages', 'Beverages', 'bar', 250, 150, 500, 50, 'bottles', 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=1080'),
('P-4', 'Standard Single Room', 'Comfortable overnight stay', 'Rooms', 'accommodation', 3500, 1200, 10, 0, 'nights', 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=1080'),
('P-5', 'Full Car Wash', 'Exterior and Interior wash', 'Service', 'carwash', 600, 100, 999, 0, 'washes', 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&q=80&w=1080');
