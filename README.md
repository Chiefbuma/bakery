# WhiskeDelights Artisanal Bakery | Production System

This high-performance eCommerce and Bakery Management platform is optimized for precision auditing and secure administrative control.

## 1. System Design Principles

- **Atomic Persistence**: All orders are handled via MySQL transactions to ensure data integrity.
- **Auditing Optimization**: Administrative views are strictly limited to **5 records per page**.
- **Security-First API**: All administrative mutations require a valid **JSON Web Token (JWT)**.
- **Protocol Enforcement**: The system is designed to run exclusively over **HTTPS**.

## 2. Production Deployment (CloudLinux / Passenger)

### A. Routing & HTTPS Redirect (Fixing 404/403 Errors)
To force HTTPS and prevent 404 errors on your application, your `.htaccess` file MUST contain these specific rewrite rules. 

**Recommended .htaccess Configuration:**
```apache
# --- PASSENGER CONFIGURATION ---
PassengerAppRoot "/home/gledcapi/domains/whiskedelights.co.ke"
PassengerBaseURI "/"
PassengerNodejs "/home/gledcapi/nodevenv/domains/whiskedelights.co.ke/20/bin/node"
PassengerAppType node
PassengerStartupFile server.js
PassengerAppEnv production

# --- FORCE HTTPS & ROUTING ---
RewriteEngine On
RewriteBase /

# 1. Force HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# 2. Prevent directory listing (Fixes 403 Forbidden)
Options -Indexes

# 3. Handle App Router deep links (Fixes 404 on Refresh)
RewriteRule ^index\.html$ - [L]
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
  SetEnv NEXT_PUBLIC_API_URL /api
</IfModule>
```

### B. Database Initialization
1. Open **phpMyAdmin**.
2. Select your database: `gledcapi_whiskedelight`.
3. Go to the **Import** tab and upload the `schema.sql` file provided in the project root.
4. This will create all required tables and initialize the primary admin account.

### C. Default Credentials
- **Access URL**: `https://whiskedelights.co.ke/admin/login`
- **Email**: `admin@whiskedelights.com`
- **Password**: `admin123`

## 3. Build & Standalone Output
1. Run `npm run build`.
2. Upload the contents of `.next/standalone`, `public`, and `.next/static` to your server.
