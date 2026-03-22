# WhiskeDelights: Production Configuration

This platform is optimized for **Phusion Passenger** environments and requires specific database schema initialization for geolocation and artisanal auditing.

## 1. Security & Protocol (Fixes 404/403)

Update your root `.htaccess` to force HTTPS and enable virtual routing for Next.js. This also includes the environment variables required for the Paystack Gateway and WhatsApp API.

```apache
# --- PASSENGER CONFIGURATION ---
PassengerAppRoot "/home/whisked1/domains/whiskedelights.co.ke"
PassengerBaseURI "/"
PassengerNodejs "/home/whisked1/nodevenv/domains/whiskedelights.co.ke/20/bin/node"
PassengerAppType node
PassengerStartupFile server.js
PassengerAppEnv production

# --- FORCE HTTPS & VIRTUAL ROUTING ---
RewriteEngine On
RewriteBase /
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
Options -Indexes
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /server.js [L]

# --- ENVIRONMENT VARIABLES ---
<IfModule Litespeed>
  SetEnv DB_HOST localhost
  SetEnv DB_USER whisked1_whiskedelight
  SetEnv DB_DATABASE whisked1_whiskedelight
  SetEnv DB_PASSWORD 65Sz2FRzhWeP47wJ8RbK
  SetEnv JWT_SECRET 65Sz2FRzhWeP47wJ8RbK
  SetEnv NEXT_PUBLIC_API_URL https://whiskedelights.co.ke/api
  SetEnv NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY pk_live_8d9017d3458e0213efd55c219527b9171482e87d
  SetEnv NEXT_PUBLIC_OWNER_WHATSAPP_NUMBER 0791034492
</IfModule>
```

## 2. Artisanal Business Rules
- **Deposit**: Mandatory 80% to secure artisanal production slots.
- **Lead Time**: Minimum 48-hour (2 days) enforced via system restriction.
- **Pickups**: Nairobi Main Bakery.
- **WhatsApp**: Orders require WhatsApp manifest confirmation to initiate production.
- **Style**: Bold Artisanal, No Italics, Mobile Optimized (13px Base, No Wrap).

## 3. Production Database Schema (Geolocation Support)

Import this schema via **phpMyAdmin** to initialize the system with coordinate support and the signature catalog.

```sql
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

-- Seed Default Admin (admin@whiskedelights.com / admin123)
INSERT IGNORE INTO users (id, name, email, password, role) VALUES ('admin', 'Primary Admin', 'admin@whiskedelights.com', '$2a$10$tM3o7zYhSgQvXqF8ZqEaRe/o/q0Z9h5n/qOqOqOqOqOqOqOqOqOq', 'admin');

-- Seed Artisanal Catalog
INSERT IGNORE INTO cakes (id, name, description, base_price, category, ready_time, rating) VALUES 
('chocolate-truffle', 'Belgian Truffle', 'Dark chocolate ganache with gold leaf.', 3800.00, 'Specialty', '48h', 4.9),
('red-velvet', 'Signature Red Velvet', 'Cream cheese frosting on velvet sponge.', 3200.00, 'Classic', '24h', 4.8),
('vanilla-bean', 'Vanilla Bean Dream', 'Pure Madagascar vanilla bean sponge.', 2800.00, 'Classic', '24h', 4.7);

INSERT IGNORE INTO flavors (name, price, description) VALUES ('Madagascar Vanilla', 0, 'Pure vanilla bean'), ('Belgian Cocoa', 250, 'Rich dark chocolate');
INSERT IGNORE INTO sizes (name, price, serves) VALUES ('Small (6")', 0, '6-8 guests'), ('Medium (8")', 600, '10-12 guests'), ('Large (10")', 1200, '15-20 guests');
INSERT IGNORE INTO colors (name, price, hex_value) VALUES ('Snow White', 0, '#FFFFFF'), ('Deep Rose', 150, '#E91E63');
```
