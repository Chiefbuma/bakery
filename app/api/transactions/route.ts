import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [transactions]: any = await pool.query('SELECT * FROM transactions ORDER BY timestamp DESC');
    
    // Fetch items for each transaction
    for (const tx of transactions) {
      const [items] = await pool.query('SELECT * FROM transaction_items WHERE transactionId = ?', [tx.id]);
      tx.items = items;
    }
    
    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Fetch Transactions Error:', error);
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { ids } = await req.json();
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "No IDs provided" }, { status: 400 });
    }
    
    // Deleting items first is handled by foreign keys or manual cascade
    await pool.query('DELETE FROM transaction_items WHERE transactionId IN (?)', [ids]);
    await pool.query('DELETE FROM transactions WHERE id IN (?)', [ids]);
    
    return NextResponse.json({ message: "Transactions deleted" });
  } catch (error) {
    console.error('Bulk Delete Error:', error);
    return NextResponse.json({ error: "Database error during deletion" }, { status: 500 });
  }
}