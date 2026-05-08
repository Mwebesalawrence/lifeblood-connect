import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const user = await db.user.findFirst({ where: { token } });
    if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const donorId = searchParams.get('donorId');
    const centerId = searchParams.get('centerId');
    const status = searchParams.get('status') || '';

    const donations = await db.donation.findMany({
      where: {
        ...(donorId ? { donorId } : {}),
        ...(centerId ? { centerId } : {}),
        ...(status ? { status } : {}),
      },
      include: { donor: true, center: true },
      orderBy: { date: 'desc' },
    });

    const safeDonations = donations.map(({ donor, ...rest }) => ({
      ...rest,
      donor: { id: donor.id, name: donor.name, bloodType: donor.bloodType },
    }));
    return NextResponse.json(safeDonations);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch donations' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const admin = await db.user.findFirst({ where: { token, role: 'ADMIN' } });
    if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { donorId, centerId, bloodType, volumeMl, notes, date } = await request.json();

    if (!donorId || !centerId || !bloodType) {
      return NextResponse.json({ error: 'Donor, center, and blood type required' }, { status: 400 });
    }

    const donation = await db.donation.create({
      data: {
        donorId,
        centerId,
        bloodType,
        volumeMl: volumeMl || 450,
        notes,
        date: date ? new Date(date) : new Date(),
        status: 'COMPLETED',
      },
    });

    const nextEligible = new Date();
    nextEligible.setDate(nextEligible.getDate() + 56);

    await db.user.update({
      where: { id: donorId },
      data: {
        totalDonations: { increment: 1 },
        points: { increment: 10 },
        lastDonationDate: new Date(),
        nextEligibleDate: nextEligible,
        isEligible: false,
      },
    });

    return NextResponse.json(donation, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to record donation' }, { status: 500 });
  }
}
