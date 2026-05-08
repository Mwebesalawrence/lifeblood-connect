import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const center = await db.donationCenter.findUnique({
      where: { id },
      include: { inventory: true, donations: { take: 10, orderBy: { date: 'desc' } } },
    });
    if (!center) return NextResponse.json({ error: 'Center not found' }, { status: 404 });
    return NextResponse.json(center);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch center' }, { status: 500 });
  }
}
