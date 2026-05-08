import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, phone, bloodType, dateOfBirth, gender, city, address } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Email, password, and name required' }, { status: 400 });
    }

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const token = randomUUID();
    const user = await db.user.create({
      data: {
        email,
        password,
        name,
        phone,
        bloodType,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        gender,
        city,
        address,
        token,
      },
    });

    const { password: _, token: __, ...safeUser } = user;

    return NextResponse.json({ user: safeUser, token }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
