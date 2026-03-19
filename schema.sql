-- WhiskeDelights Artisanal Bakery | Production Schema
-- Optimized for Phusion Passenger & MySQL 8.0

CREATE TABLE IF NOT EXISTS cakes (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    base_price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(50),
    ready_time VARCHAR(20),
    image_data_uri LONGTEXT,
    rating DECIMAL(2, 1) DEFAULT 5.0,
    orders_count INT DEFAULT 0,
    customizable BOOLEAN DEFAULT 1
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
    price DECIMAL(10, 2) DEFAULT 0.00,
    serves VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS colors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) DEFAULT 0.00,
    hex_value VARCHAR(20)
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
    latitude DECIMAL(10, 8) DEFAULT NULL,
    longitude DECIMAL(11, 8) DEFAULT NULL,
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
    cake_id VARCHAR(100),
    name VARCHAR(255),
    quantity INT DEFAULT 1,
    price DECIMAL(10, 2),
    customizations JSON,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'staff') DEFAULT 'staff',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS special_offers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cake_id VARCHAR(100) NOT NULL,
    discount_percentage INT NOT NULL,
    FOREIGN KEY (cake_id) REFERENCES cakes(id) ON DELETE CASCADE
);

-- Default Admin: admin@whiskedelights.com | admin123
INSERT INTO users (id, name, email, password, role) 
VALUES ('admin-1', 'WhiskeDelights Admin', 'admin@whiskedelights.com', '$2a$10$CnhXfEpdkH2nUQME6xks.O8d9017d3458e0213efd55c219527b91', 'admin')
ON DUPLICATE KEY UPDATE id=id;
