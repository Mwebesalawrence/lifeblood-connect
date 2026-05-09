import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const admin = await db.user.findFirst({ where: { token, role: 'ADMIN' } });
    if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const data = await request.json();
    const updateData: Record<string, any> = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.district !== undefined) updateData.district = data.district;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.latitude !== undefined) updateData.latitude = data.latitude ? parseFloat(data.latitude) : null;
    if (data.longitude !== undefined) updateData.longitude = data.longitude ? parseFloat(data.longitude) : null;
    if (data.startDate !== undefined) updateData.startDate = new Date(data.startDate);
    if (data.endDate !== undefined) updateData.endDate = new Date(data.endDate);
    if (data.scheduledDays !== undefined) updateData.scheduledDays = typeof data.scheduledDays === 'string' ? data.scheduledDays : JSON.stringify(data.scheduledDays);
    if (data.startTime !== undefined) updateData.startTime = data.startTime;
    if (data.endTime !== undefined) updateData.endTime = data.endTime;
    if (data.organizer !== undefined) updateData.organizer = data.organizer;
    if (data.contactPhone !== undefined) updateData.contactPhone = data.contactPhone;
    if (data.status !== undefined) updateData.status = data.status;

    const drive = await db.bloodDrive.update({
      where: { id },
      data: updateData,
    });

    // Notify donors when a blood drive is cancelled
    if (data.status === 'CANCELLED') {
      const donorsInCity = await db.user.findMany({
        where: { role: 'DONOR', city: { contains: drive.city } },
      });

      for (const donor of donorsInCity) {
        await db.notification.create({
          data: {
            userId: donor.id,
            title: 'Blood Drive Cancelled',
            message: `The blood drive "${drive.title}" scheduled at ${drive.location}, ${drive.city} has been cancelled. We apologize for any inconvenience. Please check back for future events.`,
            type: 'BLOOD_DRIVE',
          },
        });
      }
    }

    // Notify donors when a blood drive is activated
    if (data.status === 'ACTIVE') {
      const donorsInCity = await db.user.findMany({
        where: { role: 'DONOR', city: { contains: drive.city } },
      });

      for (const donor of donorsInCity) {
        await db.notification.create({
          data: {
            userId: donor.id,
            title: 'Blood Drive Now Active!',
            message: `The blood drive "${drive.title}" at ${drive.location}, ${drive.city} is now active! Come donate from ${drive.startTime} to ${drive.endTime}.`,
            type: 'BLOOD_DRIVE',
          },
        });
      }
    }

    return NextResponse.json(drive);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update blood drive' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const admin = await db.user.findFirst({ where: { token, role: 'ADMIN' } });
    if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    // Get the drive before deleting so we can notify donors
    const drive = await db.bloodDrive.findUnique({ where: { id } });

    await db.bloodDrive.delete({ where: { id } });

    // Notify donors about the deleted blood drive
    if (drive) {
      const donorsInCity = await db.user.findMany({
        where: { role: 'DONOR', city: { contains: drive.city } },
      });

      for (const donor of donorsInCity) {
        await db.notification.create({
          data: {
            userId: donor.id,
            title: 'Blood Drive Removed',
            message: `The blood drive "${drive.title}" at ${drive.location}, ${drive.city} has been removed. We apologize for any inconvenience.`,
            type: 'BLOOD_DRIVE',
          },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete blood drive' }, { status: 500 });
  }
}