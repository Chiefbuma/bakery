-- Updated Schema for Wamaghach Kahua-ini Hotel Management System

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'staff') DEFAULT 'staff',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(255),
  module ENUM('restaurant', 'bar', 'carwash', 'accommodation', 'entertainment', 'general') DEFAULT 'restaurant',
  price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  costPrice DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  stock DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  minStockLevel DECIMAL(10, 2) NOT NULL DEFAULT 5.00,
  unit VARCHAR(50) DEFAULT 'units',
  image_url TEXT,
  hasRecipe BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS supplies (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(255),
  module VARCHAR(255),
  quantity DECIMAL(10, 3) NOT NULL DEFAULT 0.000,
  unit VARCHAR(50) NOT NULL,
  unitCost DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  lastPurchased TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recipes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  productId VARCHAR(255) NOT NULL,
  supplyId VARCHAR(255) NOT NULL,
  amount DECIMAL(10, 3) NOT NULL,
  FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (supplyId) REFERENCES supplies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS expenses (
  id VARCHAR(255) PRIMARY KEY,
  category ENUM('salary', 'utility', 'maintenance', 'rent', 'miscellaneous', 'garbage') NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  module ENUM('restaurant', 'bar', 'carwash', 'accommodation', 'entertainment', 'general') DEFAULT 'general'
);

CREATE TABLE IF NOT EXISTS transactions (
  id VARCHAR(255) PRIMARY KEY,
  orderNumber VARCHAR(255) NOT NULL UNIQUE,
  module ENUM('restaurant', 'bar', 'carwash', 'accommodation', 'entertainment', 'general') DEFAULT 'general',
  totalAmount DECIMAL(10, 2) NOT NULL,
  totalCost DECIMAL(10, 2) NOT NULL,
  paymentMethod ENUM('cash', 'mpesa', 'card', 'none') DEFAULT 'none',
  status ENUM('paid', 'pending') DEFAULT 'pending',
  customerName VARCHAR(255),
  amountReceived DECIMAL(10, 2) DEFAULT 0.00,
  balance DECIMAL(10, 2) DEFAULT 0.00,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transaction_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  transactionId VARCHAR(255) NOT NULL,
  productId VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  costPrice DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (transactionId) REFERENCES transactions(id) ON DELETE CASCADE
);

-- Seed admin user (password: admin123)
INSERT IGNORE INTO users (id, name, email, password, role) VALUES ('U-ADMIN', 'Super Admin', 'admin@wamaghach.com', 'admin123', 'admin');
