import { NextResponse } from 'next/server';
import { getDecodedToken } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const decoded = getDecodedToken(request);
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required' },
        { status: 401 }
      );
    }

    if (decoded.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access strictly required' },
        { status: 403 }
      );
    }

    // Return dashboard stats securely
    const [bookingsCount, pujarisCount, pujasCount, ordersCount, blogsCount] = await Promise.all([
      prisma.booking.count(),
      prisma.pujari.count({ where: { deletedAt: null } }),
      prisma.puja.count(),
      prisma.pujaKitOrder.count(),
      prisma.blog.count(),
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        bookings: bookingsCount,
        pujaris: pujarisCount,
        pujas: pujasCount,
        orders: ordersCount,
        blogs: blogsCount,
      },
    });
  } catch (error) {
    console.error('Error in secure /api/admin/dashboard:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
