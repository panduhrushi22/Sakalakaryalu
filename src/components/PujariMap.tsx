'use client';

import React, { useEffect, useRef } from 'react';
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
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    // Dynamically import Leaflet on the client
    const L = require('leaflet');
    
    // Set default coordinates: Gachibowli, Hyderabad if user coordinates are not present
    const centerLat = userLat || 17.4401;
    const centerLng = userLng || 78.3489;
    const zoomLevel = userLat && userLng ? 13 : 11;

    if (!mapInstanceRef.current && mapContainerRef.current) {
      // Initialize map instance
      const map = L.map(mapContainerRef.current).setView([centerLat, centerLng], zoomLevel);
      mapInstanceRef.current = map;

      // Add OpenStreetMap tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);
    } else if (mapInstanceRef.current) {
      // If map already exists, update view port
      mapInstanceRef.current.setView([centerLat, centerLng], zoomLevel);
    }

    const map = mapInstanceRef.current;
    if (!map) return;

    // Clean up old markers
    markersRef.current.forEach((marker) => map.removeLayer(marker));
    markersRef.current = [];

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

  }, [pujaris, userLat, userLng]);

  return (
    <div className="relative w-full h-[350px] md:h-[450px] border-2 border-amber-200 rounded-3xl overflow-hidden shadow-lg bg-stone-100">
      <div ref={mapContainerRef} className="w-full h-full" style={{ zIndex: 1 }} />
    </div>
  );
}
