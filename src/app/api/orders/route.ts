import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAdminAccess } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    if (!verifyAdminAccess(request, ['super_admin', 'admin', 'delivery_manager'])) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orders = await prisma.pujaKitOrder.findMany({
      include: {
        puja: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(orders);
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerPhone,
      customerEmail,
      deliveryAddress,
      pincode,
      deliveryTime,
      paymentMethod,
      totalPrice,
      itemsJson,
      pujaId,
    } = body;

    if (
      !customerName ||
      !customerPhone ||
      !customerEmail ||
      !deliveryAddress ||
      !pincode ||
      !deliveryTime ||
      !paymentMethod ||
      totalPrice === undefined ||
      !itemsJson ||
      !pujaId
    ) {
      return NextResponse.json({ error: 'All parameters are mandatory' }, { status: 400 });
    }

    // Verify Puja exists
    const pujaExists = await prisma.puja.findUnique({ where: { id: pujaId } });
    if (!pujaExists) {
      return NextResponse.json({ error: 'Invalid Puja ID selected' }, { status: 404 });
    }

    const newOrder = await prisma.pujaKitOrder.create({
      data: {
        customerName,
        customerPhone,
        customerEmail,
        deliveryAddress,
        pincode,
        deliveryTime,
        paymentMethod,
        totalPrice: parseFloat(totalPrice),
        itemsJson,
        pujaId,
        status: 'PLACED',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Puja Kit Delivery Order placed successfully!',
      order: newOrder,
    });
  } catch (error: any) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Failed to place order' }, { status: 500 });
  }
}
