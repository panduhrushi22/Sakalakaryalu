import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAdminAccess } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (date) {
      const entry = await prisma.panchangam.findUnique({
        where: { date },
      });
      return NextResponse.json(entry || null);
    }

    const entries = await prisma.panchangam.findMany({
      orderBy: { date: 'asc' },
    });

    return NextResponse.json(entries);
  } catch (error: any) {
    console.error('Error fetching panchangam entries:', error);
    return NextResponse.json({ error: 'Failed to fetch panchangam data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!verifyAdminAccess(request, ['super_admin', 'admin', 'content_manager'])) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      date,
      dayName,
      tithi,
      nakshatram,
      yogam,
      karanam,
      rahuKalam,
      yamagandam,
      gulikaKalam,
      abhijitMuhurtham,
      sunrise,
      sunset,
      specialEvent,
      description,
    } = body;

    if (!date || !tithi || !nakshatram) {
      return NextResponse.json({ error: 'Date, Tithi, and Nakshatram are required' }, { status: 400 });
    }

    // Check if entry for date already exists
    const existing = await prisma.panchangam.findUnique({ where: { date } });
    if (existing) {
      return NextResponse.json({ error: 'A Panchangam entry for this date already exists. Please edit it instead.' }, { status: 409 });
    }

    const newEntry = await prisma.panchangam.create({
      data: {
        date,
        dayName: dayName || 'Auspicious Day',
        tithi,
        nakshatram,
        yogam: yogam || null,
        karanam: karanam || null,
        rahuKalam: rahuKalam || '04:30 PM - 06:00 PM',
        yamagandam: yamagandam || '12:00 PM - 01:30 PM',
        gulikaKalam: gulikaKalam || '03:00 PM - 04:30 PM',
        abhijitMuhurtham: abhijitMuhurtham || '11:45 AM - 12:35 PM',
        sunrise: sunrise || '06:05 AM',
        sunset: sunset || '06:12 PM',
        specialEvent: specialEvent || null,
        description: description || null,
      },
    });

    return NextResponse.json(newEntry);
  } catch (error: any) {
    console.error('Error creating panchangam entry:', error);
    return NextResponse.json({ error: 'Failed to create panchangam entry' }, { status: 500 });
  }
}
