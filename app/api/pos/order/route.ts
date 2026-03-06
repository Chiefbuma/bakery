
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
      paymentMethod = 'none', 
      status = 'pending', 
      customerName = 'Guest', 
      amountReceived = 0, 
      balance = 0 
    } = body;
    
    const transactionId = `TX-${Date.now()}`;
    let calculatedTotalCost = 0;

    // 1. Process each item for stock and true cost calculation
    for (const item of items) {
      if (!item.productId) continue;

      // Fetch product to check if it has a recipe
      const [products]: any = await connection.query('SELECT hasRecipe, costPrice FROM products WHERE id = ?', [item.productId]);
      const product = products[0];
      
      let itemCost = 0;

      if (product.hasRecipe) {
        // A. Calculate ingredient cost dynamically
        const [ingredients]: any = await connection.query(`
          SELECT r.amount, s.unitCost 
          FROM recipes r 
          JOIN supplies s ON r.supplyId = s.id 
          WHERE r.productId = ?
        `, [item.productId]);
        
        itemCost = ingredients.reduce((acc: number, ing: any) => acc + (Number(ing.amount) * Number(ing.unitCost)), 0);
      } else {
        // B. Use fixed retail cost
        itemCost = Number(product.costPrice || 0);
      }

      const totalItemCost = itemCost * Number(item.quantity);
      calculatedTotalCost += totalItemCost;

      // Record transaction item
      await connection.query(
        'INSERT INTO transaction_items (transactionId, productId, name, quantity, price, costPrice, total) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [transactionId, item.productId, item.name, item.quantity, item.price, itemCost, item.total]
      );

      // Only deduct stock if payment is completed
      if (status === 'paid') {
        // Deduct from Master Stock
        await connection.query(
          'UPDATE products SET stock = GREATEST(0, stock - ?) WHERE id = ?',
          [item.quantity, item.productId]
        );

        // Deduct from Raw Supplies via Recipe
        if (product.hasRecipe) {
          const [recipes]: any = await connection.query('SELECT supplyId, amount FROM recipes WHERE productId = ?', [item.productId]);
          for (const recipe of recipes) {
            await connection.query(
              'UPDATE supplies SET quantity = GREATEST(0, quantity - ?) WHERE id = ?',
              [Number(recipe.amount) * Number(item.quantity), recipe.supplyId]
            );
          }
        }
      }
    }

    // 2. Record the main transaction with the true calculated cost
    await connection.query(
      'INSERT INTO transactions (id, orderNumber, module, totalAmount, totalCost, paymentMethod, status, customerName, amountReceived, balance) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [transactionId, orderNumber, module, totalAmount, calculatedTotalCost, paymentMethod, status, customerName, amountReceived, balance]
    );

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
