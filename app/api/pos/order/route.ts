
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * Transactional Order Processing API.
 * Ensures data consistency across sales, stock, and raw supplies.
 */
export async function POST(req: Request) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const body = await req.json();
    
    // Defensive extraction
    const { 
      orderNumber, 
      module = 'general', 
      items = [], 
      totalAmount = 0, 
      totalCost = 0, 
      paymentMethod = 'none', 
      status = 'pending', 
      customerName = 'Guest', 
      amountReceived = 0, 
      balance = 0 
    } = body;
    
    const transactionId = `TX-${Date.now()}`;

    // 1. Record the base transaction
    await connection.query(
      'INSERT INTO transactions (id, orderNumber, module, totalAmount, totalCost, paymentMethod, status, customerName, amountReceived, balance) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [transactionId, orderNumber, module, totalAmount, totalCost, paymentMethod, status, customerName, amountReceived, balance]
    );

    // 2. Atomic Inventory Updates
    for (const item of items) {
      if (!item.productId) continue;

      // Record item sale
      await connection.query(
        'INSERT INTO transaction_items (transactionId, productId, name, quantity, price, costPrice, total) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [transactionId, item.productId, item.name, item.quantity, item.price, item.costPrice, item.total]
      );

      // Inventory deductions (Only if paid)
      if (status === 'paid') {
        // A. Deduct Master Stock
        await connection.query(
          'UPDATE products SET stock = GREATEST(0, stock - ?) WHERE id = ? AND module NOT IN ("carwash", "entertainment", "accommodation")',
          [item.quantity, item.productId]
        );

        // B. Process Consumption Recipes
        const [recipes]: any = await connection.query(
          'SELECT supplyId, amount FROM recipes WHERE productId = ?', 
          [item.productId]
        );
        
        if (Array.isArray(recipes)) {
          for (const recipe of recipes) {
            await connection.query(
              'UPDATE supplies SET quantity = GREATEST(0, quantity - ?) WHERE id = ?',
              [recipe.amount * item.quantity, recipe.supplyId]
            );
          }
        }
      }
    }

    await connection.commit();
    return NextResponse.json({ id: transactionId, orderNumber, status: 'success' });
  } catch (error: any) {
    if (connection) await connection.rollback();
    console.error('POS Engine Error:', error);
    return NextResponse.json({ error: error.message || "Atomic transaction failed" }, { status: 500 });
  } finally {
    if (connection) connection.release();
  }
}
