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
    let calculatedTotalTransactionCost = 0;

    // Process each item to calculate true COGS at moment of sale
    for (const item of items) {
      if (!item.productId) continue;

      // Fetch product cost profile
      const [products]: any = await connection.query('SELECT hasRecipe, costPrice FROM products WHERE id = ?', [item.productId]);
      const product = products[0];
      
      if (!product) {
          console.error(`Product not found: ${item.productId}`);
          continue;
      }

      let unitCostSnapshot = 0;

      if (product.hasRecipe === 1 || product.hasRecipe === true) {
        // Calculate cost from current ingredient unit costs
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
        // Use fixed retail cost
        unitCostSnapshot = Number(product.costPrice || 0);
      }

      const totalItemCost = Number((unitCostSnapshot * Number(item.quantity)).toFixed(2));
      calculatedTotalTransactionCost += totalItemCost;

      // Record item with the cost snapshot
      await connection.query(
        'INSERT INTO transaction_items (transactionId, productId, name, quantity, price, costPrice, total) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [transactionId, item.productId, item.name, item.quantity, item.price, unitCostSnapshot, item.total]
      );

      // Inventory deduction (only if paid)
      if (status === 'paid') {
        // Master Stock
        await connection.query(
          'UPDATE products SET stock = GREATEST(0, stock - ?) WHERE id = ?',
          [item.quantity, item.productId]
        );

        // Ingredient Stock
        if (product.hasRecipe === 1 || product.hasRecipe === true) {
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

    // Record the main transaction with true calculated total cost
    await connection.query(
      'INSERT INTO transactions (id, orderNumber, module, totalAmount, totalCost, paymentMethod, status, customerName, amountReceived, balance) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [transactionId, orderNumber, module, totalAmount, calculatedTotalTransactionCost, paymentMethod, status, customerName, amountReceived, balance]
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
