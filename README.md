# WhiskeDelights Artisanal Bakery | Production System

This high-performance eCommerce and Bakery Management platform is optimized for precision auditing and secure administrative control.

## 1. System Design Principles

- **Atomic Persistence**: All orders are handled via MySQL transactions (InnoDB) to ensure data integrity between order headers and line items. If a line item fails to save, the entire transaction is rolled back.
- **Auditing Optimization**: Administrative views are strictly limited to **5 records per page**. This design choice ensures high-precision auditing of orders and inventory by preventing cognitive overload and data-skipping errors.
- **Security-First API**: All administrative mutations require a valid **JSON Web Token (JWT)**. Sessions are stateless and protected by a robust authentication middleware using Bcrypt hashing for password security.
- **Protocol Enforcement**: The system is designed to run exclusively over **HTTPS** to protect customer data and payment session integrity.

## 2. Production Deployment (cPanel / CloudLinux)

### A. Routing & HTTPS Redirect (403/404 Resolution)
To force HTTPS and prevent 404 errors on deep links (e.g., `/admin/portal/dashboard`), ensure your application root contains a `.htaccess` file with the following rules:

```apache
# Force HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Standard cPanel Node.js Proxy Rewrite
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /server.js [L]

# CloudLinux/LiteSpeed Environment Variables
<IfModule Litespeed>
  SetEnv DB_HOST localhost
  SetEnv DB_USER gledcapi_whiskedelight
  SetEnv DB_DATABASE gledcapi_whiskedelight
  SetEnv DB_PASSWORD KJfaAahFykuuL3k692FW
  SetEnv JWT_SECRET pk_live_8d9017d3458e0213efd55c219527b9171482e87d3efd55c219527b9171482e87d
  SetEnv NEXT_PUBLIC_API_URL https://whiskedelights.co.ke/api
</IfModule>
```

### B. Database Initialization
1. Open **phpMyAdmin**.
2. Select your database: `gledcapi_whiskedelight`.
3. Go to the **Import** tab and upload the `schema.sql` file.
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