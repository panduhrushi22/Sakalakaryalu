import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { LanguageProvider } from '@/components/LanguageProvider';

export const metadata: Metadata = {
  title: 'Sakalakaryalu - Complete Hindu Puja, Spiritual Guide & Pujari Finder',
  description: 'Learn step-by-step Hindu pujas, required item checklists, sacred mantras with pronunciation, daily Panchangam, and find neighborhood priests in Hyderabad region.',
  keywords: 'pujas, panchangam, hinduism, pujari finder, telugu mantras, sanskrit stotram, ganesh puja, satyanarayana vratham, housewarming priest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-stone-50 text-stone-800 selection:bg-amber-600 selection:text-white min-h-screen flex flex-col">
        <LanguageProvider>
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
