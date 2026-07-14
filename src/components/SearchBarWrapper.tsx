'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

interface SearchBarWrapperProps {
  placeholder?: string;
  initialValue?: string;
}

export default function SearchBarWrapper({ placeholder = 'Search...', initialValue = '' }: SearchBarWrapperProps) {
  const [query, setQuery] = useState(initialValue);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/pujas?search=${encodeURIComponent(query.trim())}`);
    } else {
      router.push('/pujas');
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative flex items-center">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-5 pr-12 py-4 bg-white/95 text-stone-900 border-2 border-amber-500 rounded-2xl shadow-xl focus:outline-none focus:ring-4 focus:ring-amber-500/20 font-outfit text-sm sm:text-base"
      />
      <button
        type="submit"
        className="absolute right-2 p-2.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-stone-950 rounded-xl transition-all shadow-md"
        aria-label="Search"
      >
        <Search className="h-5 w-5" />
      </button>
    </form>
  );
}
