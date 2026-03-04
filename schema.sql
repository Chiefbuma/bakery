
-- Wamaghach Kahua-ini Hotel | Production Schema
-- Optimized with Indexes for High-Performance Analytics and POS Operations

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- --------------------------------------------------------

-- Table structure for `users`
CREATE TABLE `users` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `role` enum('admin','staff') NOT NULL DEFAULT 'staff',
  `password` varchar(255) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for `products` (Master Stock)
CREATE TABLE `products` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `category` varchar(255) NOT NULL,
  `module` enum('restaurant','bar','carwash','accommodation','entertainment') NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `costPrice` decimal(10,2) NOT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `minStockLevel` int(11) NOT NULL DEFAULT 5,
  `unit` varchar(50) NOT NULL DEFAULT 'units',
  `image_url` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_product_module` (`module`),
  KEY `idx_product_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for `supplies` (Raw Materials)
CREATE TABLE `supplies` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `category` varchar(255) DEFAULT 'General',
  `module` varchar(255) DEFAULT 'restaurant',
  `quantity` decimal(10,3) NOT NULL DEFAULT 0.000,
  `unit` varchar(50) NOT NULL,
  `unitCost` decimal(10,2) NOT NULL,
  `lastPurchased` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for `recipes` (Production Mapping)
CREATE TABLE `recipes` (
  `productId` varchar(255) NOT NULL,
  `supplyId` varchar(255) NOT NULL,
  `amount` decimal(10,4) NOT NULL,
  PRIMARY KEY (`productId`,`supplyId`),
  KEY `supplyId` (`supplyId`),
  CONSTRAINT `recipes_ibfk_1` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `recipes_ibfk_2` FOREIGN KEY (`supplyId`) REFERENCES `supplies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for `expenses`
CREATE TABLE `expenses` (
  `id` varchar(255) NOT NULL,
  `category` enum('salary','utility','maintenance','rent','miscellaneous','garbage') NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `description` varchar(255) NOT NULL,
  `date` date NOT NULL,
  `module` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_expense_date` (`date`),
  KEY `idx_expense_module` (`module`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for `transactions` (Sales)
CREATE TABLE `transactions` (
  `id` varchar(255) NOT NULL,
  `orderNumber` varchar(255) NOT NULL,
  `module` varchar(50) NOT NULL,
  `totalAmount` decimal(10,2) NOT NULL,
  `totalCost` decimal(10,2) NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `paymentMethod` enum('cash','mpesa','card','none') NOT NULL,
  `status` enum('paid','pending') NOT NULL,
  `customerName` varchar(255) DEFAULT NULL,
  `amountReceived` decimal(10,2) DEFAULT NULL,
  `balance` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `orderNumber` (`orderNumber`),
  KEY `idx_transaction_timestamp` (`timestamp`),
  KEY `idx_transaction_status_module` (`status`,`module`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for `transaction_items`
CREATE TABLE `transaction_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `transactionId` varchar(255) NOT NULL,
  `productId` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `quantity` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `costPrice` decimal(10,2) NOT NULL,
  `total` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `transactionId` (`transactionId`),
  CONSTRAINT `transaction_items_ibfk_1` FOREIGN KEY (`transactionId`) REFERENCES `transactions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed Data
INSERT INTO `users` (`id`, `name`, `email`, `role`, `password`) VALUES
('U-ADMIN', 'Admin Manager', 'admin@wamaghach.com', 'admin', 'admin123'),
('U-STAFF', 'Service Staff', 'staff@wamaghach.com', 'staff', 'staff123');

INSERT INTO `products` (`id`, `name`, `description`, `category`, `module`, `price`, `costPrice`, `stock`, `unit`, `image_url`) VALUES
('P-PILAU', 'Swahili Pilau', 'Traditional beef pilau served with kachumbari.', 'Main Course', 'restaurant', 450.00, 180.00, 50, 'plates', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800'),
('P-TILAPIA', 'Wet Fry Tilapia', 'Fresh Lake Victoria tilapia in rich tomato gravy.', 'Fish', 'restaurant', 850.00, 320.00, 20, 'units', 'https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?w=800'),
('P-ROOM-STD', 'Standard Single Room', 'Cozy room with Wi-Fi and breakfast.', 'Rooms', 'accommodation', 3500.00, 500.00, 10, 'nights', 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800');

INSERT INTO `supplies` (`id`, `name`, `category`, `module`, `quantity`, `unit`, `unitCost`) VALUES
('S-OIL', 'Cooking Oil', 'Kitchen', 'restaurant', 20.000, 'liters', 200.00),
('S-RICE', 'Biryani Rice', 'Kitchen', 'restaurant', 50.000, 'kg', 150.00),
('S-CHAR', 'Charcoal', 'Fuel', 'restaurant', 10.000, 'bags', 1200.00);

INSERT INTO `recipes` (`productId`, `supplyId`, `amount`) VALUES
('P-PILAU', 'S-RICE', 0.2500), -- 250g per plate
('P-PILAU', 'S-OIL', 0.0500),  -- 50ml per plate
('P-TILAPIA', 'S-OIL', 0.1000); -- 100ml per fish

COMMIT;
