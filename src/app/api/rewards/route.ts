import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const rewards = await db.reward.findMany({ orderBy: { pointsRequired: 'asc' } });
    return NextResponse.json(rewards);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch rewards' }, { status: 500 });
  }
}
