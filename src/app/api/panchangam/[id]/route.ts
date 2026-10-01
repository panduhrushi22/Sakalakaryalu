import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAdminAccess } from '@/lib/auth';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    if (!verifyAdminAccess(request, ['super_admin', 'admin', 'content_manager'])) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await Promise.resolve(params);
    const { id } = resolvedParams;

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

    const existing = await prisma.panchangam.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Panchangam entry not found' }, { status: 404 });
    }

    const updated = await prisma.panchangam.update({
      where: { id },
      data: {
        date: date || existing.date,
        dayName: dayName || existing.dayName,
        tithi: tithi || existing.tithi,
        nakshatram: nakshatram || existing.nakshatram,
        yogam: yogam !== undefined ? yogam : existing.yogam,
        karanam: karanam !== undefined ? karanam : existing.karanam,
        rahuKalam: rahuKalam || existing.rahuKalam,
        yamagandam: yamagandam || existing.yamagandam,
        gulikaKalam: gulikaKalam !== undefined ? gulikaKalam : existing.gulikaKalam,
        abhijitMuhurtham: abhijitMuhurtham !== undefined ? abhijitMuhurtham : existing.abhijitMuhurtham,
        sunrise: sunrise || existing.sunrise,
        sunset: sunset || existing.sunset,
        specialEvent: specialEvent !== undefined ? specialEvent : existing.specialEvent,
        description: description !== undefined ? description : existing.description,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error updating panchangam:', error);
    return NextResponse.json({ error: 'Failed to update panchangam entry' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    if (!verifyAdminAccess(request, ['super_admin', 'admin', 'content_manager'])) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await Promise.resolve(params);
    const { id } = resolvedParams;

    const existing = await prisma.panchangam.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Panchangam entry not found' }, { status: 404 });
    }

    await prisma.panchangam.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Panchangam entry deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting panchangam:', error);
    return NextResponse.json({ error: 'Failed to delete panchangam entry' }, { status: 500 });
  }
}
