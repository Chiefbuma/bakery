# WhiskeDelights Artisanal Bakery | Production Management System

A high-performance eCommerce and Bakery Management platform designed for artisanal operations, featuring atomic transaction integrity and secure administrative auditing.

## 1. Production Architecture
The system is built with a decoupled architecture that prioritizes data integrity and security:
- **Frontend**: Next.js 15 (App Router) with React 19.
- **Backend API**: Secure Next.js API Routes serving as a bridge between the React frontend and the MySQL persistence layer.
- **Database**: MySQL 8.0 with optimized indexing on audit-critical columns (`order_status`, `created_at`).

## 2. Shared Hosting Deployment (cPanel)
To prevent 404 errors on mobile and ensure nested routes work correctly, follow these steps:

### A. Standalone Build
1. Run `npm run build` locally.
2. The `.next/standalone` folder is your production package.

### B. Routing Fix (Apache/LiteSpeed)
If your server uses Apache (standard for cPanel), ensure you have a `.htaccess` file in your application root (where `server.js` is) with the following content to proxy all requests to the Node.js process:
```apache
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.js [L]
```
*Note: Most cPanel Node.js setups handle this automatically through the "Application Manager". If you see a 404 on mobile, ensure your "Application URL" in cPanel is set to use HTTPS if your SSL is active.*

## 3. Database Initialization
1. Open **phpMyAdmin**.
2. Select your database: `gledcapi_whiskedelights`.
3. Click the **Import** tab.
4. Upload the provided `schema.sql` file.
5. This initializes all tables and the default admin user.

## 4. Default Admin Access
- **Email**: `admin@whiskedelights.com`
- **Password**: `admin123`

## 5. Environment Configuration
Ensure your cPanel Environment Variables match your database and Paystack keys exactly.
```bash
DB_HOST=localhost
DB_DATABASE=gledcapi_whiskedelights
DB_USER=gledcapi_whiskedelights
DB_PASSWORD=your_secure_password
JWT_SECRET=your_long_random_jwt_secret
NEXT_PUBLIC_API_URL=https://whiskedelights.co.ke/api
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_...
```
