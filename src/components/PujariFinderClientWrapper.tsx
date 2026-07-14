'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Compass, MapPin, Phone, MessageCircle, Heart, ArrowRight } from 'lucide-react';
import PujariBookingModal from '@/components/PujariBookingModal';
import { useLanguage } from '@/components/LanguageProvider';

// Load Leaflet Map dynamically to avoid SSR window errors
const PujariMap = dynamic(() => import('@/components/PujariMap'), { ssr: false });

interface Pujari {
  id: string;
  name: string;
  experience: number;
  rating: number;
  languages: string;
  specialization: string;
  phone: string;
  whatsapp: string;
  lat: number;
  lng: number;
  image: string;
  address: string;
  distance: number;
}

interface Puja {
  id: string;
  name: string;
}

interface WrapperProps {
  pujaris: Pujari[];
  pujas: Puja[];
}

export default function PujariFinderClientWrapper({ pujaris, pujas }: WrapperProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const [selectedPujari, setSelectedPujari] = useState<Pujari | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const userLatStr = searchParams.get('lat');
  const userLngStr = searchParams.get('lng');
  const userLat = userLatStr ? parseFloat(userLatStr) : null;
  const userLng = userLngStr ? parseFloat(userLngStr) : null;

  // Use browser geolocation GPS matching
  const handleGPSMatch = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setIsLocating(false);
        router.push(`/pujaris?lat=${latitude}&lng=${longitude}`);
      },
      (error) => {
        console.error('Error getting location:', error);
        setIsLocating(false);
        alert('Unable to retrieve your location. Please select a preset neighborhood.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const openBookingModal = (pujari: Pujari) => {
    setSelectedPujari(pujari);
    setIsModalOpen(true);
  };


  return (
    <div className="space-y-8">
      {/* Search Header Controls Panel */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-md space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-cinzel text-lg font-bold text-stone-850">
              {t('gpsPriestsTitle')}
            </h3>
            <p className="font-lora text-xs text-stone-500">
              {t('gpsPriestsSub')}
            </p>
          </div>

          {/* GPS matcher button */}
          <button
            onClick={handleGPSMatch}
            disabled={isLocating}
            className="flex items-center justify-center bg-amber-500 hover:bg-amber-600 active:scale-95 text-stone-950 font-outfit font-black text-xs tracking-wider px-6 py-3.5 rounded-2xl transition-all shadow-md disabled:opacity-50"
          >
            <Compass className={`h-4.5 w-4.5 mr-1.5 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? t('gpsLocating') : t('useGpsLocation')}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Interactive Map left, Results list right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Map view */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-sm space-y-3">
            <h4 className="font-cinzel text-sm font-bold text-stone-850 flex items-center">
              <MapPin className="h-4 w-4 mr-1.5 text-amber-500" />
              {t('neighborhoodMap')}
            </h4>
            <PujariMap pujaris={pujaris} userLat={userLat} userLng={userLng} />
          </div>
        </div>

        {/* RIGHT 2 COLUMNS: Sorted results list */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-stone-200 pb-2">
            <span className="font-outfit text-xs font-bold tracking-widest text-stone-500 uppercase">
              {pujaris.length} {t('verifiedPriestsCount')}
            </span>
            {userLat && userLng && (
              <span className="bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider font-outfit">
                {t('sortedByProximity')}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pujaris.map((pujari) => (
              <div
                key={pujari.id}
                className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
              >
                <div className="p-5 space-y-4">
                  {/* Photo and general name details */}
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-stone-100 flex-shrink-0 border-2 border-amber-200 shadow-sm">
                      <img
                        src={pujari.image}
                        alt={pujari.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-cinzel text-base font-bold text-stone-850">{pujari.name}</h4>
                        {pujari.distance > 0 && (
                          <span className="bg-amber-500 text-stone-950 font-outfit font-black text-[9px] px-2 py-0.5 rounded-full shadow-sm">
                            {pujari.distance} km
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-stone-500 font-outfit">
                        <span>{t('pujariExperience')}: {pujari.experience}</span>
                        <span>•</span>
                        <span className="flex items-center text-amber-600">★ {pujari.rating}</span>
                      </div>
                    </div>
                  </div>

                  {/* Languages and Specialties */}
                  <div className="space-y-2 text-xs">
                    <div className="flex flex-wrap gap-1 text-[10px] font-medium font-outfit text-stone-500">
                      <span className="font-bold text-stone-600">{t('pujariLanguages')}:</span>
                      {pujari.languages}
                    </div>
                    <div className="space-y-1">
                      <span className="font-bold text-stone-600 font-outfit text-[11px] block">{t('pujariSpecialty')}:</span>
                      <p className="font-lora text-[11px] text-stone-500 leading-relaxed line-clamp-2">
                        {pujari.specialization}
                      </p>
                    </div>
                    <div className="text-[10px] text-stone-400 leading-relaxed font-lora border-t border-stone-100 pt-2 flex items-start gap-1">
                      <MapPin className="h-3 w-3 text-amber-500 flex-shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{pujari.address}</span>
                    </div>
                  </div>
                </div>

                {/* Call-to-actions */}
                <div className="bg-stone-50/50 border-t border-stone-150 p-4 grid grid-cols-3 gap-2">
                  <a
                    href={`tel:${pujari.phone}`}
                    className="flex items-center justify-center border border-stone-200 hover:border-amber-400 bg-white hover:bg-stone-50 text-stone-700 text-xs font-bold py-2 rounded-xl transition-all shadow-sm"
                    aria-label="Call Priest"
                  >
                    <Phone className="h-3.5 w-3.5" />
                  </a>
                  <a
                    href={`https://wa.me/${pujari.whatsapp}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center border border-green-200 hover:border-green-400 bg-white hover:bg-green-50 text-green-700 text-xs font-bold py-2 rounded-xl transition-all shadow-sm"
                    aria-label="WhatsApp Priest"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                  </a>
                  <button
                    onClick={() => openBookingModal(pujari)}
                    className="col-span-1 bg-stone-900 hover:bg-amber-600 text-amber-100 hover:text-stone-950 text-[10px] font-outfit font-bold tracking-wider rounded-xl transition-all shadow-md uppercase"
                  >
                    {t('bookButton')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Booking Overlay Form Modal */}
      <PujariBookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        pujari={selectedPujari}
        pujas={pujas}
      />
    </div>
  );
}
