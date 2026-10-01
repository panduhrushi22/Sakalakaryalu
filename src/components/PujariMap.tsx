'use client';

import React, { useEffect, useRef, useState } from 'react';
import type L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Pujari {
  id: string;
  name: string;
  lat: number;
  lng: number;
  specialization: string;
  address: string;
  phone: string;
}

interface MapProps {
  pujaris: Pujari[];
  userLat?: number | null;
  userLng?: number | null;
}

export default function PujariMap({ pujaris, userLat, userLng }: MapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<L.Map | null>(null);
  
  const prevCoordsRef = useRef<{ lat: number | null; lng: number | null }>({ lat: null, lng: null });
  const prevPujariIdsRef = useRef<string>('');
  const prevUserMarkerKeyRef = useRef<string>('');
  const markersRef = useRef<L.Marker[]>([]);
  const isFirstCoordsUpdateRef = useRef(true);

  // 1. Initialize map on mount (default coordinates), clean up on unmount
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const L = require('leaflet');
    if (!mapContainerRef.current) return;

    // Initialize at a standard default location (Gachibowli, Hyderabad)
    const mapInstance = L.map(mapContainerRef.current).setView([17.4401, 78.3489], 11);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(mapInstance);

    setMap(mapInstance);

    const timer = setTimeout(() => {
      mapInstance.invalidateSize();
    }, 200);

    return () => {
      clearTimeout(timer);
      mapInstance.remove();
      setMap(null);
    };
  }, []); // Static empty array: no dependency warnings

  // 2. Handle dynamic updates (center setView/flyTo, markers) without recreating the map
  useEffect(() => {
    if (!map) return;

    map.invalidateSize();

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const L = require('leaflet');

    const centerLat = userLat || 17.4401;
    const centerLng = userLng || 78.3489;
    const zoomLevel = userLat && userLng ? 13 : 11;

    const coordsChanged =
      prevCoordsRef.current.lat !== userLat ||
      prevCoordsRef.current.lng !== userLng;

    if (coordsChanged) {
      if (isFirstCoordsUpdateRef.current) {
        // Set coordinates instantly on initial mount
        map.setView([centerLat, centerLng], zoomLevel);
        isFirstCoordsUpdateRef.current = false;
      } else {
        // Fly smoothly and slowly to the new coordinates
        map.flyTo([centerLat, centerLng], zoomLevel, {
          animate: true,
          duration: 3.5, // 3.5 seconds duration makes it extremely smooth and slow
          easeLinearity: 0.25,
        });
      }
      prevCoordsRef.current = { lat: userLat || null, lng: userLng || null };
    }

    // Define beautiful temple-gold SVG icon
    const templeIcon = L.divIcon({
      html: `
        <div class="flex flex-col items-center">
          <div class="bg-amber-500 text-stone-950 p-1.5 rounded-full border-2 border-amber-300 shadow-md transform hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" class="text-stone-950"><path d="M12 2L2 22h20L12 2z"/></svg>
          </div>
          <div class="w-1.5 h-1.5 bg-amber-500 rounded-full border border-amber-300 -mt-0.5"></div>
        </div>
      `,
      className: 'custom-leaflet-icon',
      iconSize: [28, 40],
      iconAnchor: [14, 40],
    });

    // Define red SVG icon for User Location if present
    const userIcon = L.divIcon({
      html: `
        <div class="flex flex-col items-center animate-bounce">
          <div class="bg-red-600 text-white p-1.5 rounded-full border-2 border-white shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-white"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
          </div>
        </div>
      `,
      className: 'user-leaflet-icon',
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    // Update markers only if pujaris or user location markers need refreshing
    const pujariIds = pujaris.map((p) => p.id).join(',');
    const prevPujariIds = prevPujariIdsRef.current;
    
    const userMarkerKey = `${userLat}-${userLng}`;
    const prevUserMarkerKey = prevUserMarkerKeyRef.current;

    if (pujariIds !== prevPujariIds || userMarkerKey !== prevUserMarkerKey) {
      // Clean up old markers
      markersRef.current.forEach((marker) => map.removeLayer(marker));
      markersRef.current = [];

      // Add User marker if coordinates provided
      if (userLat && userLng) {
        const userMarker = L.marker([userLat, userLng], { icon: userIcon })
          .addTo(map)
          .bindPopup('<strong>Your Current Location</strong>')
          .openPopup();
        markersRef.current.push(userMarker);
      }

      // Add Priest markers
      pujaris.forEach((pujari) => {
        if (pujari.lat && pujari.lng) {
          const marker = L.marker([pujari.lat, pujari.lng], { icon: templeIcon })
            .addTo(map)
            .bindPopup(`
              <div class="font-outfit p-1 space-y-1.5 min-w-[150px]">
                <strong class="font-cinzel text-xs font-bold text-amber-800 block">${pujari.name}</strong>
                <span class="text-[10px] text-stone-500 block">Spec: ${pujari.specialization.split(',').slice(0, 2).join(',')}...</span>
                <a href="tel:${pujari.phone}" class="bg-stone-900 text-amber-100 text-[10px] font-bold text-center block py-1.5 rounded-md hover:bg-amber-600 hover:text-stone-950 transition-all">Call Priest</a>
              </div>
            `);
          markersRef.current.push(marker);
        }
      });

      prevPujariIdsRef.current = pujariIds;
      prevUserMarkerKeyRef.current = userMarkerKey;
    }

  }, [map, pujaris, userLat, userLng]);

  return (
    <div className="relative w-full h-[350px] md:h-[450px] border-2 border-amber-200 rounded-3xl overflow-hidden shadow-lg bg-stone-100">
      <div ref={mapContainerRef} className="w-full h-full" style={{ zIndex: 1 }} />
    </div>
  );
}
