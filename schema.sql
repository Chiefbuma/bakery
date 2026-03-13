
-- WhiskeDelights Production Database Schema
-- Optimized for MySQL 8.0

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Personnel Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'staff') DEFAULT 'staff',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Cake Catalog
CREATE TABLE IF NOT EXISTS cakes (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    base_price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(100),
    ready_time VARCHAR(50),
    rating DECIMAL(3, 2) DEFAULT 0.0,
    orders_count INT DEFAULT 0,
    customizable TINYINT(1) DEFAULT 1,
    image_data_uri TEXT,
    INDEX idx_category (category)
) ENGINE=InnoDB;

-- 3. Customization Options
CREATE TABLE IF NOT EXISTS flavors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) DEFAULT 0.0,
    description TEXT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS sizes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) DEFAULT 0.0,
    serves VARCHAR(100)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS colors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) DEFAULT 0.0,
    hex_value VARCHAR(7)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS toppings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) DEFAULT 0.0
) ENGINE=InnoDB;

-- 4. Order Management
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    delivery_method ENUM('delivery', 'pickup') NOT NULL,
    delivery_address TEXT,
    delivery_date DATE,
    total_price DECIMAL(10, 2) NOT NULL,
    deposit_amount DECIMAL(10, 2) NOT NULL,
    payment_status ENUM('pending', 'paid') DEFAULT 'pending',
    order_status ENUM('processing', 'complete', 'cancelled') DEFAULT 'processing',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_order_status (order_status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB;

-- 5. Order Items (Atomic Details)
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    cake_id VARCHAR(100),
    name VARCHAR(255),
    quantity INT DEFAULT 1,
    price DECIMAL(10, 2),
    customizations JSON,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_parent_order (order_id)
) ENGINE=InnoDB;

-- 6. Special Offers
CREATE TABLE IF NOT EXISTS special_offers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cake_id VARCHAR(100) NOT NULL,
    discount_percentage INT NOT NULL,
    FOREIGN KEY (cake_id) REFERENCES cakes(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- SEED DATA
-- Default Admin: admin@whiskedelights.com / admin123
INSERT INTO users (id, name, email, password, role) 
VALUES ('admin-01', 'Whiske Admin', 'admin@whiskedelights.com', '$2a$10$UqW.uT4R.m6Hq4P7G6kX9.Q0G6kS1O.vH9y0z1w2x3y4z5w6v7u8t', 'admin')
ON DUPLICATE KEY UPDATE id=id;

-- Initial Catalog
INSERT INTO cakes (id, name, description, base_price, category, ready_time, rating, customizable) VALUES 
('chocolate-fudge', 'Rich Belgian chocolate masterpiece.', 3200, 'Chocolate', '24h', 4.9, 1),
('red-velvet', 'Classic red velvet with cream cheese frosting.', 2800, 'Classic', '24h', 4.8, 1);

-- Initial Customizations
INSERT INTO flavors (name, price, description) VALUES ('Classic Vanilla', 0, 'Creamy vanilla bean'), ('Belgian Chocolate', 200, 'Rich dark cocoa');
INSERT INTO sizes (name, price, serves) VALUES ('6" Mini', 0, '4-6 people'), ('8" Standard', 500, '8-12 people');
INSERT INTO colors (name, price, hex_value) VALUES ('Snow White', 0, '#FFFFFF'), ('Blush Pink', 100, '#FFC0CB');

SET FOREIGN_KEY_CHECKS = 1;
