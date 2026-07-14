'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from './LanguageProvider';
import { languages, LanguageCode } from '../lib/i18n';
import { Globe, ChevronDown } from 'lucide-react';

export const LanguageSwitcher: React.FC = () => {
  const { language, changeLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeLang = languages.find((l) => l.code === language) || languages[0];

  return (
    <div ref={containerRef} className="relative inline-block text-left z-50 font-outfit">
      <button
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        className="inline-flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100/75 text-stone-800 hover:text-amber-900 border border-amber-300 rounded-xl px-3 py-1.5 text-xs font-bold transition-all shadow-sm active:scale-95"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <Globe className="h-3.5 w-3.5 text-amber-600 animate-spin-slow" />
        <span>{activeLang.nativeLabel}</span>
        <ChevronDown className={`h-3 w-3 text-stone-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 rounded-2xl bg-white border border-stone-200 shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none animate-fade-in overflow-hidden">
          <div className="py-1 divide-y divide-stone-100" role="menu" aria-orientation="vertical">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  changeLanguage(lang.code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-left text-xs transition-colors hover:bg-amber-50/50 ${
                  language === lang.code
                    ? 'text-amber-950 bg-amber-50 font-extrabold'
                    : 'text-stone-600 hover:text-stone-900 font-semibold'
                }`}
                role="menuitem"
              >
                <span>{lang.nativeLabel}</span>
                <span className="text-[10px] text-stone-400 font-medium uppercase tracking-wider">{lang.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
