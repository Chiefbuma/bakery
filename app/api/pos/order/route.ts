
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const body = await req.json();
    
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

    // 1. Record the main transaction
    await connection.query(
      'INSERT INTO transactions (id, orderNumber, module, totalAmount, totalCost, paymentMethod, status, customerName, amountReceived, balance) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [transactionId, orderNumber, module, totalAmount, totalCost, paymentMethod, status, customerName, amountReceived, balance]
    );

    // 2. Process each item for stock and recipe deduction
    for (const item of items) {
      if (!item.productId) continue;

      await connection.query(
        'INSERT INTO transaction_items (transactionId, productId, name, quantity, price, costPrice, total) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [transactionId, item.productId, item.name, item.quantity, item.price, item.costPrice, item.total]
      );

      // Only deduct stock if payment is completed
      if (status === 'paid') {
        // A. Deduct from Master Stock (Sellable Product)
        await connection.query(
          'UPDATE products SET stock = GREATEST(0, stock - ?) WHERE id = ?',
          [item.quantity, item.productId]
        );

        // B. Deduct from Raw Supplies (Ingredients via Recipe)
        const [recipes]: any = await connection.query(
          'SELECT supplyId, amount FROM recipes WHERE productId = ?', 
          [item.productId]
        );
        
        if (Array.isArray(recipes)) {
          for (const recipe of recipes) {
            // Deduct: (Amount per unit * Quantity sold)
            await connection.query(
              'UPDATE supplies SET quantity = GREATEST(0, quantity - ?) WHERE id = ?',
              [Number(recipe.amount) * Number(item.quantity), recipe.supplyId]
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
