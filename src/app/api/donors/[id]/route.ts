import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const user = await db.user.findFirst({ where: { token } });
    if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const donor = await db.user.findUnique({
      where: { id },
      include: {
        donations: { include: { center: true }, orderBy: { date: 'desc' } },
        appointments: { include: { center: true }, orderBy: { date: 'desc' } },
        rewards: { include: { reward: true } },
      },
    });

    if (!donor) return NextResponse.json({ error: 'Donor not found' }, { status: 404 });

    const { password, token: _, ...safeDonor } = donor;
    return NextResponse.json(safeDonor);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch donor' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const user = await db.user.findFirst({ where: { token } });
    if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const data = await request.json();
    const { password: _pw, token: _tk, ...updateData } = data;

    if (data.points !== undefined || data.role !== undefined) {
      return NextResponse.json({ error: 'Cannot modify points or role' }, { status: 400 });
    }

    const updated = await db.user.update({
      where: { id },
      data: updateData,
    });

    const { password, token: __, ...safeUser } = updated;
    return NextResponse.json(safeUser);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update donor' }, { status: 500 });
  }
}
