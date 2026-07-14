'use client';

import React from 'react';
import Link from 'next/link';
import { Flame, Mail, Phone, MapPin } from 'lucide-react';
import { useLanguage } from './LanguageProvider';

export default function Footer() {
  const { t, language } = useLanguage();

  const quickLinks = [
    { name: language === 'te' ? 'హోమ్ గైడ్' : language === 'hi' ? 'होम गाइड' : 'Home Guide', href: '/' },
    { name: language === 'te' ? 'పూజా విధానాలు' : language === 'hi' ? 'पूजा विधि' : 'Puja Manuals', href: '/pujas' },
    { name: language === 'te' ? 'పంచాంగం' : language === 'hi' ? 'पंचांग' : 'Daily Panchangam', href: '/panchangam' },
    { name: language === 'te' ? 'పురోహితులు' : language === 'hi' ? 'पुजारी खोजें' : 'Nearby Priest Finder', href: '/pujaris' },
  ];

  return (
    <footer className="bg-stone-950 text-stone-200 border-t-4 border-amber-600 no-print">
      {/* Top Blessing Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 py-6 border-b border-amber-800/30 text-center">
        <div className="max-w-7xl mx-auto px-4">
          <p className="font-cinzel text-lg sm:text-xl font-bold tracking-widest text-amber-400">
            {t('blessingTitle')}
          </p>
          <p className="text-xs sm:text-sm font-lora italic text-amber-200 mt-1">
            {t('blessingSub')}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center space-x-2">
              <div className="bg-amber-500 text-stone-900 p-2 rounded-full shadow-[0_0_10px_rgba(217,119,6,0.3)]">
                <Flame className="h-5 w-5 text-stone-950 fill-amber-950" />
              </div>
              <div className="flex flex-col">
                <span className="font-cinzel text-lg font-black tracking-widest text-amber-400">
                  {t('brandName')}
                </span>
                <span className="text-[9px] tracking-widest uppercase font-outfit text-amber-200">
                  Sakalakaryalu
                </span>
              </div>
            </Link>
            <p className="text-xs text-stone-400 font-lora leading-relaxed">
              {language === 'te'
                ? 'సకలకార్యాలు అనేది సంపూర్ణమైన వైదిక పూజలు, ఆధ్యాత్మిక మార్గదర్శక వేదిక. ఇక్కడ మీరు సంప్రదాయ పూజా పద్ధతులు నేర్చుకోవచ్చు, సామాగ్రి లిస్టును డౌన్‌లోడ్ చేసుకోవచ్చు మరియు మీ సమీపంలోని పురోహితులను సంప్రదించవచ్చు.'
                : language === 'hi'
                ? 'सकलकार्यालु एक संपूर्ण वैदिक पूजा और आध्यात्मिक मार्गदर्शन मंच है। यहाँ आप शास्त्रोक्त अनुष्ठान सीख सकते हैं, पूजा सामग्री की सूची डाउनलोड कर सकते हैं और अपने नजदीकी प्रामाणिक पुजारियों को बुक कर सकते हैं।'
                : 'A comprehensive Hindu spiritual and religious guidance ecosystem. Learn ritual procedures, download items checklists, read sacred mantras in multiple scripts, and book dedicated neighborhood pujaris.'}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-amber-400 font-outfit font-bold text-sm tracking-widest uppercase border-b border-amber-900/50 pb-2 mb-4">
              {language === 'te' ? 'అన్వేషించండి' : language === 'hi' ? 'नेविगेट करें' : 'Explore Platform'}
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-xs text-stone-400 hover:text-amber-300 transition-colors font-outfit tracking-wide block"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-amber-400 font-outfit font-bold text-sm tracking-widest uppercase border-b border-amber-900/50 pb-2 mb-4">
              {language === 'te' ? 'సంప్రదించండి' : language === 'hi' ? 'संपर्क करें' : 'Direct Contact'}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2.5 text-xs text-stone-400">
                <Phone className="h-4 w-4 text-amber-500 flex-shrink-0" />
                <span className="font-outfit tracking-wide">+91 40 2345 6789</span>
              </li>
              <li className="flex items-center space-x-2.5 text-xs text-stone-400">
                <Mail className="h-4 w-4 text-amber-500 flex-shrink-0" />
                <span className="font-outfit tracking-wide">help@sakalakaryalu.in</span>
              </li>
              <li className="flex items-center space-x-2.5 text-xs text-stone-400">
                <MapPin className="h-4 w-4 text-amber-500 flex-shrink-0" />
                <span className="font-lora">Jubilee Hills Road No. 36, Hyderabad, TS, India</span>
              </li>
            </ul>
          </div>

          {/* Devotion section */}
          <div>
            <h3 className="text-amber-400 font-outfit font-bold text-sm tracking-widest uppercase border-b border-amber-900/50 pb-2 mb-4">
              {language === 'te' ? 'వైదిక ధర్మం' : language === 'hi' ? 'वैदिक संकल्प' : 'Divine Vow'}
            </h3>
            <p className="text-xs text-stone-400 font-lora leading-relaxed">
              {language === 'te'
                ? 'వైదిక సంస్కృతిని కాపాడుతూ, హిందూ పూజా విధానాలను సులభతరం చేసి ప్రతి ఒక్కరికీ శాస్త్రీయంగా అర్థమయ్యేలా అందించడమే మా సంకల్పం.'
                : language === 'hi'
                ? 'वैदिक धरोहर का संरक्षण करते हुए, हिंदू अनुष्ठानों को सुगम, सरल और वैज्ञानिक रूप से समझने योग्य बनाना ही हमारा संकल्प है।'
                : 'Dedicated to preserving the eternal Vedic heritage and making Hindu rituals accessible, simple, and scientifically understandable for generations to come.'}
            </p>
            <div className="mt-4 bg-amber-950/40 border border-amber-900/40 p-3 rounded-lg text-center">
              <span className="text-[10px] text-amber-300 font-outfit font-semibold tracking-wider block">
                {language === 'te' ? 'నేటి పంచాంగ సమయాలు' : language === 'hi' ? 'दैनिक पंचांग समय' : 'DAILY PANCHANGAM HOURS'}
              </span>
              <span className="text-[11px] text-stone-300 font-outfit mt-0.5 block">
                {language === 'te'
                  ? 'సూర్యోదయం ఆధారంగా ప్రతిరోజూ శుభ సమయాలు (05:46 AM)'
                  : language === 'hi'
                  ? 'सूर्योदय (05:46 AM) पर आधारित दैनिक शुभ काल गणना'
                  : 'Auspicious time calculations daily at Sunrise (05:46 AM)'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Bottom copyright */}
        <div className="mt-12 pt-6 border-t border-stone-850 text-center flex flex-col sm:flex-row items-center justify-between text-[11px] text-stone-500">
          <p className="font-outfit tracking-wider">
            &copy; {new Date().getFullYear()} Sakalakaryalu. All Spiritual Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
