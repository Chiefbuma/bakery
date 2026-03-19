
# WhiskeDelights Artisanal Bakery | Production Deployment

This high-performance eCommerce and Bakery Management platform is optimized for **Phusion Passenger** environments.

## 1. Protocol & Routing Resolution (The 404/403 Fix)

If your app works on `http` but returns a **404 Not Found** on `https`, or shows a **403 Forbidden** error, follow these steps:

### The Solution (.htaccess):
Update your root `.htaccess` with these specific rules to force HTTPS and enable virtual routing for Next.js.

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

# 1. Force HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# 2. Prevent directory listing (Fixes 403 Forbidden)
Options -Indexes

# 3. Route all virtual paths to Passenger (Fixes 404 on Refresh/HTTPS)
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

## 2. Database Initialization
1. Open **phpMyAdmin**.
2. Select your database: `gledcapi_whiskedelight`.
3. Go to the **Import** tab.
4. Upload and execute the `schema.sql` file provided in the root directory.

## 3. Artisanal Business Rules
- **Deposit**: Mandatory 80% (System Enforced).
- **Lead Time**: Minimum 48 Hours (System Restricted).
- **Primary Pickup**: Nairobi Main Bakery.
- **Style**: Bold Artisanal, No Italics, Mobile Optimized (13px Base).

## 4. Default Credentials
- **Access URL**: `https://whiskedelights.co.ke/admin/login`
- **Email**: `admin@whiskedelights.com`
- **Password**: `admin123`
