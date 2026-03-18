# WhiskeDelights Artisanal Bakery | Production System

This high-performance eCommerce and Bakery Management platform is optimized for precision auditing and secure administrative control on Phusion Passenger-based hosting environments.

## 1. Protocol & Routing Resolution (The 404 Fix)

If your app works on `http` but returns a **404 Not Found** on `https`, it is because the server is trying to find physical files instead of routing to Node.js. 

### Why the 404 happens on HTTPS:
Apache/LiteSpeed servers treat HTTP and HTTPS as separate entities. Without a "Catch-All" rewrite rule, the server looks for a folder (e.g., `/admin`) on the hard drive. Since your routes are virtual (Next.js), the server fails.

### The Solution (.htaccess):
Update your root `.htaccess` with these specific rules to force HTTPS and enable deep-linking:

```apache
# --- PASSENGER CONFIGURATION ---
PassengerAppRoot "/home/gledcapi/domains/whiskedelights.co.ke"
PassengerBaseURI "/"
PassengerNodejs "/home/gledcapi/nodevenv/domains/whiskedelights.co.ke/20/bin/node"
PassengerAppType node
PassengerStartupFile server.js
PassengerAppEnv production
PassengerFriendlyErrorPages off

# --- FORCE HTTPS & ROUTING ---
RewriteEngine On
RewriteBase /

# 1. Force HTTPS (Prevents protocol mismatch)
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# 2. Prevent directory listing
Options -Indexes

# 3. Route all virtual paths to Passenger (Fixes 404 on Refresh/HTTPS)
# If the request is NOT a real file and NOT a real directory, send to server.js
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

## 2. System Design Principles

- **Atomic Persistence**: All orders are handled via MySQL transactions.
- **Auditing Optimization**: Administrative views are strictly limited to **5 records per page**.
- **Security-First API**: All administrative mutations require a valid JWT.

## 3. Database Initialization
1. Open **phpMyAdmin**.
2. Select your database: `gledcapi_whiskedelight`.
3. Go to the **Import** tab and upload the `schema.sql` file provided in the project root.

## 4. Default Credentials
- **Access URL**: `https://whiskedelights.co.ke/admin/login`
- **Email**: `admin@whiskedelights.com`
- **Password**: `admin123`