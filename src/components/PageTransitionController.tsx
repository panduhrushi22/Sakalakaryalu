'use client';

import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useRouter } from 'next/navigation';

interface PageTransitionControllerProps {
  hero: React.ReactNode;
  secondContent: React.ReactNode;
}

export default function PageTransitionController({ hero, secondContent }: PageTransitionControllerProps) {
  const router = useRouter();
  const [currentScreen, setCurrentScreen] = useState<1 | 2>(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const secondRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);

  // Set initial GSAP positions on mount
  useEffect(() => {
    gsap.set(heroRef.current, { yPercent: 0 });
    gsap.set(secondRef.current, { yPercent: 100, opacity: 1, scale: 1 });
  }, []);

  // Permanently lock scrolling on the homepage and prevent scroll restoration glitches
  useEffect(() => {
    // Reset scroll position to top
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

  // Event handlers for transition triggers
  useEffect(() => {
    if (isTransitioning) return;

    const transitionDown = () => {
      if (currentScreen === 2) return;
      setIsTransitioning(true);

      const tl = gsap.timeline({
        onComplete: () => {
          setCurrentScreen(2);
          setIsTransitioning(false);
        }
      });

      tl.to(heroRef.current, {
        yPercent: -100,
        duration: 1.0,
        ease: 'power3.inOut'
      }, 0);

      tl.to(secondRef.current, {
        yPercent: 0,
        duration: 1.0,
        ease: 'power3.inOut'
      }, 0);
    };

    const transitionUp = () => {
      if (currentScreen === 1) return;
      setIsTransitioning(true);

      const tl = gsap.timeline({
        onComplete: () => {
          setCurrentScreen(1);
          setIsTransitioning(false);
        }
      });

      tl.to(heroRef.current, {
        yPercent: 0,
        duration: 1.0,
        ease: 'power3.inOut'
      }, 0);

      tl.to(secondRef.current, {
        yPercent: 100,
        duration: 1.0,
        ease: 'power3.inOut'
      }, 0);
    };

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY > 15) {
        transitionDown();
      } else if (e.deltaY < -15) {
        transitionUp();
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const diffY = touchStartY.current - e.touches[0].clientY;
      if (diffY > 40) {
        transitionDown();
      } else if (diffY < -40) {
        transitionUp();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.code === 'Space') {
        e.preventDefault();
        transitionDown();
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        transitionUp();
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentScreen, isTransitioning]);

  // Page transitions are handled immediately via standard Next.js routing,
  // avoiding black screen flashes during route changes.

  return (
    <div className="relative w-full h-screen overflow-hidden bg-stone-950">
      {/* 1. Hero / Locked Intro Screen Wrapper */}
      <div 
        ref={heroRef}
        className="fixed top-0 left-0 w-full h-screen z-40 bg-stone-950 overflow-hidden"
      >
        {hero}
      </div>

      {/* 2. Content Section - Sync slide translation */}
      <div 
        ref={secondRef}
        className="fixed top-0 left-0 w-full h-screen z-30 bg-stone-950 overflow-hidden"
      >
        <div className="h-full w-full overflow-y-auto">
          {secondContent}
        </div>
      </div>
    </div>
  );
}
