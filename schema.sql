
-- Wamaghach Kahua-ini Hotel Management System | Definitive Production Schema
-- Optimized for MySQL 8.0+ with High-Performance Indexing

-- 1. Personnel & Access Control
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(255) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `role` ENUM('admin', 'staff') DEFAULT 'staff',
  `password` VARCHAR(255) NOT NULL DEFAULT 'staff123',
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Initial Admin (Access Key: CnhXfEpdkH2nUQME6xks)
INSERT IGNORE INTO `users` (`id`, `name`, `email`, `role`, `password`) 
VALUES ('U-1', 'Super Admin', 'admin@wamaghach.com', 'admin', 'CnhXfEpdkH2nUQME6xks');

-- 2. Master Stock (Sellable Items)
CREATE TABLE IF NOT EXISTS `products` (
  `id` VARCHAR(255) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `category` VARCHAR(100),
  `module` ENUM('restaurant', 'bar', 'carwash', 'accommodation', 'entertainment') NOT NULL,
  `price` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `costPrice` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `stock` DECIMAL(12, 4) NOT NULL DEFAULT 0.0000,
  `minStockLevel` DECIMAL(12, 4) NOT NULL DEFAULT 5.0000,
  `unit` VARCHAR(50) DEFAULT 'units',
  `image_url` TEXT,
  INDEX idx_prod_module (module),
  INDEX idx_prod_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Raw Supplies (Consumables)
CREATE TABLE IF NOT EXISTS `supplies` (
  `id` VARCHAR(255) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100),
  `module` VARCHAR(100) DEFAULT 'general',
  `quantity` DECIMAL(12, 4) NOT NULL DEFAULT 0.0000,
  `unit` VARCHAR(50) NOT NULL,
  `unitCost` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `lastPurchased` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_supply_module (module)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Production Recipes (Maps Products to Supplies)
CREATE TABLE IF NOT EXISTS `recipes` (
  `productId` VARCHAR(255) NOT NULL,
  `supplyId` VARCHAR(255) NOT NULL,
  `amount` DECIMAL(12, 6) NOT NULL,
  PRIMARY KEY (`productId`, `supplyId`),
  FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`supplyId`) REFERENCES `supplies`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Sales & Transactions
CREATE TABLE IF NOT EXISTS `transactions` (
  `id` VARCHAR(255) PRIMARY KEY,
  `orderNumber` VARCHAR(255) NOT NULL UNIQUE,
  `module` VARCHAR(100) NOT NULL,
  `totalAmount` DECIMAL(12, 2) NOT NULL,
  `totalCost` DECIMAL(12, 2) NOT NULL,
  `paymentMethod` ENUM('cash', 'mpesa', 'card', 'none') DEFAULT 'cash',
  `status` ENUM('paid', 'pending') DEFAULT 'paid',
  `customerName` VARCHAR(255),
  `amountReceived` DECIMAL(12, 2),
  `balance` DECIMAL(12, 2),
  `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_tx_timestamp (timestamp),
  INDEX idx_tx_status (status),
  INDEX idx_tx_module (module)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `transaction_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `transactionId` VARCHAR(255) NOT NULL,
  `productId` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `quantity` DECIMAL(12, 4) NOT NULL,
  `price` DECIMAL(12, 2) NOT NULL,
  `costPrice` DECIMAL(12, 2) NOT NULL,
  `total` DECIMAL(12, 2) NOT NULL,
  FOREIGN KEY (`transactionId`) REFERENCES `transactions`(`id`) ON DELETE CASCADE,
  INDEX idx_t_items_tx (transactionId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Operating Expenses (OpEx)
CREATE TABLE IF NOT EXISTS `expenses` (
  `id` VARCHAR(255) PRIMARY KEY,
  `category` ENUM('salary', 'utility', 'maintenance', 'rent', 'garbage', 'miscellaneous') DEFAULT 'miscellaneous',
  `amount` DECIMAL(12, 2) NOT NULL,
  `description` TEXT,
  `date` DATE NOT NULL,
  `module` VARCHAR(100) DEFAULT 'general',
  INDEX idx_exp_date (date),
  INDEX idx_exp_module (module)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Initial Seed Data
INSERT IGNORE INTO `products` (`id`, `name`, `category`, `module`, `price`, `costPrice`, `stock`, `unit`, `image_url`) VALUES
('P-1', 'Beef Pilau', 'Swahili Dishes', 'restaurant', 450.00, 280.00, 50.00, 'plates', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'),
('P-2', 'Whole Tilapia (Wet Fry)', 'Fish', 'restaurant', 850.00, 420.00, 20.00, 'pieces', 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400'),
('P-3', 'Tusker Lager 500ml', 'Beer', 'bar', 300.00, 220.00, 120.00, 'bottles', 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=400');

INSERT IGNORE INTO `supplies` (`id`, `name`, `category`, `module`, `quantity`, `unit`, `unitCost`) VALUES
('S-1', 'Basmati Rice', 'Cereals', 'restaurant', 25.00, 'kg', 180.00),
('S-2', 'Cooking Oil', 'Oils', 'restaurant', 20.00, 'liters', 240.00),
('S-3', 'Onions', 'Vegetables', 'restaurant', 10.00, 'kg', 90.00);

-- Link Pilau to Rice consumption (0.2kg per plate)
INSERT IGNORE INTO `recipes` (`productId`, `supplyId`, `amount`) VALUES ('P-1', 'S-1', 0.200000);
