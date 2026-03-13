-- Master SQL Schema for WhiskeDelights Bakery

-- Administrators Table
CREATE TABLE `admins` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Cakes Catalog
CREATE TABLE `cakes` (
  `id` VARCHAR(255) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `base_price` DECIMAL(10, 2) NOT NULL,
  `image_data_uri` LONGTEXT,
  `rating` DECIMAL(3, 2) NOT NULL DEFAULT 0.00,
  `category` VARCHAR(255) NOT NULL,
  `orders_count` INT NOT NULL DEFAULT 0,
  `ready_time` VARCHAR(50) NOT NULL,
  `defaultFlavorId` VARCHAR(255),
  `customizable` BOOLEAN NOT NULL DEFAULT false
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Customization: Flavors
CREATE TABLE `flavors` (
  `id` VARCHAR(255) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `description` VARCHAR(255),
  `color` VARCHAR(50)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Customization: Sizes
CREATE TABLE `sizes` (
  `id` VARCHAR(255) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `serves` VARCHAR(100),
  `price` DECIMAL(10, 2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Customization: Colors/Themes
CREATE TABLE `colors` (
  `id` VARCHAR(255) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `hex_value` VARCHAR(7),
  `price` DECIMAL(10, 2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Customization: Toppings
CREATE TABLE `toppings` (
  `id` VARCHAR(255) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Special Offers
CREATE TABLE `special_offers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `cake_id` VARCHAR(255) NOT NULL UNIQUE,
  `discount_percentage` INT NOT NULL,
  FOREIGN KEY (`cake_id`) REFERENCES `cakes`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Customer Orders
CREATE TABLE `orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_number` VARCHAR(255) NOT NULL UNIQUE,
  `customer_name` VARCHAR(255) NOT NULL,
  `customer_phone` VARCHAR(50) NOT NULL,
  `delivery_method` ENUM('delivery', 'pickup') NOT NULL,
  `delivery_address` TEXT,
  `pickup_location` VARCHAR(255),
  `delivery_date` VARCHAR(255),
  `special_instructions` TEXT,
  `total_price` DECIMAL(10, 2) NOT NULL,
  `deposit_amount` DECIMAL(10, 2) NOT NULL,
  `payment_status` ENUM('pending', 'paid') DEFAULT 'pending',
  `order_status` ENUM('processing', 'complete', 'cancelled') DEFAULT 'processing',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Order Items (Line Items)
CREATE TABLE `order_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT NOT NULL,
  `cake_id` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `quantity` INT NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `customizations` JSON,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Performance Indexes
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_status ON orders(order_status);
CREATE INDEX idx_cakes_category ON cakes(category);
