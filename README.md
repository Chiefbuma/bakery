
# Wamaghach Kahua-ini Hotel | Management System

Premium Hotel Management, POS, and Inventory System for production deployment.

## Production Setup (Shared Hosting)

1. **Database**: 
   - Login to phpMyAdmin.
   - Import the `schema.sql` file located in the root directory. This creates all tables and initial restaurant data.

2. **Environment Variables**:
   Ensure the following are set in your Node.js Selector panel:
   - `DB_HOST`: localhost (or your server IP)
   - `DB_USER`: gledcapi_hotel
   - `DB_PASSWORD`: CnhXfEpdkH2nUQME6xks
   - `DB_DATABASE`: gledcapi_hotel
   - `DB_PORT`: 3306
   - `JWT_SECRET`: pk_live_8d9017d3458e0213efd55c219527b9171482e87d
   - `NEXT_PUBLIC_API_URL`: https://kahua-ini.gle360dcapital.africa/api
   - `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`: pk_live_8d9017d3458e0213efd55c219527b9171482e87d

3. **Build**:
   - Run `npm run build`. 
   - This project is configured for `output: 'standalone'`.
   - Upload the `.next/standalone` folder content to your server root.
   - Upload the `.next/static` folder to `.next/static` on your server.
   - Upload the `public` folder.

## Modules
- **POS Terminal**: Real-time sales with M-Pesa integration.
- **Inventory Control**: Master Stock and Raw Supplies management.
- **Production Recipes**: Map sellable items to raw material consumption.
- **Analytics Dashboard**: Comprehensive P&L tracking and growth metrics.
- **Operating Expenses**: Ledger for salaries, utilities, and rent.
