
# WhiskeDelights Artisanal Bakery | Production Management System

A high-performance eCommerce and Bakery Management platform designed for artisanal operations, featuring atomic transaction integrity and secure administrative auditing.

## 1. Production Architecture
The system is built with a decoupled architecture that prioritizes data integrity and security:
- **Frontend**: Next.js 15 (App Router) with React 19.
- **Backend API**: Secure Next.js API Routes serving as a bridge between the React frontend and the MySQL persistence layer.
- **Database**: MySQL 8.0 with optimized indexing on audit-critical columns.

## 2. Design Principles
### Precision Auditing (5-Record Rule)
The administrative portal is strictly standardized to show **5 records per page**. This design principle reduces cognitive load for bakery staff, ensuring every artisanal job is audited with zero errors.

### Security by Isolation
- Administrative routes require a valid JWT via Bearer token.
- Database credentials and API keys are managed exclusively through environment variables.
- Relative API paths are used to prevent CORS preflight blocks.

## 3. Production Deployment
The app is configured for **Standalone Output**. This generates a minimal `.next/standalone` folder containing only the required production files.

### Step-by-Step Deployment:
1. **Database**: Import `schema.sql` into your MySQL database via phpMyAdmin.
2. **Build**: Run `npm run build` locally.
3. **Upload**: Upload the contents of `.next/standalone` to your server's application root.
4. **Environment**: Configure the `.env` variables in your server's Node.js panel.
5. **Static Assets**: Ensure `.next/static` and `public` folders are accessible in the production root.

## 4. Default Admin Access
- **Email**: `admin@whiskedelights.com`
- **Password**: `admin123`

## 5. Environment Configuration
```bash
DB_HOST=localhost
DB_DATABASE=gledcapi_whiskedelights
DB_USER=gledcapi_whiskedelights
DB_PASSWORD=your_secure_password
JWT_SECRET=your_long_random_jwt_secret
NEXT_PUBLIC_API_URL=https://whiskedelights.co.ke/api
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_...
```
