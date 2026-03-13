# WhiskeDelights: Production Documentation

This document provides the technical requirements and deployment steps for the WhiskeDelights Artisanal Bakery system.

## 1. System Architecture
- **Framework**: Next.js 15 (App Router)
- **Database**: MySQL 8.0 (Atomic transactions for order integrity)
- **Auth**: JWT (JSON Web Tokens) with Bcrypt hashing
- **UI**: Tailwind CSS + ShadCN (Optimized for 5-record auditing views)

## 2. Database Setup
1. Import the provided `schema.sql` into your MySQL database (via phpMyAdmin or CLI).
2. The schema includes optimized indexes for high-precision auditing of orders and inventory.
3. **Default Admin Credentials**:
   - **Email**: `admin@whiskedelights.com`
   - **Password**: `admin123`

## 3. Deployment (cPanel / Shared Hosting)
1. Run `npm run build` to generate the `.next/standalone` folder.
2. Upload the contents of `.next/standalone` to your server.
3. Configure your environment variables in the Node.js setup panel.
4. Set the startup file to `server.js`.

## 4. Environment Variables (.env)
```bash
NEXT_PUBLIC_API_URL=https://your-domain.com/api
DB_HOST=localhost
DB_DATABASE=your_db_name
DB_USER=your_db_user
DB_PASSWORD=your_db_password
JWT_SECRET=your_long_random_string
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=your_paystack_key
```

## 5. Security Principles
- **Protected APIs**: All administrative routes (`/api/cakes`, `/api/orders`, `/api/users`) require a valid JWT.
- **Data Sanitization**: All inputs are validated; passwords are never stored in plain text.
- **Standalone Mode**: The production build excludes source code and dev dependencies for a smaller, more secure footprint.
