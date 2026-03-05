
-- Wamaghach Kahua-ini Hotel | Production Schema
-- Optimized for MySQL 8.0+

-- 1. Personnel Table
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `role` ENUM('admin', 'staff') DEFAULT 'staff',
  `password` VARCHAR(255) NOT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
  INDEX idx_prod_module (module),
  INDEX idx_prod_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Raw Supplies (Inventory)
CREATE TABLE IF NOT EXISTS `supplies` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100),
  `module` VARCHAR(50),
  `quantity` DECIMAL(10, 4) DEFAULT 0,
  `unit` VARCHAR(20) NOT NULL,
  `unitCost` DECIMAL(10, 2) DEFAULT 0,
  `lastPurchased` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_supp_module (module)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Consumption Recipes
CREATE TABLE IF NOT EXISTS `recipes` (
  `productId` VARCHAR(50) NOT NULL,
  `supplyId` VARCHAR(50) NOT NULL,
  `amount` DECIMAL(10, 4) NOT NULL,
  PRIMARY KEY (`productId`, `supplyId`),
  FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`supplyId`) REFERENCES `supplies`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Transactions
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
  `balance` DECIMAL(10, 2),
  INDEX idx_trans_status (status),
  INDEX idx_trans_date (timestamp),
  INDEX idx_trans_module (module)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Transaction Items
CREATE TABLE IF NOT EXISTS `transaction_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `transactionId` VARCHAR(50) NOT NULL,
  `productId` VARCHAR(50) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `quantity` DECIMAL(10, 2) NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `costPrice` DECIMAL(10, 2) NOT NULL,
  `total` DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (`transactionId`) REFERENCES `transactions`(`id`) ON DELETE CASCADE,
  INDEX idx_item_trans (transactionId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Operating Expenses
CREATE TABLE IF NOT EXISTS `expenses` (
  `id` VARCHAR(50) PRIMARY KEY,
  `category` ENUM('salary', 'utility', 'maintenance', 'rent', 'miscellaneous', 'garbage') NOT NULL,
  `amount` DECIMAL(10, 2) NOT NULL,
  `description` TEXT,
  `date` DATE NOT NULL,
  `module` VARCHAR(50) DEFAULT 'general',
  INDEX idx_exp_date (date),
  INDEX idx_exp_cat (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- INITIAL DATA SEEDING
INSERT INTO `users` (`id`, `name`, `email`, `role`, `password`) VALUES 
('U-ADMIN', 'Executive Manager', 'admin@wamaghach.com', 'admin', 'admin123');

INSERT INTO `products` (`id`, `name`, `category`, `module`, `price`, `costPrice`, `stock`, `unit`, `image_url`) VALUES
('P-PILAU', 'Authentic Beef Pilau', 'Main Dish', 'restaurant', 450, 200, 100, 'servings', 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&q=80&w=1080'),
('P-TILAPIA', 'Grilled Lake Tilapia', 'Seafood', 'restaurant', 850, 400, 50, 'fish', 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=1080'),
('P-BEER', 'Premium Cold Lager', 'Beverages', 'bar', 300, 180, 500, 'bottles', 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=1080'),
('P-WASH', 'Exterior Full Body Wash', 'Cleaning', 'carwash', 500, 100, 9999, 'cars', 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&q=80&w=1080');
