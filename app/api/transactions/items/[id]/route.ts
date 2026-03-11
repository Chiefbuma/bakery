import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * @fileOverview Transaction Item Level CRUD API
 * Handles individual line item adjustments within an order.
 */

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const connection = await pool.getConnection();
  try {
    const { id } = await params;
    const { quantity, price, total } = await req.json();
    
    await connection.beginTransaction();

    // 1. Get the transaction ID for this item to recalculate later
    const [itemRows]: any = await connection.query('SELECT transactionId FROM transaction_items WHERE id = ?', [id]);
    if (itemRows.length === 0) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }
    const transactionId = itemRows[0].transactionId;

    // 2. Update the item
    await connection.query(
      'UPDATE transaction_items SET quantity = ?, price = ?, total = ? WHERE id = ?',
      [quantity, price, total, id]
    );

    // 3. Recalculate parent transaction totals
    const [newTotals]: any = await connection.query(
      'SELECT SUM(total) as newTotal, SUM(quantity * costPrice) as newCost FROM transaction_items WHERE transactionId = ?',
      [transactionId]
    );
    
    await connection.query(
      'UPDATE transactions SET totalAmount = ?, totalCost = ?, balance = amountReceived - ? WHERE id = ?',
      [newTotals[0].newTotal || 0, newTotals[0].newCost || 0, newTotals[0].newTotal || 0, transactionId]
    );

    await connection.commit();
    return NextResponse.json({ message: 'Line item updated' });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Update Transaction Item Error:', error);
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
  } finally {
    if (connection) connection.release();
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const connection = await pool.getConnection();
  try {
    const { id } = await params;
    
    await connection.beginTransaction();

    const [itemRows]: any = await connection.query('SELECT transactionId FROM transaction_items WHERE id = ?', [id]);
    if (itemRows.length === 0) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }
    const transactionId = itemRows[0].transactionId;

    // 1. Delete item
    await connection.query('DELETE FROM transaction_items WHERE id = ?', [id]);

    // 2. Recalculate parent transaction
    const [newTotals]: any = await connection.query(
      'SELECT SUM(total) as newTotal, SUM(quantity * costPrice) as newCost FROM transaction_items WHERE transactionId = ?',
      [transactionId]
    );
    
    const hasItems = (newTotals[0].newTotal !== null);

    if (!hasItems) {
      // If no items left, maybe delete the transaction or just zero it
      await connection.query(
        'UPDATE transactions SET totalAmount = 0, totalCost = 0, balance = amountReceived WHERE id = ?',
        [transactionId]
      );
    } else {
      await connection.query(
        'UPDATE transactions SET totalAmount = ?, totalCost = ?, balance = amountReceived - ? WHERE id = ?',
        [newTotals[0].newTotal, newTotals[0].newCost, newTotals[0].newTotal, transactionId]
      );
    }

    await connection.commit();
    return NextResponse.json({ message: 'Item removed from order' });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Delete Transaction Item Error:', error);
    return NextResponse.json({ error: "Failed to remove item" }, { status: 500 });
  } finally {
    if (connection) connection.release();
  }
}