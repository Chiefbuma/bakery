# WhiskeDelights Artisanal Bakery | Production System

This high-performance eCommerce and Bakery Management platform is optimized for precision auditing and secure administrative control.

## 1. System Design Principles

- **Atomic Persistence**: All orders are handled via MySQL transactions (InnoDB) to ensure data integrity between order headers and line items. If a line item fails to save, the entire transaction is rolled back.
- **Auditing Optimization**: Administrative views are strictly limited to **5 records per page**. This design choice ensures high-precision auditing of orders and inventory by preventing cognitive overload and data-skipping errors.
- **Security-First API**: All administrative mutations require a valid **JSON Web Token (JWT)**. Sessions are stateless and protected by a robust authentication middleware using Bcrypt hashing for password security.
- **Protocol Enforcement**: The system is designed to run exclusively over **HTTPS** to protect customer data and payment session integrity.

## 2. Production Deployment (cPanel / CloudLinux)

### A. Routing & HTTPS Redirect (403/404 Resolution)
To force HTTPS and prevent 403/404 errors on deep links (e.g., `/admin/portal/dashboard`), your `.htaccess` file MUST contain these specific rewrite rules. Replace the Passenger paths with your specific server paths.

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
  SetEnv DB_PASSWORD KJfaAahFykuuL3k692FW
  SetEnv JWT_SECRET your_secure_jwt_secret_here
  SetEnv NEXT_PUBLIC_API_URL /api
</IfModule>
```

### B. Database Initialization
1. Open **phpMyAdmin**.
2. Select your database: `gledcapi_whiskedelight`.
3. Go to the **Import** tab and upload the `schema.sql` file provided in this repository.
4. This will create all required tables and initialize the primary admin account.

### C. Default Credentials
- **Access URL**: `https://whiskedelights.co.ke/admin/login`
- **Email**: `admin@whiskedelights.com`
- **Password**: `admin123`

## 3. Build & Standalone Output
To generate the production bundle:
1. Run `npm run build`.
2. The output is generated in `.next/standalone`.
3. Upload the contents of `.next/standalone` along with the `public` and `.next/static` folders to your server.
