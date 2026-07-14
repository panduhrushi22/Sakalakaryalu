'use client';

import React, { useRef } from 'react';
import { ChevronDown } from 'lucide-react';

interface HeroSliderProps {
  brandName: string;
  tagline: string;
  discoverLabel: string;
}

export default function HeroSlider({ brandName, tagline, discoverLabel }: HeroSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDiscoverClick = () => {
    const nextSection = document.getElementById('discover-section');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative h-screen w-full overflow-hidden bg-stone-950"
    >
      {/* Static Background God Image */}
      <div className="relative h-full w-full overflow-hidden">
        <img
          src="/images/ganesh-puja.png"
          alt="Lord Ganesha"
          className="absolute inset-0 h-full w-full object-cover select-none pointer-events-none animate-ken-burns"
        />
        {/* Vignette Overlay for typography contrast */}
        <div className="absolute inset-0 glass-vignette opacity-80 z-10" />
      </div>

      {/* Floating Center Brand Content - Smooth Pop-Up Entrance Animation */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 z-20 pointer-events-none select-text">
        <h1 className="font-cinzel text-5xl sm:text-6xl md:text-8xl font-black text-white uppercase tracking-[0.18em] md:tracking-[0.25em] leading-none text-glow-white animate-title-popup select-text">
          {brandName}
        </h1>
        <p className="font-outfit text-xs sm:text-sm md:text-base text-stone-100 max-w-2xl mt-6 tracking-[0.15em] font-medium uppercase px-4 select-text leading-relaxed animate-tagline-popup">
          {tagline}
        </p>
      </div>

      {/* Discover Button at bottom center */}
      <button
        onClick={handleDiscoverClick}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center justify-center text-amber-200/90 hover:text-amber-400 font-outfit text-[10px] sm:text-xs tracking-[0.25em] font-bold uppercase transition-colors group duration-300 cursor-pointer"
      >
        <span>{discoverLabel || 'DISCOVER'}</span>
        <ChevronDown className="h-4 w-4 mt-1.5 animate-bounce-slow text-amber-400 group-hover:scale-125 transition-transform" />
      </button>
    </div>
  );
}
