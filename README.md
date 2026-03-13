
# WhiskeDelights Artisanal Bakery | Enterprise Management System

A production-grade eCommerce and Bakery Management platform designed for high-precision artisanal operations.

## 1. System Overview

WhiskeDelights is a full-stack Next.js application built to manage specialized bakery operations, from customer-facing artisanal galleries to internal transaction auditing.

### Core Technology Stack
- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS, Framer Motion.
- **Backend**: Next.js API Routes with secure JWT authentication.
- **Database**: MySQL 8.0 (Relational integrity with atomic transactions).
- **Security**: Bcrypt password hashing and Token-based Auth.
- **Payments**: Integrated Paystack gateway for M-Pesa and Card deposits.

## 2. Architectural Principles

### Atomic Transaction Integrity
The system utilizes MySQL transactions for order placement. This ensures that an order header and its multiple line items are saved in an "all-or-nothing" operation, preventing data corruption during network instability.

### High-Precision Auditing
All administrative modules (**Orders, Catalog, Personnel**) strictly follow a **5-records-per-page** pagination rule. This reduces cognitive load for administrators and ensures every artisanal job is audited with precision.

### Security by Design
- **Authenticated APIs**: Admin routes verify JSON Web Tokens (JWT) before processing data mutations.
- **Credential Protection**: Passwords are never stored in plain text; they use standard Bcrypt hashing with 10 salt rounds.
- **Sanitized I/O**: Input validation prevents SQL injection and cross-site scripting (XSS).

## 3. Production Deployment (Shared Hosting)

1. **Environment Setup**: Ensure your Node.js version is 20.x or higher.
2. **Database Migration**: Import `schema.sql` into your MySQL database via phpMyAdmin.
3. **Environment Variables**:
   - `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_DATABASE`
   - `JWT_SECRET`: A long random string.
   - `NEXT_PUBLIC_API_URL`: Your full domain (e.g., `https://whiskedelights.co.ke/api`).
   - `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`: Your live key.
4. **Build & Standalone**: Run `npm run build`. Upload the `.next/standalone` contents and `.next/static` to your server.

## 4. Operational Features
- **Daily Special Editor**: Update the homepage feature with live previews.
- **Customization Engine**: Manage flavors, sizes, and toppings with premium pricing.
- **Transaction Ledger**: Full lifecycle management of orders (Processing -> Complete).
