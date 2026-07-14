import React from 'react';
import { prisma } from '@/lib/db';
import { Compass } from 'lucide-react';
import PujariFinderClientWrapper from '@/components/PujariFinderClientWrapper';
import { cookies } from 'next/headers';
import { i18nDictionary, LanguageCode } from '@/lib/i18n';

export const revalidate = 0; // Fresh database fetches always

// Haversine Formula for distance calculation
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in KM
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

export default async function PujarisPage({
  searchParams,
}: {
  searchParams: { lat?: string; lng?: string; specialty?: string };
}) {
  const userLatStr = searchParams.lat;
  const userLngStr = searchParams.lng;
  const currentSpecialty = searchParams.specialty || '';

  const cookieStore = cookies();
  const currentLang = (cookieStore.get('sakalakaryalu_lang')?.value || 'en') as LanguageCode;
  const dict = i18nDictionary[currentLang] || i18nDictionary['en'];

  // Retrieve priests and pujas
  const pujaris = await prisma.pujari.findMany({
    where: { deletedAt: null },
    orderBy: { name: 'asc' },
  });

  const pujas = await prisma.puja.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });

  // Hydrate and filter results
  let results = pujaris.map((pujari) => ({
    ...pujari,
    distance: 0,
  }));

  if (currentSpecialty) {
    results = results.filter((pujari) =>
      pujari.specialization.toLowerCase().includes(currentSpecialty.toLowerCase())
    );
  }

  // Apply GPS proximity calculations if parameters present
  if (userLatStr && userLngStr) {
    const lat = parseFloat(userLatStr);
    const lng = parseFloat(userLngStr);

    if (!isNaN(lat) && !isNaN(lng)) {
      results = results.map((pujari) => {
        const dist = getDistance(lat, lng, pujari.lat, pujari.lng);
        return {
          ...pujari,
          distance: Math.round(dist * 10) / 10, // Round to 1 decimal place
        };
      });

      // Sort by proximity ascending
      results.sort((a, b) => a.distance - b.distance);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Page Title */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center space-x-1.5 bg-amber-100 text-amber-800 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider">
          <Compass className="h-4 w-4" />
          <span>{currentLang === 'te' ? 'పురోహిత సేవలు' : currentLang === 'hi' ? 'पुरोहित सेवा' : 'Local Priest Services'}</span>
        </div>
        <h1 className="font-cinzel text-3xl sm:text-4xl md:text-5xl font-black text-stone-850 leading-tight">
          {dict.pujarisTitle}
        </h1>
        <p className="font-lora text-stone-600 text-sm sm:text-base leading-relaxed">
          {dict.pujarisSub}
        </p>
      </div>

      {/* Priest Finder Client Coordinator */}
      <PujariFinderClientWrapper pujaris={results} pujas={pujas} />
    </div>
  );
}
