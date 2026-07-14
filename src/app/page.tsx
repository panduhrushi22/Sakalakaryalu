import React from 'react';
import Link from 'next/link';
import HeroSlider from '@/components/HeroSlider';
import PageTransitionController from '@/components/PageTransitionController';
import { cookies } from 'next/headers';
import { i18nDictionary, LanguageCode } from '@/lib/i18n';

export const revalidate = 0; // Fetch fresh data always

export default async function HomePage() {
  const cookieStore = cookies();
  const currentLang = (cookieStore.get('sakalakaryalu_lang')?.value || 'en') as LanguageCode;
  const dict = i18nDictionary[currentLang] || i18nDictionary['en'];

  return (
    <PageTransitionController
      hero={
        <HeroSlider
          brandName={dict.brandName}
          tagline={dict.heroTitle}
          discoverLabel={currentLang === 'te' ? 'అన్వేషించండి' : currentLang === 'hi' ? 'ఖోజెం' : 'DISCOVER'}
        />
      }
      secondContent={
        <div className="relative text-stone-100 h-screen w-full flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 overflow-hidden bg-stone-950">
          {/* Animated Brahma Background Image */}
          <div className="absolute inset-0 w-full h-full z-0 overflow-hidden pointer-events-none select-none">
            <img
              src="/images/brahma-portal.png"
              alt="Brahma Background"
              className="w-full h-full object-cover animate-ken-burns select-none pointer-events-none"
            />
            {/* Subtle vignette overlay for text contrast */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60 z-10 pointer-events-none" />
          </div>
          
          <div className="w-full max-w-5xl mx-auto space-y-8 z-10">
            {/* Section Header */}
            <div className="text-center space-y-3">
              <h2 className="font-cinzel text-4xl sm:text-5xl font-black text-amber-100 tracking-wider text-glow-gold">
                {currentLang === 'te' ? 'మీ ప్రపంచాన్ని ఎంచుకోండి' : currentLang === 'hi' ? 'अपना संसार चुनें' : 'Choose Your World'}
              </h2>
              <p className="font-lora text-amber-200/50 text-xs sm:text-sm tracking-wide">
                {currentLang === 'te' ? 'ఆధ్యాత్మిక సేవల కొరకు క్రింది విభాగాన్ని ఎంచుకోండి' : 
                 currentLang === 'hi' ? 'आध्यात्मिक सेवाओं के लिए निम्न विकल्प चुनें' : 
                 'Select an option below to enter spiritual services.'}
              </p>
            </div>

            {/* Two Side-by-Side Portal Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
              {/* Card 1: Pujas & Panchangam */}
              <Link
                href="/pujas"
                className="relative h-[420px] rounded-3xl overflow-hidden group hover-pop-slow block shadow-2xl border border-stone-850 bg-stone-900/10"
              >
                {/* Background image zooms slowly over 2.5s */}
                <img
                  src="/images/general-puja.png"
                  alt="Pujas and Panchangams"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2.5s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105 pointer-events-none select-none"
                />
                {/* Vignette Overlay gets darker slowly over 2.5s */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#14110f]/95 via-black/35 to-transparent transition-opacity duration-[2.5s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:opacity-90 z-10 pointer-events-none" />
                
                {/* Content Overlay */}
                <div className="absolute inset-0 flex flex-col justify-end p-8 z-20 pointer-events-none">
                  <span className="font-cinzel text-2xl sm:text-3xl font-extrabold text-white tracking-wide text-glow-white">
                    {currentLang === 'te' ? 'పూజలు & పంచాంగములు' : currentLang === 'hi' ? 'पूजा और पंचांग' : 'Pujas & Panchangams'}
                  </span>
                  <span className="text-[10px] sm:text-xs tracking-[0.25em] font-outfit uppercase text-amber-400 mt-3 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-[2.5s] ease-[cubic-bezier(0.16,1,0.3,1)]">
                    {currentLang === 'te' ? 'అన్ని పూజలు వీక్షించండి' : currentLang === 'hi' ? 'सभी पूजा देखें' : 'View All Pujas'} →
                  </span>
                </div>
              </Link>

              {/* Card 2: Find Pujari (GPS Map Location) */}
              <Link
                href="/pujaris?map=true"
                className="relative h-[420px] rounded-3xl overflow-hidden group hover-pop-slow block shadow-2xl border border-stone-850 bg-stone-900/10"
              >
                {/* Background image zooms slowly over 2.5s */}
                <img
                  src="/images/satyanarayana-vratham.png"
                  alt="Find Pujari"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2.5s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105 pointer-events-none select-none"
                />
                {/* Vignette Overlay gets darker slowly over 2.5s */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#14110f]/95 via-black/35 to-transparent transition-opacity duration-[2.5s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:opacity-90 z-10 pointer-events-none" />
                
                {/* Content Overlay */}
                <div className="absolute inset-0 flex flex-col justify-end p-8 z-20 pointer-events-none">
                  <span className="font-cinzel text-2xl sm:text-3xl font-extrabold text-white tracking-wide text-glow-white">
                    {currentLang === 'te' ? 'పురోహితుల శోధన (GPS)' : currentLang === 'hi' ? 'पुजारी खोजें (GPS)' : 'Find Your Pujari'}
                  </span>
                  <span className="text-[10px] sm:text-xs tracking-[0.25em] font-outfit uppercase text-amber-400 mt-3 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-[2.5s] ease-[cubic-bezier(0.16,1,0.3,1)]">
                    {currentLang === 'te' ? 'మ్యాప్ తెరవండి' : currentLang === 'hi' ? 'मानचित्र खोलें' : 'Open GPS Section'} →
                  </span>
                </div>
              </Link>
            </div>
          </div>

        </div>
      }
    />
  );
}
