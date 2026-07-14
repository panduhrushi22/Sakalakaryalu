import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { Clock, Search, BookOpen, Sparkles, HelpCircle } from 'lucide-react';
import SearchBarWrapper from '@/components/SearchBarWrapper';
import { cookies } from 'next/headers';
import { i18nDictionary, getLocalized, LanguageCode } from '@/lib/i18n';

export const revalidate = 0; // Fresh queries always

export default async function PujasDirectoryPage({
  searchParams,
}: {
  searchParams: { search?: string; category?: string };
}) {
  const currentSearch = searchParams.search || '';
  const currentCategory = searchParams.category || 'all';

  const cookieStore = cookies();
  const currentLang = (cookieStore.get('sakalakaryalu_lang')?.value || 'en') as LanguageCode;
  const dict = i18nDictionary[currentLang] || i18nDictionary['en'];

  // Build the DB where clause
  let whereClause: any = {
    category: { in: ['festival', 'vratham'] }
  };

  if (currentCategory !== 'all' && ['festival', 'vratham'].includes(currentCategory)) {
    whereClause.category = currentCategory;
  }

  if (currentSearch) {
    whereClause.AND = [
      { category: { in: ['festival', 'vratham'] } },
      {
        OR: [
          { name: { contains: currentSearch } },
          { intro: { contains: currentSearch } },
          { significance: { contains: currentSearch } }
        ]
      }
    ];
  }

  // Retrieve Pujas with translations included
  const pujas = await prisma.puja.findMany({
    where: whereClause,
    orderBy: { name: 'asc' },
    include: {
      translations: true,
    },
  });

  const categories = currentLang === 'te' ? [
    { key: 'all', name: 'అన్నీ' },
    { key: 'festival', name: 'పండుగలు' },
    { key: 'vratham', name: 'వ్రతములు' },
  ] : currentLang === 'hi' ? [
    { key: 'all', name: 'सभी पूजा' },
    { key: 'festival', name: 'त्यौहार विधि' },
    { key: 'vratham', name: 'व्रत कथा' },
  ] : [
    { key: 'all', name: 'All Pujas' },
    { key: 'festival', name: 'Festival Pujas' },
    { key: 'vratham', name: 'Vratham Guides' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Page Title Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center space-x-1.5 bg-amber-100 text-amber-800 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider">
          <BookOpen className="h-4 w-4" />
          <span>{currentLang === 'te' ? 'పూజా విధాన గ్రంథాలయం' : currentLang === 'hi' ? 'पूजा पुस्तकालय' : 'Sacred Guide Library'}</span>
        </div>
        <h1 className="font-cinzel text-3xl sm:text-4xl md:text-5xl font-black text-stone-800 leading-tight">
          {dict.pujasTitle}
        </h1>
        <p className="font-lora text-stone-600 text-sm sm:text-base leading-relaxed">
          {dict.pujasSub}
        </p>
      </div>

      {/* Search and Category Filters Panel */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-md space-y-6">
        <div className="max-w-xl mx-auto">
          <SearchBarWrapper placeholder={dict.searchPlaceholder} initialValue={currentSearch} />
        </div>

        {/* Category Filters Chips */}
        <div className="flex flex-wrap justify-center gap-2 pt-2 border-t border-stone-100">
          {categories.map((cat) => {
            const isActive = currentCategory === cat.key;
            const urlParams = new URLSearchParams();
            if (currentSearch) urlParams.set('search', currentSearch);
            if (cat.key !== 'all') urlParams.set('category', cat.key);
            const href = `/pujas?${urlParams.toString()}`;

            return (
              <Link
                key={cat.key}
                href={href}
                className={`font-outfit text-xs sm:text-sm font-semibold px-4 py-2 rounded-full transition-all border ${
                  isActive
                    ? 'bg-amber-600 border-amber-600 text-stone-950 shadow-md scale-105'
                    : 'bg-stone-50 border-stone-200 text-stone-600 hover:border-amber-400 hover:text-amber-700'
                }`}
              >
                {cat.name}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Pujas Grid Listing */}
      {pujas.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {pujas.map((puja) => (
            <div
              key={puja.id}
              className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Image overlay container */}
                <div className="h-52 relative bg-stone-100 overflow-hidden">
                  <img
                    src={puja.thumbnailImage || puja.image}
                    alt={getLocalized(puja, 'name', currentLang)}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 bg-amber-500 text-stone-950 text-[10px] uppercase font-outfit font-black tracking-wider px-3 py-1 rounded-full shadow-md">
                    {puja.category}
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  <h3 className="font-cinzel text-lg sm:text-xl font-bold text-stone-800 leading-tight group-hover:text-amber-700 transition-colors">
                    {getLocalized(puja, 'name', currentLang)}
                  </h3>
                  <p className="text-xs text-stone-500 font-lora line-clamp-3 leading-relaxed">
                    {getLocalized(puja, 'intro', currentLang)}
                  </p>
                </div>
              </div>

              {/* Grid bottom stats and CTA */}
              <div className="p-6 pt-0 space-y-4">
                <div className="flex items-center justify-between text-xs text-stone-500 font-outfit border-t border-stone-100 pt-4">
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-1 text-amber-500" />
                    {puja.duration}
                  </span>
                  <span className="bg-stone-100 text-stone-700 px-2.5 py-0.5 rounded font-semibold text-[11px] uppercase tracking-wider">
                    {puja.difficulty}
                  </span>
                </div>

                <Link
                  href={`/pujas/${puja.slug}`}
                  className="w-full text-center block bg-stone-900 hover:bg-amber-600 text-amber-100 hover:text-stone-950 text-xs font-outfit font-black py-3 rounded-xl transition-colors shadow-sm uppercase tracking-widest"
                >
                  {currentLang === 'te' ? 'పూర్తి విధానాన్ని చూడండి' : currentLang === 'hi' ? 'पूर्ण पूजा विधि देखें' : 'View Full Procedure'}
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border-2 border-stone-200 border-dashed rounded-3xl p-12 text-center max-w-xl mx-auto space-y-4 shadow-inner">
          <div className="inline-flex p-4 bg-amber-50 rounded-full text-amber-600">
            <HelpCircle className="h-10 w-10" />
          </div>
          <h3 className="font-cinzel text-xl font-bold text-stone-800">
            {currentLang === 'te' ? 'ఎలాంటి ఫలితాలు దొరకలేదు' : currentLang === 'hi' ? 'कोई परिणाम नहीं मिला' : 'No Matching Puja Guides Found'}
          </h3>
          <p className="font-lora text-stone-500 text-sm leading-relaxed">
            {currentLang === 'te' ? 'మీరు వెతికిన పదానికి సరిపోయే పూజలు మా వద్ద లేవు. దయచేసి స్పెల్లింగ్ సరిచూసుకోండి లేదా వేరే విభాగం ఎంచుకోండి.' : 
             currentLang === 'hi' ? 'आपकी खोज के अनुरूप कोई पूजा नियमावली नहीं मिली। कृपया पुनः प्रयास करें।' : 
             "We couldn't find any pujas matching your criteria. Try checking spelling or browsing another category."}
          </p>
          <div className="pt-2">
            <Link
              href="/pujas"
              className="bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-outfit font-bold px-6 py-2.5 rounded-full shadow-md inline-block"
            >
              {currentLang === 'te' ? 'అన్ని ఫిల్టర్లను తొలగించండి' : currentLang === 'hi' ? 'फिल्टर साफ़ करें' : 'Clear All Filters'}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
