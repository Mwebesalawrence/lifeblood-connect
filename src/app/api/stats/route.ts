import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const totalDonors = await db.user.count({ where: { role: 'DONOR' } });
    const totalDonations = await db.donation.count();
    const activeCenters = await db.donationCenter.count({ where: { isActive: true } });

    const completedDonations = await db.donation.count({ where: { status: 'COMPLETED' } });
    const livesSaved = completedDonations * 3;

    const scheduledAppointments = await db.appointment.count({ where: { status: 'SCHEDULED' } });

    const inventory = await db.bloodInventory.findMany();
    const totalUnits = inventory.reduce((sum, i) => sum + i.units, 0);

    const bloodTypeCounts = await db.user.groupBy({
      by: ['bloodType'],
      where: { role: 'DONOR', bloodType: { not: null } },
      _count: { bloodType: true },
    });

    const bloodTypeDistribution: Record<string, number> = {};
    bloodTypeCounts.forEach((bt) => {
      if (bt.bloodType) bloodTypeDistribution[bt.bloodType] = bt._count.bloodType;
    });

    const recentDonations = await db.donation.findMany({
      take: 30,
      orderBy: { date: 'desc' },
      include: { center: true },
    });

    const monthlyData: Record<string, number> = {};
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[key] = 0;
    }
    recentDonations.forEach((d) => {
      const key = `${d.date.getFullYear()}-${String(d.date.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyData[key] !== undefined) monthlyData[key]++;
    });

    const inventoryByType: Record<string, number> = {};
    inventory.forEach((i) => {
      inventoryByType[i.bloodType] = (inventoryByType[i.bloodType] || 0) + i.units;
    });

    return NextResponse.json({
      totalDonors,
      totalDonations,
      activeCenters,
      livesSaved,
      scheduledAppointments,
      totalUnits,
      bloodTypeDistribution,
      monthlyData,
      inventoryByType,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
