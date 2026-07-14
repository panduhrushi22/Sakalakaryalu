import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAdminAccess } from '@/lib/auth';

// Haversine Formula for distance calculation
function getHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in KM
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const latStr = searchParams.get('lat');
    const lngStr = searchParams.get('lng');
    const specialty = searchParams.get('specialty');

    const pujaris = await prisma.pujari.findMany({
      where: { deletedAt: null },   // Never return soft-deleted pujaris
      orderBy: { name: 'asc' },
    });

    let results = pujaris.map((pujari) => ({
      ...pujari,
      distance: 0,
    }));

    // Filter by specialty if queried
    if (specialty) {
      results = results.filter((pujari) =>
        pujari.specialization.toLowerCase().includes(specialty.toLowerCase())
      );
    }

    // Sort by proximity if coordinates are provided
    if (latStr && lngStr) {
      const userLat = parseFloat(latStr);
      const userLng = parseFloat(lngStr);

      if (!isNaN(userLat) && !isNaN(userLng)) {
        results = results.map((pujari) => {
          const dist = getHaversineDistance(userLat, userLng, pujari.lat, pujari.lng);
          return {
            ...pujari,
            distance: Math.round(dist * 10) / 10, // Round to 1 decimal place
          };
        });

        // Sort by distance ascending
        results.sort((a, b) => a.distance - b.distance);
      }
    }

    return NextResponse.json(results);
  } catch (error: any) {
    console.error('Error fetching pujaris:', error);
    return NextResponse.json({ error: 'Failed to fetch pujaris' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!verifyAdminAccess(request, ['super_admin', 'admin'])) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    if (!name || !experience || !phone || !whatsapp || lat === undefined || lng === undefined || !address) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newPujari = await prisma.pujari.create({
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
        image: image || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&q=80',
        address,
      },
    });

    return NextResponse.json(newPujari);
  } catch (error: any) {
    console.error('Error creating pujari:', error);
    return NextResponse.json({ error: 'Failed to create pujari' }, { status: 500 });
  }
}
