import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(req: Request) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const body = await req.json();
    const { id, orderNumber, module, items, totalAmount, totalCost, paymentMethod, status, customerName, amountReceived, balance } = body;

    // 1. Insert Transaction
    await connection.query(
      'INSERT INTO transactions (id, orderNumber, module, totalAmount, totalCost, paymentMethod, status, customerName, amountReceived, balance) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, orderNumber, module, totalAmount, totalCost, paymentMethod, status, customerName, amountReceived, balance]
    );

    // 2. Process Items
    for (const item of items) {
      // Insert Item Record
      await connection.query(
        'INSERT INTO transaction_items (transactionId, productId, name, quantity, price, costPrice, total) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [id, item.productId, item.name, item.quantity, item.price, item.costPrice, item.total]
      );

      if (status === 'paid') {
        // Update Product Stock
        await connection.query(
          'UPDATE products SET stock = stock - ? WHERE id = ? AND module NOT IN ("carwash", "entertainment")',
          [item.quantity, item.productId]
        );

        // Process Recipes (Raw Supply Deduction)
        const [recipes]: any = await connection.query('SELECT * FROM recipes WHERE productId = ?', [item.productId]);
        for (const recipe of recipes) {
          await connection.query(
            'UPDATE supplies SET quantity = GREATEST(0, quantity - ?) WHERE id = ?',
            [recipe.amount * item.quantity, recipe.supplyId]
          );
        }
      }
    }

    await connection.commit();
    return NextResponse.json({ message: 'Order processed' });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    return NextResponse.json({ message: 'Order failed' }, { status: 500 });
  } finally {
    connection.release();
  }
}
