import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * @fileOverview Bakery Dashboard Analytics API (Next.js 15)
 * Simplified for WhiskeDelights eCommerce focus.
 */
export async function GET() {
  try {
    // In a real implementation with DB, we would query the orders and cakes tables here.
    // For mock focus, we return a standardized dashboard shape.
    const data = {
      summary: {
        revenue: { current: 125000, previous: 110000, changePercent: 13.6 },
        orders: { current: 45, previous: 38, changePercent: 18.4 },
        customers: { current: 320, previous: 290, changePercent: 10.3 },
        growth: { current: 85, previous: 72, changePercent: 18 }
      },
      recentActivity: [],
      period: 'Monthly Overview'
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error('Bakery Dashboard Error:', error);
    return NextResponse.json({ error: "Failed to load bakery analytics" }, { status: 500 });
  }
}
