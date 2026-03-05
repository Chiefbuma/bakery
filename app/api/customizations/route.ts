
import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
/**
 * Legacy Customization API (Neutralized)
 */
export async function GET() { return new NextResponse(null, { status: 410 }); }
