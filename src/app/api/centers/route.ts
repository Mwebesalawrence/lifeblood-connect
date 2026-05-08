import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const centers = await db.donationCenter.findMany({
      where: { isActive: true },
      include: { inventory: true },
      orderBy: { city: 'asc' },
    });
    return NextResponse.json(centers);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch centers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const admin = await db.user.findFirst({ where: { token, role: 'ADMIN' } });
    if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const data = await request.json();
    const center = await db.donationCenter.create({ data });
    return NextResponse.json(center, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create center' }, { status: 500 });
  }
}
