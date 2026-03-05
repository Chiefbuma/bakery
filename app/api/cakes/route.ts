
import { NextResponse } from 'next/server';
export async function GET() { 
  return NextResponse.json({ message: 'Resource moved or deleted' }, { status: 410 }); 
}
