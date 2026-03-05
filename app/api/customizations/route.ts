
import { NextResponse } from 'next/server';
export async function GET() { return NextResponse.json({ flavors: [], sizes: [], colors: [], toppings: [] }); }
