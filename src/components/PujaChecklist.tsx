'use client';

import React, { useState } from 'react';
import { CheckSquare, Square, Printer, ShoppingBag } from 'lucide-react';
import PujaKitOrderDrawer from './PujaKitOrderDrawer';
import { useLanguage } from './LanguageProvider';

interface PujaItem {
  id: string;
  name: string;
  quantity: string;
  isRequired: boolean;
  price?: number;
}

interface ChecklistProps {
  items: PujaItem[];
  pujaName: string;
  pujaId?: string;
}

export default function PujaChecklist({ items, pujaName, pujaId }: ChecklistProps) {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { t, language } = useLanguage();

  const toggleCheck = (id: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-md space-y-6">
      {/* Header and print action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-100 pb-4 no-print">
        <div className="space-y-1">
          <h3 className="font-cinzel text-lg sm:text-xl font-bold text-stone-800">
            {t('itemsTitle')}
          </h3>
          <p className="font-lora text-xs sm:text-sm text-stone-500">
            {t('itemsSub')}
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="inline-flex items-center bg-amber-500 hover:bg-amber-600 active:scale-95 text-stone-950 font-outfit font-bold text-xs tracking-wider px-5 py-2.5 rounded-xl transition-all shadow-md"
        >
          <Printer className="h-4 w-4 mr-1.5" />
          <span>{language === 'te' ? 'ప్రింట్ చెక్‌లిస్ట్ / PDF' : language === 'hi' ? 'प्रिंट चेकलिस्ट / PDF' : 'Print Checklist / PDF'}</span>
        </button>
      </div>

      {/* Printable Heading (Hidden on Screen, Visible on Print) */}
      <div className="hidden print:block text-center space-y-2 mb-6 border-b-2 border-stone-800 pb-4">
        <h1 className="font-cinzel text-2xl font-black">{pujaName} - Samagri Checklist</h1>
        <p className="font-lora text-xs">Sourced from Sakalakaryalu platform (సకలకార్యాలు)</p>
      </div>

      {/* Checklist Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => {
          const isChecked = !!checkedItems[item.id];
          return (
            <div
              key={item.id}
              onClick={() => toggleCheck(item.id)}
              className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer select-none transition-all ${
                isChecked
                  ? 'bg-amber-50/40 border-amber-400 text-stone-900 shadow-inner'
                  : 'bg-stone-50/50 border-stone-200 text-stone-700 hover:border-amber-300'
              } print:border-stone-400 print:bg-transparent print:p-2`}
            >
              <div className="flex items-center space-x-3">
                {/* Visual Checkbox (Hidden on Print) */}
                <div className="text-amber-600 hover:text-amber-700 flex-shrink-0 no-print">
                  {isChecked ? (
                    <CheckSquare className="h-5 w-5 fill-amber-500 text-stone-950" />
                  ) : (
                    <Square className="h-5 w-5 text-stone-400" />
                  )}
                </div>
                {/* Print Checkbox (Simple Square) */}
                <div className="hidden print:block border border-black w-4 h-4 mr-2" />
                
                <span className={`text-xs sm:text-sm font-medium ${isChecked ? 'line-through text-stone-400 font-normal' : ''}`}>
                  {item.name}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-[11px] sm:text-xs font-bold font-outfit text-stone-600 bg-stone-150 px-2 py-0.5 rounded border border-stone-200/50 print:bg-transparent print:border-none">
                  {item.quantity}
                </span>
                {item.isRequired && (
                  <span className="text-[9px] uppercase font-outfit font-extrabold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded flex-shrink-0 no-print">
                    {language === 'te' ? 'తప్పనిసరి' : language === 'hi' ? 'अनिवार्य' : 'Required'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* DELIVERY CONVENIENCE OPTIONAL FEATURE PROMPT */}
      {pujaId && (
        <div className="bg-amber-50/50 border border-amber-200/60 p-5 rounded-2xl text-center space-y-4 no-print mt-6">
          <div className="space-y-1">
            <h4 className="font-cinzel text-sm sm:text-base font-bold text-amber-900">
              {t('deliveryBannerTitle')}
            </h4>
            <p className="font-lora text-xs text-stone-600 max-w-md mx-auto">
              {t('deliveryBannerSub')}
            </p>
          </div>
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="inline-flex items-center bg-stone-900 hover:bg-amber-600 active:scale-95 text-amber-100 hover:text-stone-950 font-outfit font-bold text-xs tracking-wider px-6 py-3 rounded-xl transition-all shadow-md uppercase"
          >
            <ShoppingBag className="h-4 w-4 mr-1.5" />
            <span>{t('getKitDelivered')}</span>
          </button>
        </div>
      )}

      {/* Checkout cart slider panel */}
      {pujaId && (
        <PujaKitOrderDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          pujaId={pujaId}
          pujaName={pujaName}
          items={items}
        />
      )}
    </div>
  );
}
