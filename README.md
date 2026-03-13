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

## 3. Production Deployment (Standalone Folder)

Next.js is configured for `standalone` output. This means that running `npm run build` will create a minimal production bundle.

### a. Deployment Steps
1. **Environment Setup**: Ensure your Node.js version is 20.x or higher.
2. **Database Migration**: Import `schema.sql` into your MySQL database via phpMyAdmin.
3. **Environment Variables**: Configure your `.env` variables or server environment settings.
4. **Build the Project**:
   ```bash
   npm run build
   ```
5. **Prepare for Upload**:
   - The `.next/standalone` folder contains the core application.
   - Copy the `public` folder and `.next/static` folder into the `.next/standalone` folder.
   - On the server, point your Node.js entry point to `server.js` inside the standalone folder.

### b. Shared Hosting (cPanel)
1. Upload the contents of `.next/standalone` to your application root.
2. Set the "Application Startup File" in cPanel to `server.js`.
3. Use a `.htaccess` file to proxy requests to the Node.js port if necessary.

## 4. Operational Features
- **Daily Special Editor**: Update the homepage feature with live previews.
- **Customization Engine**: Manage flavors, sizes, and toppings with premium pricing.
- **Transaction Ledger**: Full lifecycle management of orders (Processing -> Complete).
- **Staff Directory**: Register personnel with role-based authority.