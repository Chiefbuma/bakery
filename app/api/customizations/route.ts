
import { NextResponse } from 'next/server';
export async function GET() { 
  return NextResponse.json({ message: 'No longer in use' }, { status: 410 }); 
}
