-- Wamaghach Kahua-ini Hotel Management System Schema
-- Compatible with MySQL 8.0+

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role ENUM('admin', 'staff') NOT NULL DEFAULT 'staff',
    password VARCHAR(255) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Products Table (Master Stock)
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    module ENUM('restaurant', 'bar', 'carwash', 'accommodation', 'entertainment') NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    costPrice DECIMAL(10, 2) NOT NULL,
    stock DECIMAL(10, 2) NOT NULL DEFAULT 0,
    minStockLevel DECIMAL(10, 2) NOT NULL DEFAULT 5,
    unit VARCHAR(20) NOT NULL DEFAULT 'units',
    image_url TEXT
);

-- 3. Raw Supplies Table
CREATE TABLE IF NOT EXISTS supplies (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    module ENUM('restaurant', 'bar', 'carwash', 'accommodation', 'entertainment') NOT NULL,
    quantity DECIMAL(10, 3) NOT NULL DEFAULT 0,
    unit VARCHAR(20) NOT NULL DEFAULT 'units',
    unitCost DECIMAL(10, 2) NOT NULL DEFAULT 0,
    lastPurchased TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 4. Production Recipes (Consumption Mapping)
CREATE TABLE IF NOT EXISTS recipes (
    productId VARCHAR(50),
    supplyId VARCHAR(50),
    amount DECIMAL(10, 4) NOT NULL,
    PRIMARY KEY (productId, supplyId),
    FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (supplyId) REFERENCES supplies(id) ON DELETE CASCADE
);

-- 5. Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
    id VARCHAR(50) PRIMARY KEY,
    category ENUM('salary', 'utility', 'maintenance', 'rent', 'miscellaneous', 'garbage') NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    description VARCHAR(255),
    date DATE NOT NULL,
    module VARCHAR(50) NOT NULL DEFAULT 'general'
);

-- 6. Transactions (Orders)
CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(50) PRIMARY KEY,
    orderNumber VARCHAR(50) UNIQUE NOT NULL,
    module VARCHAR(50) NOT NULL,
    totalAmount DECIMAL(10, 2) NOT NULL,
    totalCost DECIMAL(10, 2) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    paymentMethod ENUM('cash', 'mpesa', 'card', 'none') NOT NULL,
    status ENUM('paid', 'pending') NOT NULL,
    customerName VARCHAR(100),
    amountReceived DECIMAL(10, 2),
    balance DECIMAL(10, 2)
);

-- 7. Transaction Items
CREATE TABLE IF NOT EXISTS transaction_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transactionId VARCHAR(50),
    productId VARCHAR(50),
    name VARCHAR(100),
    quantity DECIMAL(10, 2),
    price DECIMAL(10, 2),
    costPrice DECIMAL(10, 2),
    total DECIMAL(10, 2),
    FOREIGN KEY (transactionId) REFERENCES transactions(id) ON DELETE CASCADE
);

-- SEED DATA
INSERT INTO users (id, name, email, role, password) VALUES 
('u1', 'Executive Admin', 'admin@wamaghach.com', 'admin', 'admin123'),
('u2', 'POS Staff One', 'staff@wamaghach.com', 'staff', 'staff123');

INSERT INTO products (id, name, description, category, module, price, costPrice, stock, minStockLevel, unit, image_url) VALUES
('r1', 'Nyama Choma (1kg)', 'Prime goat meat grilled to perfection over charcoal.', 'Food', 'restaurant', 1200, 700, 50, 10, 'kg', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80'),
('r2', 'Swahili Pilau', 'Fragrant rice cooked with beef and traditional spices.', 'Food', 'restaurant', 650, 300, 40, 5, 'plates', 'https://images.unsplash.com/photo-1512058560366-cd2427ff5e70?w=800&q=80'),
('b1', 'Tusker Lager', 'Kenyan favorite since 1922.', 'Beer', 'bar', 350, 220, 240, 48, 'bottles', 'https://images.unsplash.com/photo-1518176258769-f227c798150e?w=800&q=80');

INSERT INTO supplies (id, name, category, module, quantity, unit, unitCost) VALUES
('s1', 'Charcoal (Bags)', 'Energy', 'restaurant', 20, 'bags', 1500),
('s3', 'Cooking Oil', 'Ingredients', 'restaurant', 50, 'liters', 200),
('s4', 'Salt', 'Ingredients', 'restaurant', 23, 'kg', 150);

INSERT INTO recipes (productId, supplyId, amount) VALUES
('r1', 's1', 0.05),
('r2', 's3', 0.1),
('r2', 's4', 0.005);
