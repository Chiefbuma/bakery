
-- schema.sql
-- Database Setup for Wamaghach Kahua-ini Hotel
-- Run this in phpMyAdmin for gledcapi_hotel database

DROP TABLE IF EXISTS `transaction_items`;
DROP TABLE IF EXISTS `transactions`;
DROP TABLE IF EXISTS `recipes`;
DROP TABLE IF EXISTS `expenses`;
DROP TABLE IF EXISTS `supplies`;
DROP TABLE IF EXISTS `products`;
DROP TABLE IF EXISTS `users`;

-- Users Table
CREATE TABLE `users` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `role` ENUM('admin', 'staff') NOT NULL DEFAULT 'staff',
  `password` VARCHAR(255) NOT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products Table (Master Stock)
CREATE TABLE `products` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `category` VARCHAR(100),
  `module` ENUM('restaurant', 'bar', 'carwash', 'accommodation', 'entertainment') NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `costPrice` DECIMAL(10, 2) NOT NULL DEFAULT 0,
  `stock` DECIMAL(10, 2) NOT NULL DEFAULT 0,
  `minStockLevel` DECIMAL(10, 2) NOT NULL DEFAULT 0,
  `unit` VARCHAR(50) DEFAULT 'units',
  `image_url` TEXT
);

-- Supplies Table (Raw Materials)
CREATE TABLE `supplies` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100),
  `module` VARCHAR(100),
  `quantity` DECIMAL(10, 4) NOT NULL DEFAULT 0,
  `unit` VARCHAR(50) NOT NULL,
  `unitCost` DECIMAL(10, 2) NOT NULL DEFAULT 0,
  `lastPurchased` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Recipes Table (Consumption Mapping)
CREATE TABLE `recipes` (
  `productId` VARCHAR(50) NOT NULL,
  `supplyId` VARCHAR(50) NOT NULL,
  `amount` DECIMAL(10, 4) NOT NULL,
  PRIMARY KEY (`productId`, `supplyId`),
  FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`supplyId`) REFERENCES `supplies`(`id`) ON DELETE CASCADE
);

-- Transactions Table
CREATE TABLE `transactions` (
  `id` VARCHAR(50) PRIMARY KEY,
  `orderNumber` VARCHAR(100) NOT NULL UNIQUE,
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

-- Transaction Items Table
CREATE TABLE `transaction_items` (
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

-- Expenses Table
CREATE TABLE `expenses` (
  `id` VARCHAR(50) PRIMARY KEY,
  `category` ENUM('salary', 'utility', 'maintenance', 'rent', 'garbage', 'miscellaneous') NOT NULL,
  `amount` DECIMAL(10, 2) NOT NULL,
  `description` TEXT,
  `date` DATE NOT NULL,
  `module` VARCHAR(50) DEFAULT 'general'
);

-- Add Performance Indexes
CREATE INDEX idx_trans_month ON transactions(timestamp);
CREATE INDEX idx_trans_module ON transactions(module);
CREATE INDEX idx_exp_month ON expenses(date);

-- Initial Data (Use provided credentials and hotel theme)
INSERT INTO `users` (`id`, `name`, `email`, `role`, `password`) VALUES 
('admin-01', 'Hotel Manager', 'admin@wamaghach.com', 'admin', 'CnhXfEpdkH2nUQME6xks');

INSERT INTO `products` (`id`, `name`, `description`, `category`, `module`, `price`, `costPrice`, `stock`, `image_url`) VALUES 
('p1', 'Swahili beef Pilau', 'Authentic beef pilau served with kachumbari.', 'Main Course', 'restaurant', 450, 200, 50, 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&q=80&w=1080'),
('p2', 'Grilled Tilapia', 'Fresh lake fish grilled with traditional spices.', 'Main Course', 'restaurant', 650, 300, 30, 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=1080'),
('p3', 'Cold Soda 300ml', 'Assorted soft drinks.', 'Beverages', 'restaurant', 100, 65, 200, 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=1080'),
('p4', 'Tusker Lager', 'Kenya finest beer.', 'Alcohol', 'bar', 300, 180, 500, 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=1080'),
('p5', 'Standard Double Room', 'Comfortable double bed with ensuite bathroom.', 'Rooms', 'accommodation', 3500, 0, 10, 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=1080'),
('p6', 'Executive Suite', 'Spacious luxury suite with private balcony.', 'Rooms', 'accommodation', 7500, 0, 4, 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&q=80&w=1080'),
('p7', 'Full Detailing (Carwash)', 'Professional exterior and interior car detailing.', 'Services', 'carwash', 800, 150, 100, 'https://images.unsplash.com/photo-1605610816700-162d1c1cfdf1?auto=format&fit=crop&q=80&w=1080');
