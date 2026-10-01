import React from 'react';

export default function PujasLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 animate-pulse">
      {/* Title skeleton */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="h-6 w-36 bg-amber-100/60 rounded-full mx-auto" />
        <div className="h-10 w-3/4 bg-stone-200 rounded-xl mx-auto" />
        <div className="h-4 w-1/2 bg-stone-200 rounded-md mx-auto" />
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm h-96 flex flex-col justify-between">
            <div className="h-52 bg-stone-200 w-full" />
            <div className="p-6 space-y-3">
              <div className="h-6 bg-stone-200 rounded w-3/4" />
              <div className="h-4 bg-stone-150 rounded w-full" />
              <div className="h-4 bg-stone-150 rounded w-2/3" />
            </div>
            <div className="p-6 pt-0">
              <div className="h-10 bg-stone-900/80 rounded-xl w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
