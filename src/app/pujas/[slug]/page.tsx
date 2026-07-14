import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { Clock, Star, Flame, Calendar, BookOpen, Compass, ChevronRight, HelpCircle } from 'lucide-react';
import PujaChecklist from '@/components/PujaChecklist';
import PujaStepsStepper from '@/components/PujaStepsStepper';

import { cookies } from 'next/headers';
import { i18nDictionary, getLocalized, LanguageCode } from '@/lib/i18n';

export const revalidate = 0; // Fresh queries always

const stepTranslations: Record<string, Record<string, { title: string; desc: string }>> = {
  te: {
    'Sankalpam': { title: 'సంకల్పం', desc: 'పూజ ఫలితాలు సిద్ధించాలని దేవుని ముందు ప్రతిజ్ఞ చేయడం.' },
    'Dhyanam & Prarthana': { title: 'ధ్యానం & ప్రార్థన', desc: 'శాంత మనస్సుతో ఇష్టదైవాన్ని తలచుకుని ప్రార్థించడం.' },
    'Deeparadhana': { title: 'దీపారాధన', desc: 'నెయ్యి లేదా నూనెతో పవిత్ర దీపము వెలిగించి నమస్కరించుకోవడం.' },
    'Ganapathi Puja': { title: 'గణపతి పూజ', desc: 'పూజ నిర్విఘ్నంగా సాగడానికి పసుపు గణపతి పూజ చేయడం.' },
    'Abhishekam': { title: 'అభిషేకం', desc: 'శుద్ధ జలం, పాలు, పంచామృతములతో అభిషేకం చేయడం.' },
    'Archana': { title: 'అర్చన', desc: 'దేవుని అష్టోత్తర శతనామములతో పూజా పుష్పాలు సమర్పించడం.' },
    'Naivedyam & Aarti': { title: 'నైవేద్యం & హారతి', desc: 'మధుర ప్రసాదాలు నివేదించి కర్పూర హారతి ఇవ్వడం.' },
  },
  hi: {
    'Sankalpam': { title: 'संकल्पम', desc: 'पूजा की सिद्धि के लिए भगवान के समक्ष प्रतिज्ञा करना।' },
    'Dhyanam & Prarthana': { title: 'ध्यान और प्रार्थना', desc: 'शांत मन से इष्टदेव का स्मरण कर प्रार्थना करना।' },
    'Deeparadhana': { title: 'दीपाराधना', desc: 'शुद्ध घी अथवा तेल का दीपक जलाकर आरती करना।' },
    'Ganapathi Puja': { title: 'गणपति पूजा', desc: 'पूजा निर्विघ्न संपन्न हो, इसलिए हल्दी के गणपति की पूजा करना।' },
    'Abhishekam': { title: 'अभिषेकम', desc: 'गंगाजल, दूध और पंचामृत से विग्रह का अभिषेक करना।' },
    'Archana': { title: 'अर्चना', desc: 'भगवान के १०८ नाम मंत्रों का उच्चारण कर पुष्प अर्पित करना।' },
    'Naivedyam & Aarti': { title: 'नैवेद्य और आरती', desc: 'भोग अर्पित कर कर्पूर आरती करना व आशीर्वाद लेना।' },
  }
};

export default async function PujaDetailPage({ params }: { params: { slug: string } }) {
  const cookieStore = cookies();
  const currentLang = (cookieStore.get('sakalakaryalu_lang')?.value || 'en') as LanguageCode;
  const dict = i18nDictionary[currentLang] || i18nDictionary['en'];

  // Query DB directly on the server
  const puja = await prisma.puja.findUnique({
    where: { slug: params.slug },
    include: {
      items: {
        include: { translations: true }
      },
      steps: {
        orderBy: { stepNumber: 'asc' },
      },
      mantras: {
        include: { translations: true }
      },
      translations: true,
    },
  });

  if (!puja) {
    notFound();
  }

  // Localize Puja main strings
  const localizedName = getLocalized(puja, 'name', currentLang);
  const localizedIntro = getLocalized(puja, 'intro', currentLang);
  const localizedSignificance = getLocalized(puja, 'significance', currentLang);
  const localizedBenefits = getLocalized(puja, 'benefits', currentLang);
  const localizedBestTime = getLocalized(puja, 'bestTime', currentLang, puja.bestTime || '');

  // Localize Items list for props passing
  const localizedItems = puja.items.map((item) => ({
    ...item,
    name: getLocalized(item, 'name', currentLang),
  }));

  // Localize steps using our smart lookup map
  const localizedSteps = puja.steps.map((step) => {
    const matched = stepTranslations[currentLang]?.[step.title];
    return {
      ...step,
      title: matched ? matched.title : step.title,
      description: matched ? matched.desc : step.description,
    };
  });

  return (
    <div className="space-y-12 pb-16">
      {/* 1. Dynamic Deity-Specific Spiritual Hero Header */}
      {(() => {
        // Resolve theme colors dynamically
        const theme = {
          saffron: {
            gradient: 'from-orange-950/90 via-amber-900/80 to-stone-950/95',
            accentText: 'text-orange-400',
            badgeBg: 'bg-orange-600 text-stone-950',
            borderAccent: 'border-orange-500',
            glow: 'shadow-[0_0_40px_rgba(245,158,11,0.25)]',
            btnPrimary: 'bg-orange-500 hover:bg-orange-400 text-stone-950',
          },
          blue: {
            gradient: 'from-blue-950/95 via-indigo-950/85 to-stone-950/95',
            accentText: 'text-indigo-400',
            badgeBg: 'bg-indigo-600 text-amber-100',
            borderAccent: 'border-indigo-500',
            glow: 'shadow-[0_0_40px_rgba(99,102,241,0.2)]',
            btnPrimary: 'bg-indigo-500 hover:bg-indigo-400 text-white',
          },
          gold: {
            gradient: 'from-amber-950/90 via-yellow-900/85 to-stone-950/95',
            accentText: 'text-amber-400',
            badgeBg: 'bg-amber-500 text-stone-950',
            borderAccent: 'border-amber-500',
            glow: 'shadow-[0_0_40px_rgba(245,158,11,0.3)]',
            btnPrimary: 'bg-amber-500 hover:bg-amber-400 text-stone-950',
          },
          red: {
            gradient: 'from-red-950/95 via-rose-900/85 to-stone-950/95',
            accentText: 'text-rose-400',
            badgeBg: 'bg-red-600 text-white',
            borderAccent: 'border-red-500',
            glow: 'shadow-[0_0_40px_rgba(220,38,38,0.25)]',
            btnPrimary: 'bg-red-600 hover:bg-red-500 text-white',
          },
          'gold-pink': {
            gradient: 'from-amber-950/90 via-rose-950/80 to-stone-950/95',
            accentText: 'text-rose-400',
            badgeBg: 'bg-gradient-to-r from-amber-500 to-rose-500 text-stone-950',
            borderAccent: 'border-rose-500',
            glow: 'shadow-[0_0_40px_rgba(244,63,94,0.3)]',
            btnPrimary: 'bg-gradient-to-r from-amber-500 to-rose-500 text-stone-950',
          }
        }[puja.themeColors as 'saffron'|'blue'|'gold'|'red'|'gold-pink'] || {
          gradient: 'from-amber-950/90 via-stone-900/80 to-stone-950/95',
          accentText: 'text-amber-400',
          badgeBg: 'bg-amber-500 text-stone-950',
          borderAccent: 'border-amber-500',
          glow: 'shadow-[0_0_40px_rgba(245,158,11,0.2)]',
          btnPrimary: 'bg-amber-500 hover:bg-amber-400 text-stone-950',
        };

        return (
          <section className={`relative min-h-[420px] text-white py-16 px-4 shadow-2xl border-b-8 ${theme.borderAccent} overflow-hidden`}>
            {/* Widescreen optimized background banner */}
            <div className="absolute inset-0 z-0">
              <img
                src={puja.bannerImage}
                alt="Spiritual Backdrop"
                className="w-full h-full object-cover object-center opacity-30 transform scale-105 filter blur-[1px] transition-transform duration-[10s]"
              />
              <div className={`absolute inset-0 bg-gradient-to-b ${theme.gradient} mix-blend-multiply`} />
              <div className="absolute inset-0 bg-radial-gradient from-transparent to-stone-950/80" />
            </div>

            {/* Glowing animated Diya active presence badge */}
            <div className="absolute right-4 top-4 md:right-8 md:top-8 flex items-center gap-2 bg-stone-950/75 border border-amber-500/30 px-4 py-2 rounded-full backdrop-blur-md z-20 shadow-lg">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-300 font-outfit">Spiritual Mood Active</span>
            </div>

            {/* Content Container */}
            <div className="max-w-6xl mx-auto space-y-8 relative z-10">
              {/* Breadcrumbs */}
              <div className="flex flex-wrap items-center space-x-2 text-xs text-amber-200/60 font-outfit uppercase tracking-wider no-print">
                <Link href="/" className="hover:text-amber-400 transition-colors">{dict.navHome}</Link>
                <ChevronRight className="h-3 w-3" />
                <Link href="/pujas" className="hover:text-amber-400 transition-colors">{dict.navPujas}</Link>
                <ChevronRight className="h-3 w-3" />
                <span className="text-amber-400 font-semibold">{localizedName}</span>
              </div>

              <div className="flex flex-col lg:flex-row gap-10 items-center justify-between">
                {/* Deity Image Avatar Left Block */}
                <div className="flex flex-col sm:flex-row items-center gap-6 w-full lg:max-w-3xl">
                  {/* Glowing dynamic image avatar */}
                  <div className={`relative group w-36 h-36 rounded-full overflow-hidden border-4 ${theme.borderAccent} flex-shrink-0 shadow-2xl ${theme.glow}`}>
                    <img
                      src={puja.heroImage}
                      alt={puja.deityName}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent opacity-60" />
                    <div className={`absolute inset-0 rounded-full border border-amber-400 animate-ping opacity-15`} />
                  </div>

                  {/* Title & Slogan details */}
                  <div className="space-y-3.5 text-center sm:text-left">
                    <span className={`inline-block ${theme.badgeBg} text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-md`}>
                      {puja.category} Manual
                    </span>
                    <h1 className="font-cinzel text-3xl sm:text-4xl md:text-5xl font-black leading-tight text-amber-100 tracking-wide drop-shadow-md">
                      {localizedName}
                    </h1>
                    <p className={`font-lora text-[11px] sm:text-xs tracking-wider uppercase font-bold ${theme.accentText} border-l-2 ${theme.borderAccent} pl-2 ml-1 hidden sm:block`}>
                      {puja.slug === 'ganesh-puja' ? 'Remove obstacles and invite prosperity' : `Sacred Devotional Ritual for ${puja.deityName}`}
                    </p>
                    <p className="font-lora text-xs sm:text-sm text-stone-200/90 leading-relaxed max-w-xl">
                      {localizedIntro}
                    </p>
                  </div>
                </div>

                {/* Quick stats info card */}
                <div className="bg-stone-950/70 border border-amber-500/20 p-5 rounded-2xl w-full lg:max-w-xs space-y-3.5 font-outfit text-xs sm:text-sm text-stone-300 shadow-2xl backdrop-blur-sm">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 block border-b border-stone-850 pb-2">
                    {currentLang === 'te' ? 'త్వరిత పూజా వివరాలు' : currentLang === 'hi' ? 'पूजा विवरण' : 'Quick Puja Details'}
                  </span>
                  <div className="flex justify-between">
                    <span>{dict.duration}:</span>
                    <strong className="text-amber-300 font-medium">{puja.duration}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>{dict.difficulty}:</span>
                    <strong className="text-amber-300 font-medium">{puja.difficulty}</strong>
                  </div>
                  {localizedBestTime && (
                    <div className="flex flex-col pt-1">
                      <span>{dict.bestAuspiciousTime}:</span>
                      <strong className="text-amber-300 font-medium font-lora mt-0.5">{localizedBestTime}</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons CTAs */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3.5 pt-4 border-t border-stone-800/40 no-print">
                <a
                  href="#procedure"
                  className={`px-5 py-3 ${theme.btnPrimary} font-outfit font-black text-xs uppercase tracking-widest rounded-xl shadow-lg transition-transform hover:-translate-y-0.5 active:translate-y-0`}
                >
                  View Procedure
                </a>
                <Link
                  href={`/pujaris?specialty=${encodeURIComponent(localizedName)}`}
                  className="px-5 py-3 bg-stone-900 hover:bg-stone-800 text-amber-300 border border-amber-500/30 font-outfit font-black text-xs uppercase tracking-widest rounded-xl shadow-md transition-transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  Find Nearby Pujari
                </Link>
                {localizedItems && localizedItems.length > 0 && (
                  <a
                    href="#checklist"
                    className="px-5 py-3 bg-stone-950/80 hover:bg-stone-900 text-amber-100/90 border border-stone-850 hover:border-amber-500/20 font-outfit font-black text-xs uppercase tracking-widest rounded-xl shadow-md transition-transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    Order Puja Items
                  </a>
                )}
              </div>

            </div>
          </section>
        );
      })()}

      {/* Main Page Layout Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT 2 COLUMNS: Significance, Items, Stepper, Mantras, Video */}
          <div className="lg:col-span-2 space-y-10">
            
            {/* A. Significance and Benefits */}
            <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-md space-y-6">
              <div className="space-y-4">
                <h3 className="font-cinzel text-lg sm:text-xl font-bold text-stone-800 border-b border-stone-150 pb-3 flex items-center">
                  <Flame className="h-5 w-5 mr-2 text-amber-600 fill-amber-50" />
                  {currentLang === 'te' ? 'పూజా విశిష్టత & ఆధ్యాత్మిక ప్రయోజనాలు' : 
                   currentLang === 'hi' ? 'पूजा महत्व और आध्यात्मिक लाभ' : 
                   'Spiritual Significance & Benefits'}
                </h3>
                <div className="font-lora text-xs sm:text-sm text-stone-600 leading-relaxed space-y-3">
                  <p className="font-semibold text-amber-900">{dict.significance}:</p>
                  <p>{localizedSignificance}</p>
                </div>
              </div>

              {localizedBenefits && (
                <div className="bg-amber-50/40 border border-amber-200/50 p-5 rounded-2xl space-y-2">
                  <h4 className="font-outfit font-bold text-xs sm:text-sm text-amber-900 uppercase tracking-wider flex items-center">
                    <Star className="h-4 w-4 mr-1 text-amber-600 fill-amber-500" />
                    {dict.benefits}
                  </h4>
                  <p className="font-lora text-xs sm:text-sm text-stone-700 leading-relaxed">
                    {localizedBenefits}
                  </p>
                </div>
              )}
            </div>

            {/* B. Items Checklist (Client Component!) */}
            {localizedItems && localizedItems.length > 0 && (
              <div id="checklist">
                <PujaChecklist items={localizedItems} pujaName={localizedName} pujaId={puja.id} />
              </div>
            )}

            {/* C. Step-by-Step Stepper (Client Component!) */}
            {localizedSteps && localizedSteps.length > 0 && (
              <div id="procedure">
                <PujaStepsStepper steps={localizedSteps} />
              </div>
            )}

            {/* D. Mantras Chants Section */}
            {puja.mantras && puja.mantras.length > 0 && (
              <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-md space-y-6">
                <h3 className="font-cinzel text-lg sm:text-xl font-bold text-stone-800 border-b border-stone-150 pb-3 flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-amber-600" />
                  {dict.mantrasTitle}
                </h3>

                <div className="space-y-8">
                  {puja.mantras.map((mantra) => {
                    const localizedMeaning = getLocalized(mantra, 'meaning', currentLang);
                    return (
                      <div
                        key={mantra.id}
                        className="border border-stone-150 rounded-2xl p-5 space-y-4 bg-stone-50/50"
                      >
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-bold tracking-widest text-amber-600 font-outfit">Mantra Chant</span>
                          <h4 className="font-cinzel text-base font-bold text-stone-850">{mantra.name}</h4>
                        </div>

                        {/* Scripts Carousels/Boxes */}
                        <div className="space-y-3.5 bg-white p-4 rounded-xl border border-stone-200">
                          {mantra.sanskrit && (
                            <div className="space-y-1">
                              <span className="text-[9px] uppercase font-bold tracking-wider text-stone-400 font-outfit">Sanskrit (देवनागरी)</span>
                              <p className="text-sm font-bold text-stone-800 tracking-wide font-lora leading-relaxed">{mantra.sanskrit}</p>
                            </div>
                          )}
                          {mantra.telugu && (
                            <div className="space-y-1 border-t border-stone-100 pt-3">
                              <span className="text-[9px] uppercase font-bold tracking-wider text-stone-400 font-outfit">Telugu (తెలుగు లిపి)</span>
                              <p className="text-sm font-bold text-amber-900 tracking-wide font-lora leading-relaxed">{mantra.telugu}</p>
                            </div>
                          )}
                          {mantra.english && (
                            <div className="space-y-1 border-t border-stone-100 pt-3">
                              <span className="text-[9px] uppercase font-bold tracking-wider text-stone-400 font-outfit">English Transliteration</span>
                              <p className="text-xs italic text-stone-600 font-outfit leading-relaxed">{mantra.english}</p>
                            </div>
                          )}
                        </div>

                        {localizedMeaning && (
                          <div className="text-xs text-stone-500 font-lora leading-relaxed border-l-2 border-amber-500 pl-3">
                            <span className="font-bold text-stone-700 block mb-0.5 text-[11px] uppercase tracking-wider font-outfit">{dict.mantraMeaning}:</span>
                            {localizedMeaning}
                          </div>
                        )}


                      </div>
                    );
                  })}
                </div>
              </div>
            )}


          </div>

          {/* RIGHT 1 COLUMN: Sticky Priest Booking and FAQ widgets */}
          <div className="space-y-6 no-print">
            
            {/* Sticky Priest Booking widget */}
            <div className="bg-gradient-to-br from-amber-600 to-amber-900 rounded-3xl p-6 shadow-xl text-amber-50 space-y-6 sticky top-24 border border-amber-400/20">
              <div className="space-y-3">
                <span className="bg-amber-400 text-stone-950 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-md inline-block">
                  {currentLang === 'te' ? 'పురోహిత సేవలు' : currentLang === 'hi' ? 'पुजारी बुकिंग सेवा' : 'Pandit Booking Services'}
                </span>
                <h3 className="font-cinzel text-xl sm:text-2xl font-bold leading-snug">
                  {currentLang === 'te' ? 'పూజల కొరకు సమర్థులైన పురోహితులను బుక్ చేసుకోండి' : 
                   currentLang === 'hi' ? 'शास्त्रोक्त पूजन हेतु पुरोहित बुक करें' : 
                   'Book Verified pandits for auspicious ceremonies'}
                </h3>
                <p className="font-lora text-amber-100/90 text-xs sm:text-sm leading-relaxed">
                  {currentLang === 'te' ? 'ఈ పూజను మీ ఇంట్లో లేదా వ్యాపార స్థలంలో పురోహితుడితో జరిపించాలనుకుంటున్నారా? మా వద్ద దూరం ఆధారంగా ఉత్తమ పురోహితులు లభిస్తారు.' : 
                   currentLang === 'hi' ? 'क्या आप इस पूजा को अपने घर पर करवाना चाहते हैं? अपने क्षेत्र के सबसे अनुभवी पुजारियों को खोजें।' : 
                   'Want this puja conducted by a verified priest at your home? We list regional priests sorted by coordinates.'}
                </p>
              </div>

              <div className="pt-2 border-t border-amber-500/30 space-y-3">
                <Link
                  href={`/pujaris?specialty=${encodeURIComponent(localizedName)}`}
                  className="w-full text-center block bg-amber-400 hover:bg-amber-300 text-stone-950 font-outfit font-bold text-xs tracking-wider py-3.5 rounded-xl transition-all shadow-md uppercase hover:scale-[1.02]"
                >
                  {dict.bookPriest}
                </Link>
                <div className="text-center">
                  <span className="text-[10px] text-amber-200 font-outfit">
                    {currentLang === 'te' ? 'ఎలాంటి బుకింగ్ రుసుములు లేవు' : currentLang === 'hi' ? 'कोई अतिरिक्त शुल्क नहीं' : 'No Booking Charges'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Puja FAQ Card */}
            <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-sm space-y-4">
              <h4 className="font-cinzel text-sm font-bold text-stone-800 uppercase tracking-wider pb-2 border-b border-stone-100 flex items-center">
                <HelpCircle className="h-4 w-4 mr-1.5 text-amber-500" />
                {currentLang === 'te' ? 'తరచుగా అడిగే ప్రశ్నలు (FAQ)' : currentLang === 'hi' ? 'सामान्य प्रश्नोत्तर' : 'Common Puja FAQs'}
              </h4>
              <div className="space-y-3 font-lora text-[11px] sm:text-xs text-stone-600">
                <div className="space-y-1">
                  <p className="font-bold text-stone-800">{currentLang === 'te' ? 'పురోహితులు లేకుండా నేనే ఇంట్లో చేసుకోవచ్చా?' : 'Can I perform this at home without a priest?'}</p>
                  <p>{currentLang === 'te' ? 'అవును. మా పూజా గైడ్‌లు మరియు సామాగ్రి చెక్‌లిస్ట్‌లు సామాన్యులు కూడా సులభంగా ఆచరించేలా విభజించి ఇవ్వబడినవి.' : 'Yes. Our detailed guides and items checkboards are structured to help all age groups perform simple rituals at home.'}</p>
                </div>
                <div className="space-y-1 pt-2 border-t border-stone-100">
                  <p className="font-bold text-stone-800">{currentLang === 'te' ? 'పూజకు మంచి సమయం ఎప్పుడు తెలుసుకోవాలి?' : 'When is the best Muhurtham to perform this?'}</p>
                  <p>{currentLang === 'te' ? 'పైన పేర్కొన్న ఉత్తమ ముహూర్తం వివరాలు చూడండి లేదా దిన పంచాంగం పేజీలో శుభ తిథులను పరిశీలించండి.' : 'Check the Best Auspicious Time block in the summary or view our detailed Panchangam page to identify auspicious timings.'}</p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
