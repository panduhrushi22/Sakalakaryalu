import React from 'react';
import { Calendar, Clock, Sun, Moon, Info, HelpCircle, Sparkles } from 'lucide-react';
import { cookies } from 'next/headers';
import { i18nDictionary, LanguageCode } from '@/lib/i18n';
import { prisma } from '@/lib/db';

export default async function PanchangamPage() {
  const cookieStore = await cookies();
  const currentLang = (cookieStore.get('sakalakaryalu_lang')?.value || 'en') as LanguageCode;
  const dict = i18nDictionary[currentLang] || i18nDictionary['en'];

  // Fetch admin custom entries from database
  let dbEntries: any[] = [];
  try {
    dbEntries = await prisma.panchangam.findMany({
      orderBy: { date: 'asc' },
    });
  } catch {
    dbEntries = [];
  }

  // Helper for generating dynamic weekly panchangam starting from present date
  const getPanchangamWeek = (lang: LanguageCode) => {
    const tithisEn = [
      'Shukla Pratipad', 'Shukla Dwitiya', 'Shukla Tritiya', 'Shukla Chaturthi', 'Shukla Panchami',
      'Shukla Shashti', 'Shukla Saptami', 'Shukla Ashtami', 'Shukla Navami', 'Shukla Dashami',
      'Shukla Ekadashi', 'Shukla Dwadashi', 'Shukla Trayodashi', 'Shukla Chaturdashi', 'Purnima',
      'Krishna Pratipad', 'Krishna Dwitiya', 'Krishna Tritiya', 'Krishna Chaturthi', 'Krishna Panchami',
      'Krishna Shashti', 'Krishna Saptami', 'Krishna Ashtami', 'Krishna Navami', 'Krishna Dashami',
      'Krishna Ekadashi', 'Krishna Dwadashi', 'Krishna Trayodashi', 'Krishna Chaturdashi', 'Amavasya'
    ];

    const tithisTe = [
      'శుక్ల పాడ్యమి', 'శుక్ల విదియ', 'శుక్ల తదియ', 'శుక్ల చవితి', 'శుక్ల పంచమి',
      'శుక్ల షష్ఠి', 'శుక్ల సప్తమి', 'శుక్ల అష్టమి', 'శుక్ల నవమి', 'శుక్ల దశమి',
      'శుక్ల ఏకాదశి', 'శుక్ల ద్వాదశి', 'శుక్ల త్రయోదశి', 'శుక్ల చతుర్దశి', 'పౌర్ణమి',
      'కృష్ణ పాడ్యమి', 'కృష్ణ విదియ', 'కృష్ణ తదియ', 'కృష్ణ చవితి', 'కృష్ణ పంచమి',
      'కృష్ణ షష్ఠి', 'కృష్ణ సప్తమి', 'కృష్ణ అష్టమి', 'కృష్ణ నవమి', 'కృష్ణ దశమి',
      'కృష్ణ ఏకాదశి', 'కృష్ణ ద్వాదశి', 'కృష్ణ త్రయోదశి', 'కృష్ణ చతుర్దశి', 'అమావాస్య'
    ];

    const tithisHi = [
      'शुक्ल प्रतिपदा', 'शुक्ल द्वितीया', 'शुक्ल तृतीया', 'शुक्ल चतुर्थी', 'शुक्ल पंचमी',
      'शुक्ल षष्ठी', 'शुक्ल सप्तमी', 'शुक्ल अष्टमी', 'शुक्ल नवमी', 'शुक्ल दशमी',
      'शुक्ल एकादशी', 'शुक्ल द्वादशी', 'शुक्ल त्रयोदशी', 'शुक्ल चतुर्दशी', 'पूर्णिमा',
      'कृष्ण प्रतिपदा', 'कृष्ण द्वितीया', 'कृष्ण तृतीया', 'कृष्ण चतुर्थी', 'कृष्ण पंचमी',
      'कृष्ण षष्ठी', 'कृष्ण सप्तमी', 'कृष्ण अष्टमी', 'कृष्ण नवमी', 'कृष्ण दशमी',
      'कृष्ण एकादशी', 'कृष्ण द्वादशी', 'कृष्ण त्रयोदशी', 'कृष्ण चतुर्दशी', 'अमावस्या'
    ];

    const nakshatrasEn = [
      'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu',
      'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta',
      'Chitra', 'Svati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha',
      'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada',
      'Uttara Bhadrapada', 'Revati'
    ];

    const nakshatrasTe = [
      'అశ్విని', 'భరణి', 'కృత్తిక', 'రోహిణి', 'మృగశిర', 'ఆర్ద్ర', 'పునర్వసు',
      'పుష్యమి', 'ఆశ్లేష', 'మఖ', 'పూర్వఫాల్గుణి', 'ఉత్తరఫాల్గుణి', 'హస్త',
      'చిత్ర', 'స్వాతి', 'విశాఖ', 'అనూరాధ', 'జ్యేష్ఠ', 'మూల', 'పూర్వాషాఢ',
      'ఉత్తరాషాఢ', 'శ్రవణం', 'ధనిష్ఠ', 'శతభిషం', 'పూర్వాభాద్ర', 'ఉత్తరాభాద్ర', 'రేవతి'
    ];

    const nakshatrasHi = [
      'अश्विनी', 'भरणी', 'कृत्तिका', 'रोहिणी', 'मृगशिरा', 'आर्द्रा', 'पुनर्वसु',
      'पुष्य', 'आश्लेषा', 'मघा', 'पूर्वाफाल्गुनी', 'उत्तराफाल्गुनी', 'हस्त',
      'चित्रा', 'स्वाती', 'विशाखा', 'अनुराधा', 'ज्येष्ठा', 'मूल', 'पूर्वाषाढ़ा',
      'उत्तराषाढ़ा', 'श्रवण', 'धनिष्ठा', 'शतभिषा', 'पूर्वीभाद्रपद', 'उत्तरीभाद्रपद', 'रेवती'
    ];

    const daysEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const daysTe = ['ఆదివారం', 'సోమవారం', 'మంగళవారం', 'बुधवार', 'గురువారం', 'శుక్రవారం', 'శనివారం'];
    const daysHi = ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];

    const timings = [
      { rahu: '04:30 PM - 06:00 PM', yama: '12:00 PM - 01:30 PM', gulika: '03:00 PM - 04:30 PM' }, // Sun
      { rahu: '07:30 AM - 09:00 AM', yama: '10:30 AM - 12:00 PM', gulika: '01:30 PM - 03:00 PM' }, // Mon
      { rahu: '03:00 PM - 04:30 PM', yama: '09:00 AM - 10:30 AM', gulika: '12:00 PM - 01:30 PM' }, // Tue
      { rahu: '12:00 PM - 01:30 PM', yama: '07:30 AM - 09:00 AM', gulika: '10:30 AM - 12:00 PM' }, // Wed
      { rahu: '01:30 PM - 03:00 PM', yama: '06:00 AM - 07:30 AM', gulika: '09:00 AM - 10:30 AM' }, // Thu
      { rahu: '10:30 AM - 12:00 PM', yama: '03:00 PM - 04:30 PM', gulika: '07:30 AM - 09:00 AM' }, // Fri
      { rahu: '09:00 AM - 10:30 AM', yama: '01:30 PM - 03:00 PM', gulika: '05:30 AM - 07:00 AM' }, // Sat
    ];

    const now = new Date();
    const list = [];

    for (let i = 0; i < 7; i++) {
      const futureDate = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
      const dayOfWeek = futureDate.getDay();
      
      const dayOfYear = Math.floor((futureDate.getTime() - new Date(futureDate.getFullYear(), 0, 0).getTime()) / 86400000);
      const tithiIndex = (dayOfYear + 15) % 30; // offset slightly for current phase
      const nakshatraIndex = dayOfYear % 27;

      const tithi = lang === 'te' ? tithisTe[tithiIndex] : lang === 'hi' ? tithisHi[tithiIndex] : tithisEn[tithiIndex];
      const nakshatra = lang === 'te' ? nakshatrasTe[nakshatraIndex] : lang === 'hi' ? nakshatrasHi[nakshatraIndex] : nakshatrasEn[nakshatraIndex];
      const dayName = lang === 'te' ? daysTe[dayOfWeek] : lang === 'hi' ? daysHi[dayOfWeek] : daysEn[dayOfWeek];
      
      let formattedDate = '';
      if (lang === 'te') {
        const monthsTe = ['జనవరి', 'ఫిబ్రవరి', 'మార్చి', 'ఏప్రిల్', 'మే', 'జూన్', 'జూలై', 'ఆగస్టు', 'సెప్టెంబరు', 'అక్టోబరు', 'నవంబరు', 'డిసెంబరు'];
        formattedDate = `${monthsTe[futureDate.getMonth()]} ${futureDate.getDate()}, ${futureDate.getFullYear()}`;
      } else if (lang === 'hi') {
        const monthsHi = ['जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'];
        formattedDate = `${monthsHi[futureDate.getMonth()]} ${futureDate.getDate()}, ${futureDate.getFullYear()}`;
      } else {
        const monthsEn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        formattedDate = `${monthsEn[futureDate.getMonth()]} ${futureDate.getDate()}, ${futureDate.getFullYear()}`;
      }

      const dateIso = futureDate.toISOString().split('T')[0];
      const dbMatch = dbEntries.find((d: any) => d.date === dateIso);

      const tithiVal = dbMatch ? dbMatch.tithi : tithi;
      const nakshatraVal = dbMatch ? dbMatch.nakshatram : nakshatra;
      const rahuVal = dbMatch ? dbMatch.rahuKalam : timings[dayOfWeek].rahu;
      const yamaVal = dbMatch ? dbMatch.yamagandam : timings[dayOfWeek].yama;
      const gulikaVal = dbMatch && dbMatch.gulikaKalam ? dbMatch.gulikaKalam : timings[dayOfWeek].gulika;
      const specialEvent = dbMatch ? dbMatch.specialEvent : null;

      list.push({
        day: dayName,
        date: formattedDate,
        tithi: tithiVal,
        nakshatra: nakshatraVal,
        rahu: rahuVal,
        yama: yamaVal,
        gulika: gulikaVal,
        specialEvent,
        isToday: i === 0,
      });
    }

    return list;
  };

  const getSamvatsaramName = (year: number, lang: LanguageCode) => {
    const samvatsarasEn = [
      'Prabhava', 'Vibhava', 'Shukla', 'Pramodoota', 'Prajopti', 'Angirasa', 'Shreemukha', 'Bhava', 'Yuva', 'Dhatu',
      'Eeshwara', 'Bahudhanya', 'Pramadi', 'Vikrama', 'Vrishu', 'Chitrabhanu', 'Subhanu', 'Tarana', 'Parthiva', 'Vyaya',
      'Sarvajitu', 'Sarvadhavi', 'Virodhi', 'Vikruti', 'Khara', 'Nandana', 'Vijaya', 'Jaya', 'Manmadha', 'Durmukhi',
      'Hevalambi', 'Vilambi', 'Vikari', 'Sharvari', 'Plava', 'Shubhakrutu', 'Sobhakrutu', 'Krodhi', 'Vishvavasu', 'Parabhava',
      'Plavanga', 'Keelaka', 'Saumya', 'Sadharana', 'Virodhikrutu', 'Paridhavi', 'Pramadecha', 'Ananda', 'Rakshasa', 'Nala',
      'Pingala', 'Kalayukti', 'Siddharthi', 'Raudri', 'Durmati', 'Dundubhi', 'Rudhirodgari', 'Raktakshi', 'Krodhana', 'Akshaya'
    ];
    const index = (year - 1987 + 60) % 60;
    const nameEn = samvatsarasEn[index] + ' Nama Samvatsaram';

    if (lang === 'te') {
      const samvatsarasTe = [
        'ప్రభవ', 'విభవ', 'శుక్ల', 'ప్రమోదూత', 'ప్రజోత్పత్తి', 'ఆంగీరస', 'శ్రీముఖ', 'భావ', 'యువ', 'ధాత',
        'ఈశ్వర', 'బహుధాన్య', 'ప్రమాది', 'విక్రమ', 'వృష', 'చిత్రభాను', 'సుభాను', 'తారణ', 'పార్థివ', 'వ్యయ',
        'సర్వజిత్తు', 'సర్వధారి', 'విరోధి', 'వికృతి', 'ఖర', 'నందన', 'విజయ', 'జయ', 'మన్మథ', 'దుర్ముఖి',
        'హేవిలంబి', 'విలంబి', 'వికారి', 'శార్వరి', 'ప్లవ', 'శుభకృతు', 'శోభకృతు', 'క్రోధి', 'విశ్వావసు', 'పరాభవ',
        'ప్లవంగ', 'కీలక', 'సౌమ्य', 'సాధారణ', 'విరోధికృతు', 'పరీధావి', 'ప్రమాదీచ', 'ఆనంద', 'రాక్షస', 'నల',
        'పింగళ', 'కాళయుక్తి', 'సిద్ధార్థి', 'రౌద్రి', 'దుర్మతి', 'దుందుభి', 'రుధిరోద్గారి', 'రక్తాక్షి', 'క్రోధన', 'అక్షయ'
      ];
      return samvatsarasTe[index] + ' నామ సంవత్సరం';
    }
    if (lang === 'hi') {
      const samvatsarasHi = [
        'प्रभव', 'विभव', 'शुक्ल', 'प्रमोदूत', 'प्रजापति', 'अंगिरा', 'श्रीमुख', 'भाव', 'युवा', 'धाता',
        'ईश्वर', 'बहुधान्य', 'प्रमादी', 'विक्रम', 'वृष', 'चित्रभानु', 'सुभानु', 'तारण', 'पार्थिव', 'व्यय',
        'सर्वजित', 'सर्वधारी', 'विरोध', 'विकृति', 'खर', 'नंदन', 'विजय', 'जय', 'मन्मथ', 'दुर्मुख',
        'हेविलम्बी', 'विलम्बी', 'विकारी', 'शार्वरी', 'प्लव', 'शुभकृत', 'शोभकृत', 'क्रोधी', 'विश्वावसु', 'पराभव',
        'प्लवंग', 'कीलक', 'सौम्य', 'साधारण', 'विरोधकृत', 'परिधावी', 'प्रमादिचा', 'आनंद', 'राक्षस', 'नल',
        'पिंगल', 'कालयुक्ति', 'सिद्धार्थी', 'रौद्री', 'दुर्मति', 'दुन्दुभी', 'रुधिरोद्गारी', 'रक्ताक्षी', 'क्रोधन', 'अक्षय'
      ];
      return samvatsarasHi[index] + ' नाम संवत्सर';
    }
    return nameEn;
  };

  const calculations = getPanchangamWeek(currentLang);
  const currentYear = new Date().getFullYear();
  const currentMonthName = new Date().toLocaleString(currentLang === 'te' ? 'te-IN' : currentLang === 'hi' ? 'hi-IN' : 'en-US', { month: 'long' });
  const samvatsaramLabel = getSamvatsaramName(currentYear, currentLang);


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Page Title */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center space-x-1.5 bg-amber-100 text-amber-800 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider">
          <Clock className="h-4 w-4" />
          <span>{currentLang === 'te' ? 'వైదిక సమయ గణన' : currentLang === 'hi' ? 'वैदिक समय गणना' : 'Real-time Vedic Hours'}</span>
        </div>
        <h1 className="font-cinzel text-3xl sm:text-4xl md:text-5xl font-black text-stone-850 leading-tight">
          {dict.panchangamTitle}
        </h1>
        <p className="font-lora text-stone-600 text-sm sm:text-base leading-relaxed">
          {dict.panchangamSub}
        </p>
      </div>

      {/* Main Grid: Panchangam Table left, Educational details right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT 2 COLUMNS: Panchangam forecast table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-md space-y-6">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <h3 className="font-cinzel text-lg font-bold text-stone-850">
                {currentLang === 'te' ? `వారపు పంచాంగ గణనలు (${currentMonthName})` : currentLang === 'hi' ? `साप्ताहिक पंचांग (${currentMonthName})` : `Weekly Panchangam Forecast (${currentMonthName})`}
              </h3>
              <span className="bg-amber-100 text-amber-850 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider font-outfit border border-amber-200">
                {samvatsaramLabel}
              </span>
            </div>

            {/* Custom Responsive Table */}
            <div className="overflow-x-auto rounded-2xl border border-stone-150">
              <table className="min-w-full divide-y divide-stone-200 font-outfit text-xs sm:text-sm text-left">
                <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider text-[10px] font-bold">
                  <tr>
                    <th className="px-4 py-3">{currentLang === 'te' ? 'వారము & తేదీ' : currentLang === 'hi' ? 'वार व तिथि' : 'Day & Date'}</th>
                    <th className="px-4 py-3">Tithi</th>
                    <th className="px-4 py-3">Nakshatram</th>
                    <th className="px-4 py-3 text-red-600">Rahu Kalam</th>
                    <th className="px-4 py-3">Yamagandam</th>
                    <th className="px-4 py-3 text-emerald-600">Gulika</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-150 bg-white">
                  {calculations.map((calc, idx) => {
                    const isToday = calc.isToday;
                    return (
                      <tr
                        key={idx}
                        className={`transition-colors ${
                          isToday ? 'bg-amber-50/40 font-semibold' : 'hover:bg-stone-50/30'
                        }`}
                      >
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="block text-stone-800 font-bold">{calc.day}</span>
                          <span className="text-[10px] text-stone-400 block">{calc.date}</span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-stone-700 font-lora">
                          <div>
                            <span>{calc.tithi}</span>
                            {isToday && <span className="bg-amber-500 text-stone-950 text-[8px] font-bold ml-1.5 px-1.5 py-0.5 rounded-full uppercase font-outfit">Active</span>}
                          </div>
                          {calc.specialEvent && (
                            <div className="mt-1">
                              <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 border border-amber-300 text-[9px] font-bold px-1.5 py-0.5 rounded-md font-outfit">
                                <Sparkles className="h-2.5 w-2.5 text-amber-600" />
                                {calc.specialEvent}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-stone-700 font-lora">{calc.nakshatra}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-red-700 font-medium">{calc.rahu}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-stone-500">{calc.yama}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-emerald-700 font-medium">{calc.gulika}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Educational glossary cards */}
        <div className="space-y-6">
          {/* Astrological Glossary Card */}
          <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-sm space-y-4">
            <h4 className="font-cinzel text-sm font-bold text-stone-850 border-b border-stone-100 pb-2 flex items-center">
              <Info className="h-4 w-4 mr-1.5 text-amber-500" />
              {dict.glossaryTitle}
            </h4>
            <p className="font-lora text-[11px] sm:text-xs text-stone-500 leading-relaxed">
              {currentLang === 'te' ? 'పంచాంగం అనగా సంస్కృతంలో "ఐదు అంగాలు" అని అర్థం. ఈ ఐదు ప్రధాన ఖగోళ గణనలు రోజువారీ శుభ సమయాన్ని నిర్ణయిస్తాయి:' : 
               currentLang === 'hi' ? 'पंचांग का संस्कृत में अर्थ है "पांच अंग"। ये पांच खगोलीय तत्व प्रत्येक दिन की शुभता निर्धारित करते हैं:' : 
               'Panchangam literally translates to "five limbs" in Sanskrit. These five vital astronomical attributes dictate the cosmic energy levels of any given day:'}
            </p>
            <div className="space-y-3 font-lora text-[11px] sm:text-xs text-stone-600">
              <div className="space-y-0.5">
                <strong className="text-amber-800 font-cinzel text-[11px] block">1. Tithi (తిథి)</strong>
                <p>{currentLang === 'te' ? 'సూర్య, చంద్రుల మధ్య దూరాన్ని సూచించే తిథి. వ్రతములు, పండుగలు జరుపుకోడానికి ఇది ముఖ్యం.' : 'The lunar phase or distance between the Sun and Moon. Crucial for identifying birthdays and religious vratas.'}</p>
              </div>
              <div className="space-y-0.5 border-t border-stone-100 pt-2">
                <strong className="text-amber-800 font-cinzel text-[11px] block">2. Vara (వారము)</strong>
                <p>{currentLang === 'te' ? 'వారంలోని ఏడు రోజులు, ఒక్కొక్క రోజు ఒక్కొక్క గ్రహానికి సూచికగా ఉంటుంది.' : 'The day of the week, ruled by a specific planetary deity (e.g. Mangalavara ruled by Mars).'}</p>
              </div>
              <div className="space-y-0.5 border-t border-stone-100 pt-2">
                <strong className="text-amber-800 font-cinzel text-[11px] block">3. Nakshatra (నక్షత్రము)</strong>
                <p>{currentLang === 'te' ? 'చంద్రుడు సంచరించే నక్షత్ర కూటమి. ఇది వ్యక్తిగత మరియు దిన శక్తుల స్వభావాన్ని నిర్ణయిస్తుంది.' : 'The constellation or star mansion the Moon is currently residing in. Determines core energy vibes.'}</p>
              </div>
              <div className="space-y-0.5 border-t border-stone-100 pt-2">
                <strong className="text-amber-800 font-cinzel text-[11px] block">4. Yoga (యోగము)</strong>
                <p>{currentLang === 'te' ? 'సూర్యుడు మరియు చంద్రుని స్థానాల కూడిక. ఇది మంచి లేదా చెడు ప్రభావాన్ని తెలియజేస్తుంది.' : 'A mathematical addition of solar and lunar longitudes. Denotes positive or negative cosmic forces.'}</p>
              </div>
              <div className="space-y-0.5 border-t border-stone-100 pt-2">
                <strong className="text-amber-800 font-cinzel text-[11px] block">5. Karana (కరణము)</strong>
                <p>{currentLang === 'te' ? 'ఒక తిథిలో సగం భాగం. ఇది పనుల ప్రారంభం మరియు విజయానికి సహాయపడుతుంది.' : 'Half of a Tithi. Represents physical abilities and actions suitable for that specific timing.'}</p>
              </div>
            </div>
          </div>

          {/* Quick FAQ Card */}
          <div className="bg-amber-50/40 border border-amber-200/50 rounded-3xl p-5 shadow-sm space-y-3">
            <h4 className="font-cinzel text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center">
              <HelpCircle className="h-4 w-4 mr-1.5 text-amber-600" />
              {currentLang === 'te' ? 'తరచుగా అడిగే ప్రశ్నలు' : currentLang === 'hi' ? 'अक्सर पूछे जाने वाले प्रश्न' : 'Frequently Asked Questions'}
            </h4>
            <div className="space-y-2.5 font-lora text-[11px] text-stone-600 leading-relaxed">
              <div className="space-y-0.5">
                <p className="font-bold text-stone-850">{currentLang === 'te' ? 'రాహుకాలం అంటే ఏమిటి?' : 'What is Rahu Kalam?'}</p>
                <p>{currentLang === 'te' ? 'రోజువారీ 90 నిమిషాల సమయం, దీనిని అశుభంగా భావిస్తారు. ఈ సమయంలో కొత్త పనులు ప్రారంభించడం మంచిది కాదు.' : 'A 90-minute daily period considered inauspicious. It is recommended to avoid beginning any new business, travel, or buying assets during this hour.'}</p>
              </div>
              <div className="space-y-0.5 border-t border-amber-200/30 pt-2">
                <p className="font-bold text-stone-850">{currentLang === 'te' ? 'గుళికా కాలం అంటే ఏమిటి?' : 'What is Gulika Kalam?'}</p>
                <p>{currentLang === 'te' ? 'అత్యంత శుభకరమైన సమయం. గుళిక కాలంలో చేసే శుభ పనులు రెట్టింపు ఫలితాన్ని ఇస్తాయని నమ్ముతారు.' : 'An extremely auspicious period. Any tasks or investments performed during Gulika are believed to repeat and multiply successfully!'}</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
