
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * @fileOverview Atomic POS Transaction Engine
 * Standardized for Next.js 15 and MySQL transaction integrity.
 */
export async function POST(req: Request) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const body = await req.json();
    
    const { 
      orderNumber, 
      module = 'restaurant', 
      items = [], 
      totalAmount = 0, 
      paymentMethod = 'none', 
      status = 'pending', 
      customerName = 'Guest', 
      amountReceived = 0, 
      balance = 0 
    } = body;
    
    const transactionId = `TX-${Date.now()}`;
    let calculatedTotalTransactionCost = 0;
    const itemsToProcess = [];

    // 1. Snapshot costs and validate products
    for (const item of items) {
      if (!item.productId) continue;

      const [products]: any = await connection.query('SELECT hasRecipe, costPrice FROM products WHERE id = ?', [item.productId]);
      const product = products[0];
      
      if (!product) continue;

      let unitCostSnapshot = 0;

      if (product.hasRecipe === 1 || product.hasRecipe === true) {
        // Production: Sum ingredient costs
        const [ingredients]: any = await connection.query(`
          SELECT r.amount, s.unitCost 
          FROM recipes r 
          JOIN supplies s ON r.supplyId = s.id 
          WHERE r.productId = ?
        `, [item.productId]);
        
        unitCostSnapshot = ingredients.reduce((acc: number, ing: any) => {
            return acc + (Number(ing.amount) * Number(ing.unitCost));
        }, 0);
      } else {
        // Retail: Use manual cost
        unitCostSnapshot = Number(product.costPrice || 0);
      }

      const totalItemCost = Number((unitCostSnapshot * Number(item.quantity)).toFixed(2));
      calculatedTotalTransactionCost += totalItemCost;

      itemsToProcess.push({
        ...item,
        unitCostSnapshot,
        totalItemCost,
        hasRecipe: !!product.hasRecipe
      });
    }

    // 2. CRITICAL: Insert Parent record FIRST to satisfy Foreign Key constraints
    await connection.query(
      'INSERT INTO transactions (id, orderNumber, module, totalAmount, totalCost, paymentMethod, status, customerName, amountReceived, balance) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [transactionId, orderNumber, module, totalAmount, calculatedTotalTransactionCost, paymentMethod, status, customerName, amountReceived, balance]
    );

    // 3. Insert Child items and update stock
    for (const processedItem of itemsToProcess) {
      await connection.query(
        'INSERT INTO transaction_items (transactionId, productId, name, quantity, price, costPrice, total) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [transactionId, processedItem.productId, processedItem.name, processedItem.quantity, processedItem.price, processedItem.unitCostSnapshot, processedItem.total]
      );

      if (status === 'paid') {
        // Deduct product stock
        await connection.query('UPDATE products SET stock = stock - ? WHERE id = ?', [processedItem.quantity, processedItem.productId]);

        // Deduct ingredient stock if production item
        if (processedItem.hasRecipe) {
          const [recipes]: any = await connection.query('SELECT supplyId, amount FROM recipes WHERE productId = ?', [processedItem.productId]);
          for (const recipe of recipes) {
            await connection.query('UPDATE supplies SET quantity = quantity - ? WHERE id = ?', [Number(recipe.amount) * Number(processedItem.quantity), recipe.supplyId]);
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
