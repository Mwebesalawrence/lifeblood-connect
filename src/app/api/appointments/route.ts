import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const user = await db.user.findFirst({ where: { token } });
    if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const donorId = user.role === 'DONOR' ? user.id : (searchParams.get('donorId') || '');
    const status = searchParams.get('status') || '';

    const appointments = await db.appointment.findMany({
      where: {
        ...(donorId ? { donorId } : {}),
        ...(status ? { status } : {}),
      },
      include: { center: true },
      orderBy: { date: 'asc' },
    });

    const safeAppointments = appointments.map(({ donorId: _, ...rest }) => rest);
    return NextResponse.json(safeAppointments);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const user = await db.user.findFirst({ where: { token } });
    if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { centerId, date, timeSlot, notes } = await request.json();

    if (!centerId || !date || !timeSlot) {
      return NextResponse.json({ error: 'Center, date, and time slot required' }, { status: 400 });
    }

    const appointment = await db.appointment.create({
      data: {
        donorId: user.id,
        centerId,
        date: new Date(date),
        timeSlot,
        notes,
        status: 'SCHEDULED',
      },
    });

    await db.notification.create({
      data: {
        userId: user.id,
        title: 'Appointment Booked',
        message: `Your appointment at ${timeSlot} has been scheduled successfully.`,
        type: 'APPOINTMENT',
      },
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to book appointment' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const user = await db.user.findFirst({ where: { token } });
    if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { id, status } = await request.json();
    if (!id || !status) {
      return NextResponse.json({ error: 'ID and status required' }, { status: 400 });
    }

    const appointment = await db.appointment.update({
      where: { id },
      data: { status },
    });

    if (status === 'CANCELLED') {
      await db.notification.create({
        data: {
          userId: user.id,
          title: 'Appointment Cancelled',
          message: 'Your appointment has been cancelled.',
          type: 'APPOINTMENT',
        },
      });
    }

    return NextResponse.json(appointment);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update appointment' }, { status: 500 });
  }
}
