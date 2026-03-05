
import { NextResponse } from 'next/server';
export async function GET() { return NextResponse.json({ message: 'Legacy endpoint neutralized' }, { status: 410 }); }
