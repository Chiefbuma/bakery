
-- WhiskeDelights Production Database Schema
-- Optimized for Phusion Passenger & Geolocation Auditing

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
    order_id INT,
    cake_id VARCHAR(100),
    name VARCHAR(255),
    quantity INT,
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

CREATE TABLE IF NOT EXISTS special_offers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cake_id VARCHAR(100),
    discount_percentage INT,
    FOREIGN KEY (cake_id) REFERENCES cakes(id) ON DELETE CASCADE
);

-- INITIAL PRODUCTION DATA
INSERT IGNORE INTO users (id, name, email, password, role) 
VALUES ('ADMIN_1', 'Master Baker', 'admin@whiskedelights.com', '$2a$10$7zBvY7p0.7zBvY7p0.7zBuK1Gq0X9XzY0ZzY0ZzY0ZzY0ZzY0ZzY0', 'admin');

INSERT IGNORE INTO flavors (name, price, description) VALUES 
('Classic Vanilla', 0.00, 'Timeless aromatic vanilla.'),
('Rich Chocolate', 200.00, 'Deep decadent cocoa.'),
('Red Velvet', 250.00, 'Signature Southern classic.'),
('Salted Caramel', 300.00, 'Sweet and salty luxury.');

INSERT IGNORE INTO sizes (name, price, serves) VALUES 
('6" Small', 0.00, '6-8 people'),
('8" Medium', 500.00, '10-12 people'),
('10" Large', 1000.00, '15-20 people');

INSERT IGNORE INTO colors (name, price, hex_value) VALUES 
('Classic White', 0.00, '#FFFFFF'),
('Pastel Pink', 100.00, '#FFD1DC'),
('Vibrant Red', 150.00, '#FF0000');

INSERT IGNORE INTO toppings (name, price) VALUES 
('Rainbow Sprinkles', 50.00),
('Chocolate Drizzle', 100.00),
('Fresh Berries', 250.00),
('Edible Gold Leaf', 500.00);

INSERT IGNORE INTO cakes (id, name, description, base_price, category, ready_time, customizable, image_data_uri) VALUES 
('belgian-truffle', 'Belgian Truffle', 'Rich dark chocolate cake with smooth truffle ganache.', 3500.00, 'Specialty', '48h', 1, 'https://images.unsplash.com/photo-1602351447937-745cb720612f?auto=format&fit=crop&q=80&w=600'),
('velvet-rose', 'Velvet Rose', 'Exquisite red velvet cake with subtle rose notes.', 2800.00, 'Classic', '24h', 1, 'https://images.unsplash.com/photo-1645366188121-2a19e02fcbd5?auto=format&fit=crop&q=80&w=600'),
('lemon-cloud', 'Lemon Cloud', 'Zesty and light chiffon cake with tangy lemon zest.', 2400.00, 'Fruit', '24h', 1, 'https://images.unsplash.com/photo-1691242720316-7bea97eb655f?auto=format&fit=crop&q=80&w=600');

INSERT IGNORE INTO special_offers (cake_id, discount_percentage) VALUES ('belgian-truffle', 20);
