import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAdminAccess } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    if (!verifyAdminAccess(request, ['super_admin', 'admin'])) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bookings = await prisma.booking.findMany({
      include: {
        pujari: true,
        puja: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const mappedBookings = bookings.map((b) => ({
      id: b.id,
      customerName: b.userName,
      customerPhone: b.userPhone,
      customerEmail: b.userEmail,
      bookingDate: b.bookingDate,
      bookingTime: b.bookingTime,
      address: b.notes || '',
      status: b.status,
      pujari: { name: b.pujari?.name || '' },
      puja: { name: b.puja?.name || '' },
    }));

    return NextResponse.json(mappedBookings);
  } catch (error: any) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerPhone,
      customerEmail,
      bookingDate,
      bookingTime,
      address,
      pujariId,
      pujaId,
    } = body;

    if (
      !customerName ||
      !customerPhone ||
      !customerEmail ||
      !bookingDate ||
      !bookingTime ||
      !address ||
      !pujariId ||
      !pujaId
    ) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Verify priest and puja exist
    const pujariExists = await prisma.pujari.findFirst({
      where: {
        id: pujariId,
        deletedAt: null,
      },
    });
    const pujaExists = await prisma.puja.findUnique({ where: { id: pujaId } });

    if (!pujariExists || !pujaExists) {
      return NextResponse.json({ error: 'Invalid Pujari or Puja selected' }, { status: 404 });
    }

    const newBooking = await prisma.booking.create({
      data: {
        userName: customerName,
        userPhone: customerPhone,
        userEmail: customerEmail,
        bookingDate,
        bookingTime,
        notes: address,
        pujariId,
        pujaId,
        status: 'PENDING',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Booking request submitted successfully!',
      booking: newBooking,
    });
  } catch (error: any) {
    console.error('Error creating booking:', error);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}
