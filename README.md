# WhiskeDelights Artisanal Bakery | Production System

A high-performance eCommerce and Bakery Management platform optimized for precision auditing and secure administrative control.

## 1. System Design Principles

- **Atomic Persistence**: All orders are handled via MySQL transactions (InnoDB) to ensure data integrity between order headers and line items. If a line item fails to save, the entire transaction is rolled back.
- **Auditing Optimization**: Administrative views are strictly limited to **5 records per page**. This design choice ensures high-precision auditing of orders and inventory by preventing cognitive overload and data-skipping errors.
- **Security-First API**: All administrative mutations require a valid **JSON Web Token (JWT)**. Sessions are stateless and protected by a robust authentication middleware using Bcrypt hashing for password security.
- **Decoupled Architecture**: Built with Next.js 15 App Router in Standalone mode for minimal server overhead and high scalability.

## 2. Production Deployment (cPanel / CloudLinux)

### A. Routing & Access Fix (403/404 Resolution)
To prevent 404 errors on deep links (e.g., `/admin/portal/dashboard`) and 403 Forbidden errors on mobile devices, ensure your application root contains a `.htaccess` file that proxies virtual routes to the Node.js process:

```apache
# Standard cPanel Node.js Proxy Rewrite
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /server.js [L]

# Environment Variables for LiteSpeed/Apache
<IfModule Litespeed>
  SetEnv DB_HOST localhost
  SetEnv DB_USER gledcapi_whiskedelights
  SetEnv DB_DATABASE gledcapi_whiskedelights
  SetEnv DB_PASSWORD CnhXfEpdkH2nUQME6xks
  SetEnv JWT_SECRET pk_live_8d9017d3458e0213efd55c219527b9171482e87d3efd55c219527b9171482e87d
</IfModule>
```

### B. Database Initialization
1. Open **phpMyAdmin**.
2. Select your database: `gledcapi_whiskedelights`.
3. Go to the **Import** tab and upload the `schema.sql` file located in the root directory.
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
