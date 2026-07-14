import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAdminAccess } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const full = searchParams.get('full') === 'true';

    let whereClause: any = {};

    if (category && category !== 'all') {
      whereClause.category = category;
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { intro: { contains: search } },
        { significance: { contains: search } },
      ];
    }

    const pujas = await prisma.puja.findMany({
      where: whereClause,
      include: {
        items: full,
        steps: full,
        mantras: full,
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(pujas);
  } catch (error: any) {
    console.error('Error fetching pujas:', error);
    return NextResponse.json({ error: 'Failed to fetch pujas' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!verifyAdminAccess(request, ['super_admin', 'admin', 'content_manager'])) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
      deityName,
      heroImage,
      thumbnailImage,
      bannerImage,
      themeColors,
      items = [],
      steps = [],
      mantras = [],
    } = body;

    if (!name || !category || !duration || !difficulty) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Check if slug is unique
    const existing = await prisma.puja.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: 'A puja with this name already exists' }, { status: 400 });
    }

    const newPuja = await prisma.puja.create({
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
        image: image || 'https://images.unsplash.com/photo-1615469038804-6b91aef7026f?w=600&h=400&fit=crop&q=80',
        deityName: deityName || 'Deity',
        heroImage: heroImage || image || 'https://images.unsplash.com/photo-1615469038804-6b91aef7026f?w=600&h=400&fit=crop&q=80',
        thumbnailImage: thumbnailImage || image || 'https://images.unsplash.com/photo-1615469038804-6b91aef7026f?w=600&h=400&fit=crop&q=80',
        bannerImage: bannerImage || image || 'https://images.unsplash.com/photo-1615469038804-6b91aef7026f?w=1200&h=600&fit=crop&q=80',
        themeColors: themeColors || 'gold',
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

    return NextResponse.json(newPuja);
  } catch (error: any) {
    console.error('Error creating puja:', error);
    return NextResponse.json({ error: 'Failed to create puja' }, { status: 500 });
  }
}
