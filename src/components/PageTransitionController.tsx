'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface PageTransitionControllerProps {
  hero: React.ReactNode;
  secondContent: React.ReactNode;
  thirdContent?: React.ReactNode;
}

export default function PageTransitionController({
  hero,
  secondContent,
  thirdContent,
}: PageTransitionControllerProps) {
  const [currentScreen, setCurrentScreen] = useState<1 | 2 | 3>(1);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const heroRef = useRef<HTMLDivElement>(null);
  const secondRef = useRef<HTMLDivElement>(null);
  const thirdRef = useRef<HTMLDivElement>(null);

  // Synchronous refs to prevent race conditions and ignore momentum events
  const currentScreenRef = useRef<1 | 2 | 3>(1);
  const isTransitioningRef = useRef<boolean>(false);
  const lastTransitionEndRef = useRef<number>(0);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const wheelAccumulatorRef = useRef<number>(0);
  const wheelResetTimerRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartYRef = useRef<number>(0);

  const maxScreens = thirdContent ? 3 : 2;

  // Set initial GSAP positions on mount
  useEffect(() => {
    gsap.set(heroRef.current, { yPercent: 0 });
    gsap.set(secondRef.current, { yPercent: 100, opacity: 1, scale: 1 });
    if (thirdRef.current) {
      gsap.set(thirdRef.current, { yPercent: 100, opacity: 1, scale: 1 });
    }
  }, [thirdContent]);

  // Lock body scrolling on the homepage
  useEffect(() => {
    window.scrollTo(0, 0);

    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    document.body.style.overflow = 'hidden';
    document.body.style.height = '100vh';

    return () => {
      if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'auto';
      }
      document.body.style.overflow = '';
      document.body.style.height = '';
    };
  }, []);

  // Main transition function
  const transitionTo = useCallback(
    (targetScreen: 1 | 2 | 3) => {
      // Synchronous checks
      if (isTransitioningRef.current) return;
      if (targetScreen === currentScreenRef.current) return;
      if (targetScreen < 1 || targetScreen > maxScreens) return;

      const now = Date.now();
      // Cooldown buffer: Ignore any lingering inertia/momentum within 700ms of last transition finish
      if (now - lastTransitionEndRef.current < 700) return;

      // Lock synchronously
      isTransitioningRef.current = true;
      setIsTransitioning(true);
      wheelAccumulatorRef.current = 0;

      // Kill any previous animations to prevent competing tweens
      if (timelineRef.current) {
        timelineRef.current.kill();
      }

      // Transition duration: 1.5 seconds for a smooth, natural slide
      const duration = 1.5;
      const ease = 'power2.inOut';

      // Target positions based on targetScreen:
      // Screen 1: hero at 0, second at 100, third at 100
      // Screen 2: hero at -100, second at 0, third at 100
      // Screen 3: hero at -100, second at -100, third at 0
      const targetHeroY = targetScreen === 1 ? 0 : -100;
      const targetSecondY = targetScreen === 1 ? 100 : targetScreen === 2 ? 0 : -100;
      const targetThirdY = targetScreen === 3 ? 0 : 100;

      const tl = gsap.timeline({
        onComplete: () => {
          currentScreenRef.current = targetScreen;
          setCurrentScreen(targetScreen);
          isTransitioningRef.current = false;
          setIsTransitioning(false);
          lastTransitionEndRef.current = Date.now();
          wheelAccumulatorRef.current = 0;
          timelineRef.current = null;
        },
      });

      timelineRef.current = tl;

      tl.to(heroRef.current, { yPercent: targetHeroY, duration, ease }, 0);
      tl.to(secondRef.current, { yPercent: targetSecondY, duration, ease }, 0);
      if (thirdRef.current) {
        tl.to(thirdRef.current, { yPercent: targetThirdY, duration, ease }, 0);
      }
    },
    [maxScreens]
  );

  // Step strictly by 1: 1 -> 2, 2 -> 3 (NEVER skip directly from 1 to 3)
  const transitionDown = useCallback(() => {
    if (isTransitioningRef.current) return;
    const current = currentScreenRef.current;
    if (current < maxScreens) {
      transitionTo((current + 1) as 1 | 2 | 3);
    }
  }, [maxScreens, transitionTo]);

  // Step strictly backwards by 1: 3 -> 2, 2 -> 1
  const transitionUp = useCallback(() => {
    if (isTransitioningRef.current) return;
    const current = currentScreenRef.current;
    if (current > 1) {
      transitionTo((current - 1) as 1 | 2 | 3);
    }
  }, [transitionTo]);

  // Handle wheel and momentum events
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // Discard wheel events while transitioning
      if (isTransitioningRef.current) return;

      const now = Date.now();
      // Discard lingering inertia scroll events within cooldown period
      if (now - lastTransitionEndRef.current < 700) return;

      // Accumulate scroll delta to filter jitter and require intentional swipe
      wheelAccumulatorRef.current += e.deltaY;

      if (wheelResetTimerRef.current) {
        clearTimeout(wheelResetTimerRef.current);
      }
      wheelResetTimerRef.current = setTimeout(() => {
        wheelAccumulatorRef.current = 0;
      }, 250);

      const THRESHOLD = 40;
      if (wheelAccumulatorRef.current > THRESHOLD) {
        wheelAccumulatorRef.current = 0;
        transitionDown();
      } else if (wheelAccumulatorRef.current < -THRESHOLD) {
        wheelAccumulatorRef.current = 0;
        transitionUp();
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartYRef.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isTransitioningRef.current) return;
      const now = Date.now();
      if (now - lastTransitionEndRef.current < 700) return;

      const diffY = touchStartYRef.current - e.touches[0].clientY;
      const TOUCH_THRESHOLD = 50;
      if (diffY > TOUCH_THRESHOLD) {
        touchStartYRef.current = e.touches[0].clientY;
        transitionDown();
      } else if (diffY < -TOUCH_THRESHOLD) {
        touchStartYRef.current = e.touches[0].clientY;
        transitionUp();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isTransitioningRef.current) return;
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.code === 'Space') {
        e.preventDefault();
        transitionDown();
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        transitionUp();
      }
    };

    // Custom event handlers (e.g. from Hero Discover button or bottom arrows)
    const handleCustomNext = () => transitionDown();
    const handleCustomPrev = () => transitionUp();
    const handleCustomGoto = (e: Event) => {
      const customEvent = e as CustomEvent<{ screen: 1 | 2 | 3 }>;
      if (customEvent.detail?.screen) {
        transitionTo(customEvent.detail.screen);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('page-transition-next', handleCustomNext);
    window.addEventListener('page-transition-prev', handleCustomPrev);
    window.addEventListener('page-transition-goto', handleCustomGoto);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('page-transition-next', handleCustomNext);
      window.removeEventListener('page-transition-prev', handleCustomPrev);
      window.removeEventListener('page-transition-goto', handleCustomGoto);
      if (wheelResetTimerRef.current) {
        clearTimeout(wheelResetTimerRef.current);
      }
    };
  }, [transitionDown, transitionUp, transitionTo]);

  const screenLabels = ['Sacred Portal', 'Choose Your World', 'Spiritual Services'];

  return (
    <div className="relative w-full h-screen overflow-hidden bg-stone-950 select-none">
      {/* 1. Screen 1: Hero / Sacred Intro Screen */}
      <div
        ref={heroRef}
        className={`fixed top-0 left-0 w-full h-screen z-40 bg-stone-950 overflow-hidden ${
          currentScreen === 1 && !isTransitioning ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
      >
        {hero}
      </div>

      {/* 2. Screen 2: Choose Your World */}
      <div
        ref={secondRef}
        id="discover-section"
        className={`fixed top-0 left-0 w-full h-screen z-30 bg-stone-950 overflow-hidden ${
          currentScreen === 2 && !isTransitioning ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
      >
        <div className="h-full w-full relative">
          {secondContent}

          {/* Subtle Navigation indicator to go down to Screen 3 */}
          {thirdContent && (
            <button
              onClick={transitionDown}
              disabled={isTransitioning}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center justify-center text-amber-200/80 hover:text-amber-400 font-outfit text-[10px] sm:text-xs tracking-[0.2em] font-semibold uppercase transition-colors group cursor-pointer"
            >
              <span>Explore Services</span>
              <ChevronDown className="h-4 w-4 mt-0.5 animate-bounce-slow text-amber-400 group-hover:scale-125 transition-transform" />
            </button>
          )}
        </div>
      </div>

      {/* 3. Screen 3: Spiritual Services & Quick Access */}
      {thirdContent && (
        <div
          ref={thirdRef}
          className={`fixed top-0 left-0 w-full h-screen z-20 bg-stone-950 overflow-hidden ${
            currentScreen === 3 && !isTransitioning ? 'pointer-events-auto' : 'pointer-events-none'
          }`}
        >
          <div className="h-full w-full relative">
            {thirdContent}

            {/* Subtle Navigation indicator to go back up */}
            <button
              onClick={transitionUp}
              disabled={isTransitioning}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center justify-center text-amber-200/80 hover:text-amber-400 font-outfit text-[10px] sm:text-xs tracking-[0.2em] font-semibold uppercase transition-colors group cursor-pointer"
            >
              <ChevronUp className="h-4 w-4 mb-0.5 animate-bounce-slow text-amber-400 group-hover:scale-125 transition-transform" />
              <span>Back to Selection</span>
            </button>
          </div>
        </div>
      )}

      {/* Elegant Golden Floating Screen Navigation Indicator (Right Edge) */}
      <nav
        aria-label="Screen Navigation"
        className="fixed right-4 sm:right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-3.5 bg-black/45 backdrop-blur-md px-2.5 py-4 rounded-full border border-amber-500/25 shadow-2xl shadow-black/80"
      >
        {([1, 2, 3] as const).map((num) => {
          if (num === 3 && !thirdContent) return null;
          const isActive = currentScreen === num;
          const label = screenLabels[num - 1];

          return (
            <button
              key={num}
              onClick={() => transitionTo(num)}
              disabled={isTransitioning}
              aria-label={`Go to section ${num}: ${label}`}
              className="group relative flex items-center justify-center p-1 cursor-pointer focus:outline-none"
            >
              {/* Tooltip on hover */}
              <span className="absolute right-full mr-3.5 px-2.5 py-1 text-[11px] font-outfit uppercase tracking-widest font-bold text-amber-100 bg-stone-900/95 border border-amber-500/40 rounded-lg shadow-xl opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 pointer-events-none whitespace-nowrap">
                {label}
              </span>
              {/* Dynamic Pill Indicator */}
              <span
                className={`block rounded-full transition-all duration-700 ease-out ${
                  isActive
                    ? 'h-8 w-2 bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 shadow-[0_0_14px_rgba(251,191,36,0.95)]'
                    : 'h-2 w-2 bg-stone-500/50 group-hover:bg-amber-300/80 group-hover:scale-125'
                }`}
              />
            </button>
          );
        })}
      </nav>
    </div>
  );
}
