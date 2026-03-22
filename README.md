# WhiskeDelights Kenya | Production Deployment Guide

High-performance Artisanal Bakery Management platform optimized for **Next.js 15** and **Phusion Passenger**.

## 1. Security Architecture (Against Attacks)

The platform is hardened with several layers of protection:

*   **SQL Injection (SQLi)**: All database interactions use **Prepared Statements**. By separating SQL queries from user data (using `pool.query(sql, [params])`), the system ensures that user input is never executed as code.
*   **CSRF/Hijacking Protection**:
    *   **JWT Authentication**: Administrative API routes require a valid **JSON Web Token**. JWTs are resistant to CSRF because they aren't automatically sent by browsers in cross-site requests.
    *   **Origin Verification**: The system verifies the `Origin` and `Referer` headers to ensure requests only originate from `whiskedelights.co.ke`.
*   **DDoS Mitigation**:
    *   **Payload Validation**: Input data is sanitized via **Zod Schemas** before processing. This rejects malformed or oversized payloads at the network boundary.
    *   **Security Headers**: Hardened headers (CSP, HSTS, X-Frame-Options) prevent clickjacking and unauthorized script injection.
*   **Brute Force Protection**: Passwords are hashed using **Bcrypt** with high salt rounds, and sensitive endpoints are subject to rate limiting.

## 2. Server Routing & Protocol (.htaccess)

If you encounter **404 Not Found** on HTTPS or refreshing pages, update your `.htaccess`:

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

# 2. Virtual Route Pass-through
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /server.js [L]

# --- ENVIRONMENT VARIABLES ---
<IfModule Litespeed>
  SetEnv DB_HOST localhost
  SetEnv DB_USER gledcapi_whiskedelights
  SetEnv DB_DATABASE gledcapi_whiskedelights
  SetEnv DB_PASSWORD CnhXfEpdkH2nUQME6xks
  SetEnv NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY pk_live_8d9017d3458e0213efd55c219527b9171482e87d
</IfModule>
```

## 3. Artisanal Business Rules
*   **Deposit**: Mandatory 80% (System Enforced).
*   **Lead Time**: Minimum 48 Hours (System Restricted).
*   **Coordinates**: Latitude and Longitude captured for all delivery auditing.
*   **Branding**: Kenya's Finest Bakery (Primary Pickup: Nairobi Main Bakery).
*   **Typography**: Bold, Non-Italicized, 13px Base for Mobile.

## 4. Default Admin Credentials
*   **URL**: `https://whiskedelights.co.ke/admin/login`
*   **Email**: `admin@whiskedelights.com`
*   **Access Key**: `admin123`
