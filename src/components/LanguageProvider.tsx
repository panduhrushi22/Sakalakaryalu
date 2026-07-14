'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { LanguageCode, i18nDictionary } from '../lib/i18n';

interface LanguageContextProps {
  language: LanguageCode;
  changeLanguage: (code: LanguageCode) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<LanguageCode>('en');

  // Initialize from cookies / localStorage on mount
  useEffect(() => {
    // 1. Check Cookie first (for server sync consistency)
    const match = document.cookie.match(new RegExp('(^| )sakalakaryalu_lang=([^;]+)'));
    let initialLang: LanguageCode = 'en';

    if (match && match[2]) {
      initialLang = match[2] as LanguageCode;
    } else {
      // 2. Check localStorage
      const saved = localStorage.getItem('sakalakaryalu_lang');
      if (saved) {
        initialLang = saved as LanguageCode;
      } else {
        // 3. Fallback to Browser language if matching
        const browserLang = navigator.language.split('-')[0];
        const supported: LanguageCode[] = ['en', 'te', 'hi', 'ta', 'kn', 'ml', 'mr'];
        if (supported.includes(browserLang as LanguageCode)) {
          initialLang = browserLang as LanguageCode;
        }
      }
    }

    setLanguage(initialLang);
    syncCookieAndStorage(initialLang);
  }, []);

  const syncCookieAndStorage = (code: LanguageCode) => {
    localStorage.setItem('sakalakaryalu_lang', code);
    // Write cookie valid for 1 year
    document.cookie = `sakalakaryalu_lang=${code}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
  };

  const changeLanguage = (code: LanguageCode) => {
    setLanguage(code);
    syncCookieAndStorage(code);

    // Dynamic URL subpath redirection for SEO separate URLs:
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      const locales = ['te', 'hi', 'ta', 'kn', 'ml', 'mr'];
      
      // Extract clean path by removing active locale prefixes
      let cleanPath = currentPath;
      for (const loc of locales) {
        if (currentPath.startsWith(`/${loc}/`)) {
          cleanPath = currentPath.substring(loc.length + 1);
          break;
        } else if (currentPath === `/${loc}`) {
          cleanPath = '/';
          break;
        }
      }

      // Redirect properly
      if (code === 'en') {
        window.location.href = cleanPath;
      } else {
        window.location.href = `/${code}${cleanPath}`;
      }
    }
  };

  const t = (key: string): string => {
    const activeDict = i18nDictionary[language] || i18nDictionary['en'];
    return activeDict[key] || i18nDictionary['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
