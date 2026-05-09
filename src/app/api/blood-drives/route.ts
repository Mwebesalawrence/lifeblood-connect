import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const district = searchParams.get('district') || '';
    const city = searchParams.get('city') || '';
    const upcoming = searchParams.get('upcoming') === 'true';

    const where: Record<string, any> = {};

    if (district) {
      where.district = { contains: district };
    }
    if (city) {
      where.city = { contains: city };
    }
    if (upcoming) {
      where.endDate = { gte: new Date() };
    }

    const drives = await db.bloodDrive.findMany({
      where,
      orderBy: [{ startDate: 'asc' }],
    });

    return NextResponse.json(drives);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch blood drives' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const admin = await db.user.findFirst({ where: { token, role: 'ADMIN' } });
    if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const data = await request.json();

    if (!data.title || !data.location || !data.district || !data.city || !data.startDate || !data.endDate || !data.scheduledDays || !data.startTime || !data.endTime) {
      return NextResponse.json({ error: 'Title, location, district, city, dates, scheduled days, and times are required' }, { status: 400 });
    }

    const drive = await db.bloodDrive.create({
      data: {
        title: data.title,
        description: data.description || '',
        location: data.location,
        district: data.district,
        city: data.city,
        latitude: data.latitude ? parseFloat(data.latitude) : null,
        longitude: data.longitude ? parseFloat(data.longitude) : null,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        scheduledDays: typeof data.scheduledDays === 'string' ? data.scheduledDays : JSON.stringify(data.scheduledDays),
        startTime: data.startTime,
        endTime: data.endTime,
        organizer: data.organizer || null,
        contactPhone: data.contactPhone || null,
        status: data.status || 'UPCOMING',
      },
    });

    // Notify all donors in this city about the new blood drive
    const donorsInCity = await db.user.findMany({
      where: { role: 'DONOR', city: { contains: data.city } },
    });

    for (const donor of donorsInCity) {
      await db.notification.create({
        data: {
          userId: donor.id,
          title: 'Blood Drive in Your Area!',
          message: `A new blood drive "${data.title}" is coming to ${data.city} from ${data.startDate} to ${data.endDate}. Location: ${data.location}. Come and donate!`,
          type: 'BLOOD_DRIVE',
        },
      });
    }

    return NextResponse.json(drive, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create blood drive' }, { status: 500 });
  }
}