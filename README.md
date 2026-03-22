# WhiskeDelights Kenya | Production Deployment & Security Guide

High-performance Artisanal Bakery Management platform optimized for **Next.js 15** and **Phusion Passenger**.

## 1. Security Architecture (Against Attacks)

The platform is hardened with several layers of protection to ensure data integrity and prevent unauthorized access:

*   **SQL Injection (SQLi) Prevention**: 
    All database interactions across the entire system use **Prepared Statements** (parameterized queries) via the `mysql2` pool. By separating the SQL logic from user-provided data, the system ensures that malicious input is always treated as literal text and never executed as code.
*   **CSRF & Hijacking Protection**:
    *   **Stateless JWT Authentication**: Administrative API routes require a valid **JSON Web Token**. JWTs are resistant to CSRF because they are not automatically sent by browsers in cross-site requests.
    *   **Origin & Referer Verification**: The system verifies the `Origin` and `Referer` headers for sensitive actions to ensure requests only originate from the authorized domain (`whiskedelights.co.ke`).
*   **DDoS & Malformed Payload Mitigation**:
    *   **Zod Schema Validation**: Every incoming request payload (Orders, Auth, Catalog edits) is sanitized and validated via **Zod Schemas**. This rejects malformed, oversized, or malicious payloads at the network boundary before they reach the database.
    *   **Security Headers**: We inject strict headers (CSP, HSTS, X-Frame-Options) via `next.config.ts` to prevent Clickjacking, MIME-sniffing, and Cross-Site Scripting (XSS).
*   **Encrypted Storage**: Administrative passwords are never stored in plain text. We utilize **Bcrypt** with high salt rounds for secure hashing.

## 2. Server Routing & Protocol (.htaccess)

If you encounter **404 Not Found** on HTTPS or when refreshing pages, update your `.htaccess` to enable virtual routing:

```apache
# --- PASSENGER CONFIGURATION ---
PassengerAppRoot "/home/whisked1/domains/whiskedelights.co.ke"
PassengerBaseURI "/"
PassengerNodejs "/home/whisked1/nodevenv/domains/whiskedelights.co.ke/20/bin/node"
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
  SetEnv DB_USER whisked1_whiskedelight
  SetEnv DB_DATABASE whisked1_whiskedelight
  SetEnv DB_PASSWORD 65Sz2FRzhWeP47wJ8RbK
  SetEnv NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY pk_live_8d9017d3458e0213efd55c219527b9171482e87d
  SetEnv NEXT_PUBLIC_OWNER_WHATSAPP_NUMBER 0791034492
</IfModule>
```

## 3. Artisanal Business Rules
*   **Deposit**: Mandatory 80% (System Enforced).
*   **Lead Time**: Minimum 48 Hours (System Restricted).
*   **Coordinates**: GPS Latitude and Longitude captured for all delivery auditing.
*   **Branding**: Kenya's Finest Bakery (Primary Hub: Nairobi Main Bakery).
*   **Typography**: Bold, Non-Italicized, 13px Base for Mobile (No Wrap Optimization).

## 4. Default Admin Credentials
*   **URL**: `https://whiskedelights.co.ke/admin/login`
*   **Email**: `admin@whiskedelights.com`
*   **Access Key**: `admin123`
