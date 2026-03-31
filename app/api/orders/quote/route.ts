import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getClientIp } from '@/lib/auth-utils';
import { checkRateLimit } from '@/lib/rate-limit';
import { OrderPricingError, OrderRequestSchema, priceOrder } from '@/lib/order-pricing';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const rateLimit = checkRateLimit({
      key: `order:quote:${getClientIp(req)}`,
      limit: 20,
      windowMs: 60 * 1000,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body = await req.json();
    const validation = OrderRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid payload structure', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const quote = await priceOrder(pool, validation.data.items);
    return NextResponse.json(quote);
  } catch (error) {
    if (error instanceof OrderPricingError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error('[ORDER_QUOTE_ERROR]', error);
    return NextResponse.json({ error: 'Unable to quote order' }, { status: 500 });
  }
}
