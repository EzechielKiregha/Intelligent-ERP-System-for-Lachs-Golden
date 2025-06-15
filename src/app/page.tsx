// src/app/page.tsx
import React from 'react';
import { Navbar, HeroSection, FeaturesSection, StatsSection, Footer } from '@/components/ErpUIComponents';

export default function Home() {
  return (
    <main className="flex flex-col bg-[#FFF8E1] text-[#333333]">
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
