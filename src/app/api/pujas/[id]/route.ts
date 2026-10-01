import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAdminAccess } from '@/lib/auth';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    if (!verifyAdminAccess(request, ['super_admin', 'admin', 'content_manager'])) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await Promise.resolve(params);
    const body = await request.json();
    const {
      name,
      category,
      duration,
      difficulty,
      intro,
      significance,
      benefits,
      bestTime,
      image,
      youtubeUrl,
      items = [],
      steps = [],
      mantras = [],
    } = body;

    // Check if the puja exists
    const puja = await prisma.puja.findUnique({ where: { id } });
    if (!puja) {
      return NextResponse.json({ error: 'Puja not found' }, { status: 404 });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Execute in a transaction to safely clean and replace children
    const updatedPuja = await prisma.$transaction(async (tx) => {
      // Delete old children
      await tx.pujaItem.deleteMany({ where: { pujaId: id } });
      await tx.pujaStep.deleteMany({ where: { pujaId: id } });
      await tx.mantra.deleteMany({ where: { pujaId: id } });

      // Update parent and create new children
      return await tx.puja.update({
        where: { id },
        data: {
          name,
          slug,
          category,
          duration,
          difficulty,
          intro,
          significance,
          benefits,
          bestTime,
          image,
          youtubeUrl,
          items: {
            create: items.map((item: any) => ({
              name: item.name,
              quantity: item.quantity,
              isRequired: item.isRequired !== false,
            })),
          },
          steps: {
            create: steps.map((step: any, index: number) => ({
              stepNumber: step.stepNumber || index + 1,
              title: step.title,
              description: step.description,
            })),
          },
          mantras: {
            create: mantras.map((mantra: any) => ({
              name: mantra.name,
              sanskrit: mantra.sanskrit,
              telugu: mantra.telugu,
              english: mantra.english,
              meaning: mantra.meaning,
              audioUrl: mantra.audioUrl || '/audio/gayatri.mp3',
            })),
          },
        },
      });
    });

    return NextResponse.json(updatedPuja);
  } catch (error: any) {
    console.error('Error updating puja:', error);
    return NextResponse.json({ error: 'Failed to update puja' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    if (!verifyAdminAccess(request, ['super_admin', 'admin', 'content_manager'])) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await Promise.resolve(params);

    // Check if the puja exists
    const puja = await prisma.puja.findUnique({ where: { id } });
    if (!puja) {
      return NextResponse.json({ error: 'Puja not found' }, { status: 404 });
    }

    // Clean up associated Bookings and PujaKitOrders first to avoid foreign key constraints
    await prisma.booking.deleteMany({
      where: { pujaId: id },
    });
    await prisma.pujaKitOrder.deleteMany({
      where: { pujaId: id },
    });

    // Prisma schema is defined with onDelete: Cascade, so items, steps, mantras will delete automatically!
    await prisma.puja.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Puja deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting puja:', error);
    return NextResponse.json({ error: 'Failed to delete puja' }, { status: 500 });
  }
}
