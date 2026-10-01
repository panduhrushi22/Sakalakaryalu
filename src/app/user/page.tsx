'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, LogOut, Compass, Calendar, BookOpen, Heart } from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
}

export default function UserDashboard() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          router.push('/login');
          return;
        }
        const data = await res.json();
        if (data.success) {
          setProfile(data.user);
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      // Dispatch auth event to trigger navbar updates
      window.dispatchEvent(new Event('authChange'));
      router.push('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <svg className="animate-spin h-8 w-8 text-amber-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="font-outfit text-sm text-stone-500">Loading your profile...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      
      {/* Header Panel */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 md:p-8 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-amber-50 text-amber-800 rounded-full border border-amber-200">
            <User className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h1 className="font-cinzel text-xl sm:text-2xl font-black text-stone-850">
              Welcome, {profile?.name}!
            </h1>
            <p className="font-lora text-xs sm:text-sm text-stone-500">
              Manage your bookings, pooja configurations, and spiritual schedule.
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center justify-center bg-stone-900 hover:bg-red-600 text-white font-outfit font-bold text-xs tracking-wider px-5 py-3 rounded-2xl transition-all shadow-md gap-2 uppercase active:scale-95 flex-shrink-0"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>

      {/* Grid: Profile detail left, Navigation tiles right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Profile Card */}
        <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm space-y-6 lg:col-span-1">
          <h3 className="font-cinzel text-sm font-black text-stone-800 border-b border-stone-100 pb-3 uppercase tracking-wider">
            Your Profile Info
          </h3>
          <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-stone-400 uppercase font-outfit block">Name</span>
              <span className="text-sm font-semibold text-stone-800 block">{profile?.name}</span>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-stone-400 uppercase font-outfit block">Email / Username</span>
              <span className="text-sm font-semibold text-stone-800 block">{profile?.email}</span>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-stone-400 uppercase font-outfit block">System Role</span>
              <span className="inline-block bg-amber-150 border border-amber-250 text-amber-900 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                {profile?.role}
              </span>
            </div>
          </div>
        </div>

        {/* Dashboard Actions / Services */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="font-cinzel text-sm font-black text-stone-800 border-b border-stone-100 pb-3 uppercase tracking-wider">
            Quick Services Dashboard
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Quick Link: Find Pujari */}
            <a
              href="/pujaris"
              className="bg-white border border-stone-200 rounded-2xl p-5 hover:shadow-lg transition-all flex items-start gap-4 hover:border-amber-400 group"
            >
              <div className="p-3 bg-amber-50 text-amber-800 rounded-xl group-hover:bg-amber-100 transition-colors">
                <Compass className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-cinzel text-sm font-bold text-stone-855 group-hover:text-amber-800 transition-colors">
                  Find Local Pujaris
                </h4>
                <p className="font-lora text-[11px] text-stone-500 leading-normal">
                  Find and book nearby verified priests based on proximity and GPS locations.
                </p>
              </div>
            </a>

            {/* Quick Link: Pujas */}
            <a
              href="/pujas"
              className="bg-white border border-stone-200 rounded-2xl p-5 hover:shadow-lg transition-all flex items-start gap-4 hover:border-amber-400 group"
            >
              <div className="p-3 bg-amber-50 text-amber-800 rounded-xl group-hover:bg-amber-100 transition-colors">
                <BookOpen className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-cinzel text-sm font-bold text-stone-855 group-hover:text-amber-800 transition-colors">
                  Explore Puja Services
                </h4>
                <p className="font-lora text-[11px] text-stone-500 leading-normal">
                  Browse a curated catalogue of traditional Pujas, rituals, and ceremonies.
                </p>
              </div>
            </a>

            {/* Quick Link: Panchangam */}
            <a
              href="/panchangam"
              className="bg-white border border-stone-200 rounded-2xl p-5 hover:shadow-lg transition-all flex items-start gap-4 hover:border-amber-400 group"
            >
              <div className="p-3 bg-amber-50 text-amber-800 rounded-xl group-hover:bg-amber-100 transition-colors">
                <Calendar className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-cinzel text-sm font-bold text-stone-855 group-hover:text-amber-800 transition-colors">
                  Daily Panchangam
                </h4>
                <p className="font-lora text-[11px] text-stone-500 leading-normal">
                  Check Tithi, Nakshatram, and auspicious Muhurthams for your location.
                </p>
              </div>
            </a>

            {/* Quick Link: Blogs */}
            <a
              href="/blogs"
              className="bg-white border border-stone-200 rounded-2xl p-5 hover:shadow-lg transition-all flex items-start gap-4 hover:border-amber-400 group"
            >
              <div className="p-3 bg-amber-50 text-amber-800 rounded-xl group-hover:bg-amber-100 transition-colors">
                <Heart className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-cinzel text-sm font-bold text-stone-855 group-hover:text-amber-800 transition-colors">
                  Spiritual Insights & Blogs
                </h4>
                <p className="font-lora text-[11px] text-stone-500 leading-normal">
                  Read spiritual guides, stories, and educational content on Hindu traditions.
                </p>
              </div>
            </a>

          </div>
        </div>

      </div>

    </div>
  );
}
