// src/app/page.tsx
import { FeaturesSection } from '@/components/FeaturesSection';
import { Footer } from '@/components/Footer';
import { HeroSection } from '@/components/HeroSection';
import { Navbar } from '@/components/Navbar';
import { StatsSection } from '@/components/StatsSection';
import React from 'react';

export default function Home() {
  return (
    <main className="flex flex-col bg-white dark:bg-[#111827] text-gray-800 dark:text-gray-200 font-sans">
      <Navbar />
      <div className="pt-16">
        <HeroSection />
        <FeaturesSection />
        <StatsSection />
        <Footer />
      </div>
    </main>
  );
}
