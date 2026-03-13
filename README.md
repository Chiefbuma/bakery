
# WhiskeDelights Artisanal Bakery | Production System

A high-performance eCommerce and Bakery Management platform optimized for precision auditing and secure administrative control.

## 1. System Design Principles
- **Atomic Persistence**: All orders are handled via MySQL transactions to ensure data integrity between headers and line items.
- **Auditing Optimization**: Administrative views are strictly limited to 5 records per page to prevent cognitive overload and ensure high-precision auditing.
- **Security-First API**: All mutations require a valid JWT (JSON Web Token) and are protected by a production-grade verification layer.
- **Decoupled Architecture**: Built with Next.js 15 App Router, utilizing standalone builds for minimal server overhead.

## 2. Production Deployment (cPanel / Shared Hosting)

### A. Routing & Access Fix (403/404 Resolution)
To prevent 404 errors on deep links and 403 Forbidden errors on mobile, ensure your application root contains a `.htaccess` file with the following configuration. This proxies all client-side routes to the Node.js process:

```apache
# Standard cPanel Node.js Proxy Rewrite
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /server.js [L]
```

*Note: Ensure the "Startup File" in your cPanel Node.js selector is set to `server.js`.*

### B. Database Initialization
1. Open **phpMyAdmin**.
2. Select database: `gledcapi_whiskedelights`.
3. Go to the **Import** tab and upload the provided `schema.sql`.
4. This initializes all tables and the primary admin account.

### C. Default Credentials
- **Access URL**: `https://whiskedelights.co.ke/admin/login`
- **Email**: `admin@whiskedelights.com`
- **Password**: `admin123`

## 3. Environment Variables
Ensure these are set in your cPanel Environment Variables panel:
```bash
DB_HOST=localhost
DB_DATABASE=gledcapi_whiskedelights
DB_USER=gledcapi_whiskedelights
DB_PASSWORD=your_secure_password
JWT_SECRET=your_long_random_jwt_secret
NEXT_PUBLIC_API_URL=https://whiskedelights.co.ke/api
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_...
```
