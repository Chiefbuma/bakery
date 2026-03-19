# WhiskeDelights: Production Configuration

This platform is optimized for **Phusion Passenger** environments and requires specific database schema initialization for geolocation and artisanal auditing.

## 1. Protocol & Routing (Fixes 404/403)

Update your root `.htaccess` to force HTTPS and enable virtual routing for Next.js. This ensures both mobile and desktop browsers can refresh pages without seeing a "Not Found" error.

```apache
# --- PASSENGER CONFIGURATION ---
PassengerAppRoot "/home/gledcapi/domains/whiskedelights.co.ke"
PassengerBaseURI "/"
PassengerNodejs "/home/gledcapi/nodevenv/domains/whiskedelights.co.ke/20/bin/node"
PassengerAppType node
PassengerStartupFile server.js
PassengerAppEnv production
PassengerFriendlyErrorPages off

# --- FORCE HTTPS & VIRTUAL ROUTING ---
RewriteEngine On
RewriteBase /

# 1. Force HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# 2. Prevent directory listing (Fixes 403 Forbidden)
Options -Indexes

# 3. Virtual Route Pass-through
# If the request is NOT a real file and NOT a real directory, send to Passenger (server.js)
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /server.js [L]

# --- ENVIRONMENT VARIABLES ---
<IfModule Litespeed>
  SetEnv DB_HOST localhost
  SetEnv DB_USER gledcapi_whiskedelight
  SetEnv DB_DATABASE gledcapi_whiskedelight
  SetEnv DB_PASSWORD CnhXfEpdkH2nUQME6xks
  SetEnv JWT_SECRET production_secret_6xks_cnhxf
  SetEnv NEXT_PUBLIC_API_URL https://whiskedelights.co.ke/api
  SetEnv NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY pk_live_8d9017d3458e0213efd55c219527b9171482e87d
</IfModule>
```

## 2. Production Database Schema (Geolocation Support)

Import this schema via **phpMyAdmin** to initialize the system with coordinate support and the primary admin account.

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

-- Default Admin Credential: admin@whiskedelights.com / admin123
INSERT IGNORE INTO users (id, name, email, password, role) 
VALUES ('ADMIN_1', 'Master Baker', 'admin@whiskedelights.com', '$2a$10$7zBvY7p0.7zBvY7p0.7zBuK1Gq0X9XzY0ZzY0ZzY0ZzY0ZzY0ZzY0', 'admin');
```

## 3. Artisanal Business Rules
- **Deposit**: Mandatory 80% to secure artisanal time-slots.
- **Lead Time**: Minimum 48-hour (system restricted).
- **Pickups**: Nairobi Main Bakery.
- **Style**: Bold Artisanal, No Italics, Mobile Optimized (No Wraps).