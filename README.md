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

## 2. Shared Hosting Upload

This app now builds a ready-to-upload folder at [standalone-deploy](/home/buma/projects/bakery/standalone-deploy) when you run `npm run build`.

Upload the contents of that folder into:

`domains/whiskedelights.co.ke`

Use these shared-hosting settings:

- Application root: `domains/whiskedelights.co.ke`
- Startup file: `server.js`
- Application mode / `NODE_ENV`: `production`
- Passenger log: `/home/whisked1/logs/passenger.log`

Recommended `.htaccess`:

```apache
PassengerAppRoot "/home/whisked1/domains/whiskedelights.co.ke"
PassengerBaseURI "/"
PassengerNodejs "/home/whisked1/nodevenv/domains/whiskedelights.co.ke/20/bin/node"
PassengerAppType node
PassengerStartupFile server.js
PassengerAppEnv production
PassengerFriendlyErrorPages off

RewriteEngine On
RewriteBase /
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

Required production variables:

- `DB_HOST=localhost`
- `DB_PORT=3306`
- `DB_DATABASE=whisked1_whiskedelights`
- `DB_USER=whisked1_whiskedelights`
- `DB_PASSWORD=your_real_password`
- `JWT_SECRET=use_a_long_random_secret`
- `ALLOWED_ORIGINS=https://whiskedelights.co.ke`
- `NEXT_PUBLIC_API_URL=https://whiskedelights.co.ke/api`
- `NEXT_PUBLIC_OWNER_WHATSAPP_NUMBER=254796280138`
- `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_your_real_key`
- `NEXT_PUBLIC_MPESA_BUSINESS_NAME=WhiskeDelights`
- `NEXT_PUBLIC_MPESA_PAYBILL_NUMBER=880100`
- `NEXT_PUBLIC_MPESA_ACCOUNT_NUMBER=908128`

Notes:

- Use the WhatsApp number in international format with no leading zero.
- If your panel shows `0796280138`, convert it to `254796280138` for the app env value.
- If your host uses a different Node binary path, update `PassengerNodejs`.

## 3. Artisanal Business Rules
*   **Deposit**: Mandatory 80% (System Enforced).
*   **Lead Time**: Minimum 48 Hours (System Restricted).
*   **Coordinates**: GPS Latitude and Longitude captured for all delivery auditing.
*   **Branding**: Kenya's Finest Bakery (Primary Hub: Nairobi Main Bakery).
*   **Typography**: Bold, Non-Italicized, 13px Base for Mobile (No Wrap Optimization).

## 4. Environment Setup
Copy [.env.example](/home/buma/projects/bakery/.env.example) to your local env file and provide real values outside version control. Development admin users should be created from env-driven local bootstrap values instead of hardcoded credentials in the repo.
