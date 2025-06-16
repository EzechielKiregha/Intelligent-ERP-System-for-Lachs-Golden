// src/app/page.tsx
import { FeaturesSection } from '@/components/FeaturesSection';
import { Footer } from '@/components/Footer';
import { HeroSection } from '@/components/HeroSection';
import { Navbar } from '@/components/Navbar';
import { StatsSection } from '@/components/StatsSection';
import React from 'react';

export default function Home() {
  return (
    <main className="flex flex-col bg-[#FFF8E1] text-[#333333] font-sans">
      {/* Navbar is fixed; to avoid content hiding behind it, add top padding equal to navbar height */}
      <Navbar />
      <div className="pt-16"> {/* if Navbar height is 4rem (h-16), adjust accordingly */}
        <HeroSection />
        <FeaturesSection />
        <StatsSection />
        <Footer />
      </div>
    </main>
  );
}
