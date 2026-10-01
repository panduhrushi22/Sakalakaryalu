import React from 'react';
import { Flame } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-[70vh] w-full flex flex-col justify-center items-center px-4 bg-stone-950/80">
      <div className="flex flex-col items-center space-y-4">
        {/* Glowing Diya Pulse Icon */}
        <div className="relative flex items-center justify-center">
          <div className="absolute w-16 h-16 bg-amber-500/20 rounded-full animate-ping" />
          <div className="relative bg-amber-500 text-stone-950 p-4 rounded-full shadow-[0_0_30px_rgba(245,158,11,0.5)]">
            <Flame className="h-8 w-8 fill-amber-950 animate-pulse text-stone-950" />
          </div>
        </div>
        
        {/* Loading text */}
        <div className="text-center space-y-1">
          <h3 className="font-cinzel text-lg font-bold text-amber-200 tracking-widest uppercase">
            Loading Sacred Portal
          </h3>
          <p className="font-lora text-xs text-stone-400">
            Fetching auspicious details...
          </p>
        </div>
      </div>
    </div>
  );
}
