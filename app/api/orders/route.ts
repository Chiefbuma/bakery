
import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
/**
 * Legacy Orders API (Neutralized)
 */
export async function GET() { return new NextResponse(null, { status: 410 }); }
export async function POST() { return new NextResponse(null, { status: 410 }); }
