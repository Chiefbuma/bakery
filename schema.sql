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
    payment_reference VARCHAR(120) UNIQUE DEFAULT NULL,
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
    cake_id VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    customizations JSON DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_order_items_cake FOREIGN KEY (cake_id) REFERENCES cakes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'staff') DEFAULT 'staff',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS flavors (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100), price DECIMAL(10,2), description TEXT);
CREATE TABLE IF NOT EXISTS sizes (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100), price DECIMAL(10,2), serves VARCHAR(50));
CREATE TABLE IF NOT EXISTS colors (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100), price DECIMAL(10,2), hex_value VARCHAR(10));
CREATE TABLE IF NOT EXISTS toppings (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100), price DECIMAL(10,2));
CREATE TABLE IF NOT EXISTS special_offers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cake_id VARCHAR(100) NOT NULL UNIQUE,
    discount_percentage INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_special_offers_cake FOREIGN KEY (cake_id) REFERENCES cakes(id) ON DELETE CASCADE
);

-- Seed Artisanal Catalog
INSERT IGNORE INTO cakes (id, name, description, base_price, category, ready_time, rating, image_data_uri) VALUES 
('belgian-truffle', 'Belgian Truffle', 'Dark chocolate ganache with gold leaf.', 3800.00, 'Specialty', '48h', 4.9, 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=600'),
('signature-red-velvet', 'Signature Red Velvet', 'Cream cheese frosting on velvet sponge.', 3200.00, 'Classic', '24h', 4.8, 'https://images.unsplash.com/photo-1645366188121-2a19e02fcbd5?auto=format&fit=crop&q=80&w=600'),
('strawberry-shortcake', 'Strawberry Shortcake', 'Fresh farm strawberries on light vanilla cloud.', 2900.00, 'Fruit', '24h', 4.7, 'https://images.unsplash.com/photo-1650419424455-d0513aaf0dd6?auto=format&fit=crop&q=80&w=600'),
('lemon-zest-crown', 'Lemon Zest Crown', 'Zesty lemon curd with meringue frosting.', 2700.00, 'Classic', '24h', 4.6, 'https://images.unsplash.com/photo-1691242720316-7bea97eb655f?auto=format&fit=crop&q=80&w=600'),
('chocolate-hazelnut', 'Chocolate Hazelnut', 'Roasted hazelnut brittle with milk chocolate.', 3500.00, 'Chocolate', '48h', 4.9, 'https://images.unsplash.com/photo-1602351447937-745cb720612f?auto=format&fit=crop&q=80&w=600');

INSERT IGNORE INTO flavors (name, price, description) VALUES ('Madagascar Vanilla', 0, 'Pure vanilla bean'), ('Belgian Cocoa', 250, 'Rich dark chocolate'), ('Salted Caramel', 300, 'Sweet and salty luxury');
INSERT IGNORE INTO sizes (name, price, serves) VALUES ('Small (6")', 0, '6-8 guests'), ('Medium (8")', 600, '10-12 guests'), ('Large (10")', 1200, '15-20 guests');
INSERT IGNORE INTO colors (name, price, hex_value) VALUES ('Snow White', 0, '#FFFFFF'), ('Blush Pink', 150, '#FFD1DC'), ('Ocean Blue', 150, '#87CEEB');
INSERT IGNORE INTO toppings (name, price) VALUES ('Sprinkles', 50), ('Chocolate Drizzle', 100), ('Gold Leaf', 500);

INSERT IGNORE INTO special_offers (cake_id, discount_percentage) VALUES ('belgian-truffle', 20);
