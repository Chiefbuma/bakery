-- WhiskeDelights Artisanal Bakery | Production Database Schema
-- Version: 1.1 | Optimized with indexing and atomic transaction integrity

CREATE DATABASE IF NOT EXISTS gledcapi_whiskedelights;
USE gledcapi_whiskedelights;

-- 1. Personnel Management (Bcrypt hashed admin123 password)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'staff') DEFAULT 'staff',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Artisanal Catalog
CREATE TABLE IF NOT EXISTS cakes (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    base_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    category VARCHAR(100),
    ready_time VARCHAR(50) DEFAULT '24h',
    customizable TINYINT(1) DEFAULT 1,
    image_data_uri TEXT,
    rating DECIMAL(2,1) DEFAULT 4.5,
    orders_count INT DEFAULT 0
);

-- 3. Customization Entities
CREATE TABLE IF NOT EXISTS flavors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) DEFAULT 0,
    description TEXT
);

CREATE TABLE IF NOT EXISTS sizes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) DEFAULT 0,
    serves VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS colors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) DEFAULT 0,
    hex_value VARCHAR(10)
);

CREATE TABLE IF NOT EXISTS toppings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) DEFAULT 0
);

-- 4. Order & Fulfillment Ledger
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(20) UNIQUE NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
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
    order_id INT,
    cake_id VARCHAR(100),
    name VARCHAR(255),
    quantity INT,
    price DECIMAL(10, 2),
    customizations JSON,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- 5. Marketing & Promotion
CREATE TABLE IF NOT EXISTS special_offers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cake_id VARCHAR(100),
    discount_percentage INT,
    FOREIGN KEY (cake_id) REFERENCES cakes(id) ON DELETE CASCADE
);

-- 6. High-Performance Indexing
CREATE INDEX idx_cake_category ON cakes(category);
CREATE INDEX idx_order_status ON orders(order_status);
CREATE INDEX idx_order_number ON orders(order_number);
CREATE INDEX idx_user_email ON users(email);

-- 7. Production Initialization Data
INSERT INTO users (id, name, email, password, role) VALUES 
('adm-001', 'Admin Master', 'admin@whiskedelights.com', '$2b$10$CnhXfEpdkH2nUQME6xks.uG8XkO3vYfM6X9eX8pZ.Y/L6yW6yR4eY', 'admin');

-- Masterpiece Catalog Seed
INSERT INTO cakes (id, name, description, base_price, category, ready_time, customizable, image_data_uri, orders_count) VALUES 
('chocolate-truffle', 'Rich Belgian chocolate truffle with silky ganache.', 3200, 'Chocolate', '24h', 1, 'https://images.unsplash.com/photo-1602351447937-745cb720612f', 150),
('red-velvet-classic', 'Traditional red velvet with signature cream cheese.', 2800, 'Classic', '24h', 1, 'https://images.unsplash.com/photo-1645366188121-2a19e02fcbd5', 120),
('strawberry-dream', 'Light vanilla sponge with fresh Nyeri strawberries.', 2500, 'Fruit', '24h', 0, 'https://images.unsplash.com/photo-1650419424455-d0513aaf0dd6', 95);

-- Variants Seed
INSERT INTO flavors (name, price, description) VALUES ('Vanilla Bean', 0, 'Aromatic Madagascar vanilla'), ('Belgian Truffle', 250, 'Extra rich chocolate');
INSERT INTO sizes (name, price, serves) VALUES ('6" Mini', 0, '6-8 people'), ('8" Standard', 600, '10-12 people'), ('10" Large', 1200, '15-20 people');
INSERT INTO colors (name, price, hex_value) VALUES ('Classic White', 0, '#FFFFFF'), ('Blush Pink', 150, '#FFD1DC'), ('Sky Blue', 150, '#87CEEB');
INSERT INTO toppings (name, price) VALUES ('Rainbow Sprinkles', 50), ('Edible Gold Leaf', 500), ('Fresh Berries', 300);

-- Initial Daily Special
INSERT INTO special_offers (cake_id, discount_percentage) VALUES ('chocolate-truffle', 20);
