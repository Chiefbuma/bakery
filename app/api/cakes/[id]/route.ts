
import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
/**
 * Legacy Cake API (Neutralized)
 */
export async function GET() { return new NextResponse(null, { status: 410 }); }
export async function PUT() { return new NextResponse(null, { status: 410 }); }
export async function DELETE() { return new NextResponse(null, { status: 410 }); }
