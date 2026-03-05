
import { NextResponse } from 'next/server';
/**
 * Legacy Cake Orders endpoint.
 * All hotel transactions are now handled via /api/pos/order
 */
export async function POST() {
  return NextResponse.json({ message: 'Endpoint deprecated' }, { status: 410 });
}
export async function GET() {
  return NextResponse.json([]);
}
