
-- WHISKEDELIGHTS PRODUCTION SCHEMA --
-- Optimized for Phusion Passenger & MySQL 8.0 --

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
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) DEFAULT 0.00,
    description TEXT
);

CREATE TABLE IF NOT EXISTS sizes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    serves VARCHAR(100),
    price DECIMAL(10, 2) DEFAULT 0.00
);

CREATE TABLE IF NOT EXISTS colors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    hex_value VARCHAR(10),
    price DECIMAL(10, 2) DEFAULT 0.00
);

CREATE TABLE IF NOT EXISTS toppings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) DEFAULT 0.00
);

CREATE TABLE IF NOT EXISTS special_offers (
    cake_id VARCHAR(100) PRIMARY KEY,
    discount_percentage INT DEFAULT 20,
    FOREIGN KEY (cake_id) REFERENCES cakes(id) ON DELETE CASCADE
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

-- INITIAL SEED DATA --

-- Cakes
INSERT IGNORE INTO cakes (id, name, description, base_price, category, ready_time, image_data_uri, rating, customizable) VALUES 
('belgian-truffle', 'Belgian Truffle', 'Rich dark chocolate cake layered with silky Belgian ganache.', 3500.00, 'Chocolate', '24h', 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?auto=format&fit=crop&q=80&w=600', 4.9, 1),
('red-velvet-classic', 'Red Velvet Classic', 'Signature cocoa sponge with luxury cream cheese frosting.', 2800.00, 'Classic', '24h', 'https://images.unsplash.com/photo-1616541823729-00fe0acc80b9?auto=format&fit=crop&q=80&w=600', 4.8, 1),
('white-forest-royal', 'White Forest Royal', 'Light sponge with kirsch-soaked cherries and fresh cream.', 2600.00, 'Classic', '24h', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=600', 4.7, 1),
('passion-fruit-zest', 'Passion Fruit Zest', 'Tangy passion fruit curd layered between vanilla bean sponge.', 3000.00, 'Fruit', '24h', 'https://images.unsplash.com/photo-1542826438-bd32f43d626f?auto=format&fit=crop&q=80&w=600', 4.6, 1),
('salted-caramel-gold', 'Salted Caramel Gold', 'Caramel mud cake with sea-salt butter frosting.', 3200.00, 'Specialty', '48h', 'https://images.unsplash.com/photo-1514056052883-d017fddd0426?auto=format&fit=crop&q=80&w=600', 4.9, 1),
('vanilla-bean-dream', 'Vanilla Bean Dream', 'Classic vanilla cake with real Madagascar bean pods.', 2400.00, 'Classic', '24h', 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&q=80&w=600', 4.5, 1);

-- Customization Options
INSERT IGNORE INTO flavors (name, price, description) VALUES 
('Madagascar Vanilla', 0.00, 'Light and aromatic vanilla bean.'),
('Belgian Chocolate', 250.00, 'Deep, 70% cocoa dark chocolate.'),
('Salted Caramel', 300.00, 'Rich caramel with sea salt notes.'),
('Strawberry Swirl', 200.00, 'Fresh strawberry reduction.');

INSERT IGNORE INTO sizes (name, serves, price) VALUES 
('6" Regular', '6-8 people', 0.00),
('8" Large', '12-15 people', 800.00),
('10" Party', '20-25 people', 1500.00);

INSERT IGNORE INTO colors (name, hex_value, price) VALUES 
('Signature White', '#FFFFFF', 0.00),
('Pastel Pink', '#FFD1DC', 150.00),
('Sky Blue', '#87CEEB', 150.00),
('Midnight Gold', '#D4AF37', 500.00);

INSERT IGNORE INTO toppings (name, price) VALUES 
('Fresh Berries', 400.00),
('Chocolate Drizzle', 150.00),
('Macarons (Set of 4)', 600.00),
('Edible Gold Leaf', 1000.00);

-- Special Offer
INSERT IGNORE INTO special_offers (cake_id, discount_percentage) VALUES ('belgian-truffle', 20);

-- Default Admin: admin@whiskedelights.com / admin123
-- Password hash for 'admin123' using bcrypt
INSERT IGNORE INTO users (id, name, email, password, role) 
VALUES ('ADMIN_1', 'Master Baker', 'admin@whiskedelights.com', '$2a$10$7zBvY7p0.7zBvY7p0.7zBuK1Gq0X9XzY0ZzY0ZzY0ZzY0ZzY0ZzY0', 'admin');
