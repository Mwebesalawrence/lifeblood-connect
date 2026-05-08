import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const inventory = await db.bloodInventory.findMany({
      include: { center: true },
      orderBy: [{ bloodType: 'asc' }, { centerId: 'asc' }],
    });
    return NextResponse.json(inventory);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const admin = await db.user.findFirst({ where: { token, role: 'ADMIN' } });
    if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { centerId, bloodType, units } = await request.json();
    if (!centerId || !bloodType || units === undefined) {
      return NextResponse.json({ error: 'Center, blood type, and units required' }, { status: 400 });
    }

    const inventory = await db.bloodInventory.upsert({
      where: { centerId_bloodType: { centerId, bloodType } },
      update: { units, updatedAt: new Date() },
      create: { centerId, bloodType, units },
    });

    return NextResponse.json(inventory);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update inventory' }, { status: 500 });
  }
}
