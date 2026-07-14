import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAdminAccess } from '@/lib/auth';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    if (!verifyAdminAccess(request, ['super_admin', 'admin'])) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const {
      name,
      experience,
      rating,
      languages,
      specialization,
      phone,
      whatsapp,
      lat,
      lng,
      image,
      address,
    } = body;

    const pujari = await prisma.pujari.findUnique({ where: { id } });
    if (!pujari) {
      return NextResponse.json({ error: 'Pujari not found' }, { status: 404 });
    }

    const updatedPujari = await prisma.pujari.update({
      where: { id },
      data: {
        name,
        experience: parseInt(experience),
        rating: parseFloat(rating) || 5.0,
        languages,
        specialization,
        phone,
        whatsapp,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        image,
        address,
      },
    });

    return NextResponse.json(updatedPujari);
  } catch (error: any) {
    console.error('Error updating pujari:', error);
    return NextResponse.json({ error: 'Failed to update pujari' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    if (!verifyAdminAccess(request, ['super_admin', 'admin'])) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    const pujari = await prisma.pujari.findUnique({ where: { id } });
    if (!pujari) {
      return NextResponse.json({ error: 'Pujari not found' }, { status: 404 });
    }

    // SOFT DELETE — set deletedAt so this pujari is permanently hidden
    // even if `prisma db seed` is run again (seed upsert never clears deletedAt)
    await prisma.pujari.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ success: true, message: 'Pujari deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting pujari:', error);
    return NextResponse.json({ error: 'Failed to delete pujari' }, { status: 500 });
  }
}
