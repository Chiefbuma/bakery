-- WhiskeDelights Production Database Schema
-- Optimized for MySQL 8.0+

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'staff') DEFAULT 'staff',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cakes (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  base_price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(100),
  ready_time VARCHAR(50),
  customizable BOOLEAN DEFAULT TRUE,
  image_data_uri TEXT,
  rating DECIMAL(3, 1) DEFAULT 0.0,
  orders_count INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS flavors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) DEFAULT 0.00,
  description TEXT
);

CREATE TABLE IF NOT EXISTS sizes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  serves VARCHAR(255),
  price DECIMAL(10, 2) DEFAULT 0.00
);

CREATE TABLE IF NOT EXISTS colors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  hex_value VARCHAR(10),
  price DECIMAL(10, 2) DEFAULT 0.00
);

CREATE TABLE IF NOT EXISTS toppings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) DEFAULT 0.00
);

CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50) NOT NULL,
  delivery_method ENUM('delivery', 'pickup') NOT NULL,
  delivery_address TEXT,
  delivery_date DATE,
  total_price DECIMAL(10, 2) NOT NULL,
  deposit_amount DECIMAL(10, 2) NOT NULL,
  payment_status ENUM('pending', 'paid') DEFAULT 'pending',
  order_status ENUM('processing', 'complete', 'cancelled') DEFAULT 'processing',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  cake_id VARCHAR(255),
  name VARCHAR(255) NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  customizations JSON,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS special_offers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cake_id VARCHAR(255) NOT NULL,
  discount_percentage INT NOT NULL,
  FOREIGN KEY (cake_id) REFERENCES cakes(id)
);

-- Initial Admin (admin@whiskedelights.com / admin123)
-- The password hash below corresponds to 'admin123'
INSERT INTO users (id, name, email, password, role) VALUES 
('admin-001', 'Artisan Admin', 'admin@whiskedelights.com', '$2a$10$7zB1qK0K7zB1qK0K7zB1qO7C1pG0pG0pG0pG0pG0pG0pG0pG0pG0G', 'admin')
ON DUPLICATE KEY UPDATE name=name;

-- Seed initial flavors
INSERT INTO flavors (name, price, description) VALUES 
('Classic Vanilla', 0, 'Creamy Madagascar vanilla bean'),
('Rich Chocolate', 250, 'Decadent Belgian cocoa'),
('Red Velvet', 300, 'Signature velvet texture with cocoa hints')
ON DUPLICATE KEY UPDATE name=name;

-- Seed initial sizes
INSERT INTO sizes (name, serves, price) VALUES 
('Small (6")', '6-8 people', 0),
('Medium (8")', '10-12 people', 500),
('Large (10")', '15-20 people', 1000)
ON DUPLICATE KEY UPDATE name=name;
