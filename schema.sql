
-- Wamaghach Kahua-ini Hotel Management System Schema
-- Production Ready with High-Performance Indexing

-- 1. Users & Personnel
CREATE TABLE `users` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('admin', 'staff') DEFAULT 'staff',
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Master Stock Products
CREATE TABLE `products` (
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
  INDEX idx_prod_module (module),
  INDEX idx_prod_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Raw Supplies (Inventory)
CREATE TABLE `supplies` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100),
  `module` VARCHAR(50),
  `quantity` DECIMAL(10, 4) NOT NULL,
  `unit` VARCHAR(20) NOT NULL,
  `unitCost` DECIMAL(10, 2) NOT NULL,
  `lastPurchased` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Production Recipes (Maps Products to Supplies)
CREATE TABLE `recipes` (
  `productId` VARCHAR(50) NOT NULL,
  `supplyId` VARCHAR(50) NOT NULL,
  `amount` DECIMAL(10, 4) NOT NULL,
  PRIMARY KEY (`productId`, `supplyId`),
  FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`supplyId`) REFERENCES `supplies`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Sales Transactions
CREATE TABLE `transactions` (
  `id` VARCHAR(50) PRIMARY KEY,
  `orderNumber` VARCHAR(50) NOT NULL UNIQUE,
  `module` VARCHAR(50) NOT NULL,
  `totalAmount` DECIMAL(10, 2) NOT NULL,
  `totalCost` DECIMAL(10, 2) NOT NULL,
  `paymentMethod` VARCHAR(50),
  `status` ENUM('paid', 'pending') DEFAULT 'paid',
  `customerName` VARCHAR(255),
  `amountReceived` DECIMAL(10, 2),
  `balance` DECIMAL(10, 2),
  `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_tx_date (timestamp),
  INDEX idx_tx_module (module),
  INDEX idx_tx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Transaction Items
CREATE TABLE `transaction_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `transactionId` VARCHAR(50) NOT NULL,
  `productId` VARCHAR(50) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `quantity` DECIMAL(10, 2) NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `costPrice` DECIMAL(10, 2) NOT NULL,
  `total` DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (`transactionId`) REFERENCES `transactions`(`id`) ON DELETE CASCADE,
  INDEX idx_titems_tx (transactionId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Operating Expenses (OpEx)
CREATE TABLE `expenses` (
  `id` VARCHAR(50) PRIMARY KEY,
  `category` VARCHAR(100) NOT NULL,
  `amount` DECIMAL(10, 2) NOT NULL,
  `description` TEXT,
  `date` DATE NOT NULL,
  `module` VARCHAR(50) DEFAULT 'general',
  INDEX idx_exp_date (date),
  INDEX idx_exp_cat (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Initial Seed Data
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`) VALUES 
('U1', 'Executive Admin', 'admin@wamaghach.com', 'CnhXfEpdkH2nUQME6xks', 'admin');

INSERT INTO `products` (`id`, `name`, `description`, `category`, `module`, `price`, `costPrice`, `stock`, `unit`, `image_url`) VALUES 
('P1', 'Swahili Pilau (Beef)', 'Fragrant rice with tender beef', 'Meals', 'restaurant', 450.00, 180.00, 100, 'plates', 'https://images.unsplash.com/photo-1626776876729-bab4369a5a5a?q=80&w=600'),
('P2', 'Wet Fry Tilapia', 'Fresh Lake Victoria Tilapia', 'Meals', 'restaurant', 850.00, 350.00, 50, 'plates', 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?q=80&w=600'),
('P3', 'Deluxe Room', 'Luxury accommodation per night', 'Standard', 'accommodation', 4500.00, 1200.00, 12, 'rooms', 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=600');

INSERT INTO `supplies` (`id`, `name`, `category`, `module`, `quantity`, `unit`, `unitCost`) VALUES 
('S1', 'Basmati Rice', 'Dry Goods', 'restaurant', 50.00, 'kg', 160.00),
('S2', 'Cooking Oil', 'Liquid', 'restaurant', 20.00, 'litres', 240.00),
('S3', 'Beef Chuck', 'Meat', 'restaurant', 15.00, 'kg', 550.00);

INSERT INTO `recipes` (`productId`, `supplyId`, `amount`) VALUES 
('P1', 'S1', 0.1500),
('P1', 'S2', 0.0200),
('P1', 'S3', 0.1000);
