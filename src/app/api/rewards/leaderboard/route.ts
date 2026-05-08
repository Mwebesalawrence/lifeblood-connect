import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const leaderboard = await db.user.findMany({
      where: { role: 'DONOR' },
      orderBy: { points: 'desc' },
      take: 20,
      select: {
        id: true,
        name: true,
        bloodType: true,
        points: true,
        totalDonations: true,
        city: true,
      },
    });
    return NextResponse.json(leaderboard);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}
