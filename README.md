
# WhiskeDelights Artisanal Bakery | Production System

A high-performance eCommerce and Bakery Management platform optimized for precision auditing and secure administrative control.

## 1. System Design Principles

- **Atomic Persistence**: All orders are handled via MySQL transactions to ensure data integrity between headers and line items. If a line item fails, the entire transaction is rolled back.
- **Auditing Optimization**: Administrative views are strictly limited to **5 records per page**. This design choice ensures high-precision auditing of orders and inventory by preventing cognitive overload.
- **Security-First API**: All mutations require a valid **JWT (JSON Web Token)**. Administrative sessions are stateless and protected by an authentication middleware.
- **Decoupled Architecture**: Built with Next.js 15 App Router, utilizing standalone builds for minimal server overhead and high scalability.

## 2. Production Deployment (cPanel / CloudLinux)

### A. Routing & Access Fix (403/404 Resolution)
To prevent 404 errors on deep links (like `/admin/portal/dashboard`) and 403 Forbidden errors on mobile devices, you must ensure your application root contains a `.htaccess` file that proxies all client-side routes to the Node.js process:

```apache
# Standard cPanel Node.js Proxy Rewrite
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /server.js [L]
```

*Note: In cPanel "Setup Node.js App", ensure the "Startup File" is set to `server.js`.*

### B. Database Initialization
1. Open **phpMyAdmin**.
2. Select your database: `gledcapi_whiskedelights`.
3. Go to the **Import** tab and upload the provided `schema.sql`.
4. This initializes all tables and the primary admin account.

### C. Default Credentials
- **Access URL**: `https://whiskedelights.co.ke/admin/login`
- **Email**: `admin@whiskedelights.com`
- **Password**: `admin123`

## 3. Environment Variables
Ensure these are set in your Environment Variables panel:
```bash
DB_HOST=localhost
DB_DATABASE=gledcapi_whiskedelights
DB_USER=gledcapi_whiskedelights
DB_PASSWORD=your_secure_password
JWT_SECRET=your_long_random_jwt_secret
NEXT_PUBLIC_API_URL=/api
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_...
```
