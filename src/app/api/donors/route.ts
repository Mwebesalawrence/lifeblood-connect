import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const admin = await db.user.findFirst({ where: { token, role: 'ADMIN' } });
    if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const search = searchParams.get('search') || '';
    const bloodType = searchParams.get('bloodType') || '';

    const donors = await db.user.findMany({
      where: {
        role: 'DONOR',
        ...(search ? { OR: [
          { name: { contains: search } },
          { email: { contains: search } },
        ]} : {}),
        ...(bloodType ? { bloodType } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });

    const safeDonors = donors.map(({ password, token: _, ...rest }) => rest);
    return NextResponse.json(safeDonors);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch donors' }, { status: 500 });
  }
}
