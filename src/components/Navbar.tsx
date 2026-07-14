'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, Flame, Search, Compass, Calendar, User, Home, BookOpen } from 'lucide-react';
import { useLanguage } from '@/components/LanguageProvider';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import gsap from 'gsap';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isHomeUnlocked, setIsHomeUnlocked] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    const checkUnlockState = (e: Event) => {
      const customEvent = e as CustomEvent;
      setIsHomeUnlocked(customEvent.detail.unlocked);
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('pageUnlockStateChange', checkUnlockState);
    
    // Check if admin is logged in (jwt token present)
    const token = localStorage.getItem('adminToken');
    if (token) {
      setIsAdmin(true);
    }

    // Custom event listener for auth changes
    const checkAuth = () => {
      const updatedToken = localStorage.getItem('adminToken');
      setIsAdmin(!!updatedToken);
    };

    window.addEventListener('authChange', checkAuth);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('pageUnlockStateChange', checkUnlockState);
      window.removeEventListener('authChange', checkAuth);
    };
  }, [pathname]);

  // Play entrance transition on page content (main wrapper) when route changes
  useEffect(() => {
    const mainEl = document.querySelector('main');
    if (mainEl) {
      gsap.fromTo(mainEl, {
        opacity: 0,
        y: 20
      }, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
        clearProps: 'all'
      });
    }
  }, [pathname]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (pathname === href) {
      setIsOpen(false);
      return;
    }

    e.preventDefault();
    setIsOpen(false);
    router.push(href);
  };

  const navLinks = [
    { name: t('navHome'), href: '/' },
    { name: t('navPujas'), href: '/pujas' },
    { name: t('navPanchangam'), href: '/panchangam' },
    { name: t('navPujaris'), href: '/pujaris' },
  ];

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    window.dispatchEvent(new Event('authChange'));
    router.push('/admin/login');
  };

  const isHomePage = pathname === '/';

  return (
    <>
      <header
        className={`z-50 transition-all duration-505 ${
          isHomePage
            ? 'opacity-0 pointer-events-none -translate-y-full absolute top-0 left-0 w-full bg-transparent text-amber-50 py-5 shadow-none'
            : scrolled
            ? 'sticky top-0 bg-gradient-to-r from-amber-800/95 to-amber-950/95 backdrop-blur-md shadow-md text-amber-50 py-3'
            : 'sticky top-0 bg-gradient-to-r from-amber-800 to-amber-950 text-amber-50 py-4 shadow-lg'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo Section */}
            <Link href="/" onClick={(e) => handleNavClick(e, '/')} className="flex items-center space-x-2 group">
              <div className="bg-amber-500 text-stone-900 p-2 rounded-full glow-saffron transition-transform group-hover:rotate-12 duration-300">
                <Flame className="h-6 w-6 text-stone-950 fill-amber-950 animate-pulse" />
              </div>
              <div className="flex flex-col">
                <span className="font-cinzel text-xl sm:text-2xl font-black tracking-widest text-amber-400 group-hover:text-amber-300 transition-colors">
                  {t('brandName')}
                </span>
                <span className="text-[10px] tracking-[0.25em] uppercase font-outfit text-amber-200">
                  Sakalakaryalu
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8 items-center">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    className={`font-outfit font-medium text-sm tracking-wide transition-colors relative py-1 hover:text-amber-300 ${
                      isActive ? 'text-amber-400 font-semibold' : 'text-amber-100'
                    }`}
                  >
                    {link.name}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 w-full h-[2px] bg-amber-400 rounded-full animate-pulse" />
                    )}
                  </Link>
                );
              })}

               {/* Admin Link */}
              {isAdmin ? (
                <div className="flex items-center space-x-4">
                  <Link
                    href="/admin/dashboard"
                    onClick={(e) => handleNavClick(e, '/admin/dashboard')}
                    className="bg-amber-600 hover:bg-amber-500 text-stone-950 font-outfit font-bold text-xs tracking-wider px-4 py-2 rounded-full transition-all hover:scale-105 border border-amber-400"
                  >
                    ADMIN DASHBOARD
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-stone-300 hover:text-red-400 text-xs tracking-wider font-semibold font-outfit"
                  >
                    LOGOUT
                  </button>
                </div>
              ) : (
                <Link
                  href="/admin/login"
                  onClick={(e) => handleNavClick(e, '/admin/login')}
                  className="border border-amber-500/40 hover:border-amber-400 hover:bg-amber-500/10 text-amber-300 px-4 py-1.5 rounded-full text-xs font-outfit font-semibold transition-all"
                >
                  {t('navAdmin')}
                </Link>
              )}

              {/* Language Selector */}
              <LanguageSwitcher />
            </nav>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-3">
              <LanguageSwitcher />
              <button
                onClick={toggleMenu}
                className="text-amber-100 hover:text-amber-400 p-2 focus:outline-none transition-colors"
                aria-label="Toggle menu"
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <div
          className={`fixed inset-0 top-[68px] z-40 bg-stone-950/95 backdrop-blur-md transform transition-transform duration-300 md:hidden ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="px-4 pt-6 pb-6 space-y-3">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`block px-4 py-3 rounded-xl font-outfit text-base font-medium tracking-wide transition-all ${
                    isActive
                      ? 'bg-amber-600/20 text-amber-400 border-l-4 border-amber-500'
                      : 'text-stone-300 hover:bg-stone-900 hover:text-amber-300'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}

             {isAdmin ? (
              <div className="pt-4 border-t border-stone-800 space-y-2 px-4">
                <Link
                  href="/admin/dashboard"
                  onClick={(e) => handleNavClick(e, '/admin/dashboard')}
                  className="block text-center bg-amber-600 text-stone-950 font-outfit font-bold py-3 rounded-full tracking-wider hover:bg-amber-500 transition-colors"
                >
                  ADMIN DASHBOARD
                </Link>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-center text-stone-400 hover:text-red-400 font-semibold py-2 transition-colors text-sm"
                >
                  LOGOUT
                </button>
              </div>
            ) : (
              <div className="pt-4 border-t border-stone-800 px-4">
                <Link
                  href="/admin/login"
                  onClick={(e) => handleNavClick(e, '/admin/login')}
                  className="block text-center border border-amber-500/50 text-amber-400 font-outfit font-semibold py-3 rounded-full tracking-wider hover:bg-amber-500/10 transition-all"
                >
                  {t('navAdmin')}
                </Link>
              </div>
            )}

            {/* Mobile language options tray */}
            <div className="pt-4 border-t border-stone-850 px-4 flex items-center justify-between">
              <span className="text-[10px] font-bold text-stone-400 tracking-widest uppercase">Quick Switch</span>
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </header>

       {/* Floating Bottom Navigation for Mobile (Divine Hotkeys) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-stone-950 border-t border-amber-900/30 text-amber-100 flex justify-around py-2 shadow-2xl backdrop-blur-md bg-opacity-95">
        <Link
          href="/"
          onClick={(e) => handleNavClick(e, '/')}
          className={`flex flex-col items-center justify-center space-y-0.5 text-[10px] font-medium tracking-wide ${
            pathname === '/' ? 'text-amber-400 font-semibold' : 'text-stone-400'
          }`}
        >
          <Home className="h-5 w-5" />
          <span>Home</span>
        </Link>
        <Link
          href="/pujas"
          onClick={(e) => handleNavClick(e, '/pujas')}
          className={`flex flex-col items-center justify-center space-y-0.5 text-[10px] font-medium tracking-wide ${
            pathname.startsWith('/pujas') ? 'text-amber-400 font-semibold' : 'text-stone-400'
          }`}
        >
          <BookOpen className="h-5 w-5" />
          <span>Pujas</span>
        </Link>
        <Link
          href="/pujaris"
          onClick={(e) => handleNavClick(e, '/pujaris')}
          className={`flex flex-col items-center justify-center space-y-0.5 text-[10px] font-medium tracking-wide ${
            pathname.startsWith('/pujaris') ? 'text-amber-400 font-semibold' : 'text-stone-400'
          }`}
        >
          <Compass className="h-5 w-5" />
          <span>Pujaris</span>
        </Link>
        <Link
          href="/panchangam"
          onClick={(e) => handleNavClick(e, '/panchangam')}
          className={`flex flex-col items-center justify-center space-y-0.5 text-[10px] font-medium tracking-wide ${
            pathname.startsWith('/panchangam') ? 'text-amber-400 font-semibold' : 'text-stone-400'
          }`}
        >
          <Calendar className="h-5 w-5" />
          <span>Panchangam</span>
        </Link>
      </nav>
      {/* Spacer to prevent bottom nav overlay */}
      <div className="h-14 md:hidden no-print" />
    </>
  );
}
