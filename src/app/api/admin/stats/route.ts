import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAdminAccess } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    if (!verifyAdminAccess(request, ['super_admin', 'admin', 'content_manager', 'delivery_manager'])) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Run parallel counts for fast performance
    const [bookingsCount, pujarisCount, pujasCount, blogsCount, ordersCount, recentBookings, recentOrders] = await Promise.all([
      prisma.booking.count(),
      prisma.pujari.count({ where: { deletedAt: null } }),
      prisma.puja.count(),
      prisma.blog.count(),
      prisma.pujaKitOrder.count(),
      prisma.booking.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          pujari: true,
          puja: true,
        },
      }),
      prisma.pujaKitOrder.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          puja: { select: { name: true } },
        },
      }),
    ]);

    const mappedBookings = recentBookings.map((b) => ({
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

    return NextResponse.json({
      success: true,
      stats: {
        bookings: bookingsCount,
        pujaris: pujarisCount,
        pujas: pujasCount,
        blogs: blogsCount,
        orders: ordersCount,
      },
      recentBookings: mappedBookings,
      recentOrders,
    });
  } catch (error: any) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard statistics' }, { status: 500 });
  }
}
