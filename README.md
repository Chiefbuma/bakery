# Wamaghach Kahua-ini Hotel | Enterprise Management System

A production-grade Hotel Management, POS, and Analytics platform designed for multi-departmental operational control.

## 1. System Overview

The Wamaghach system is a full-stack Next.js application designed to centralize operations for a diversified hotel business including Restaurant, Bar, Car Wash, Accommodation, and Entertainment modules.

### Core Technologies
- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS, Shadcn/UI, Framer Motion.
- **Backend**: Next.js API Routes (Serverless ready), Node.js.
- **Database**: MySQL 8.0 (Atomic transactions, relational integrity).
- **Authentication**: JWT (JSON Web Tokens) with Bcrypt password hashing.
- **Payments**: Integrated M-Pesa (via Paystack) and Cash management.

## 2. Business Logic & Workflow

### POS & Inventory Synchronization
- **Strict Stock Control**: The POS terminal validates real-time inventory. Items with zero stock are automatically disabled to prevent over-selling.
- **Recipe-to-COGS Mapping**: Unique "Production Recipes" allow the system to map a sellable product (e.g., Chicken Tikka) to its raw ingredients (e.g., Chicken, Oil, Spices). When a sale occurs, raw supplies are deducted proportionally.
- **Atomic Transactions**: Sales are processed using MySQL transactions. The system ensures the order record is created, inventory is deducted, and line items are saved in a single "all-or-nothing" operation to prevent data corruption.

### Financial Auditing
- **Departmental P&L**: The system calculates "Net Operational Profit" per department by subtracting COGS (calculated via recipes or manual costs) and OpEx (utilities, rent, salaries) from Gross Revenue.
- **MTD (Month-to-Date) Comparison**: The dashboard provides a side-by-side comparative analysis between the current month and the previous month to track growth trends.

## 3. Security Architecture

- **Password Hashing**: All user credentials are encrypted using `bcryptjs` with 10 salt rounds. Plain-text passwords are never stored.
- **Role-Based Access Control (RBAC)**: 
  - `Staff`: Access to POS Terminal and basic operational tools.
  - `Admin`: Full access to Financial Dashboards, Inventory Pricing, User Management, and Transaction Auditing.
- **Asynchronous Integrity**: API routes utilize Next.js 15's `await params` pattern to prevent race conditions and ensure stable parameter resolution.

## 4. Production Setup

1. **Database Deployment**:
   - Create a MySQL database and import the `schema.sql` file provided in the root directory.
2. **Environment Configuration**:
   Set the following variables:
   - `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_DATABASE`, `DB_PORT`
   - `JWT_SECRET`: A long random string for securing session tokens.
   - `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`: For M-Pesa integration.
3. **Build & Start**:
   ```bash
   npm run build
   npm start
   ```

## 5. Performance Optimization

- **Connection Pooling**: Utilizes `mysql2/promise` with a connection pool to handle concurrent requests efficiently.
- **Client-Side Persistence**: The POS cart uses memoized calculations and local persistence to ensure a robust user experience even during network instability.
- **Deep Audit Ledger**: The Orders module supports 5-record pagination and individual line-item CRUD for precise financial management.
