import ContactPage from "@/components/Contact";
import { FeaturesSection } from "@/components/FeaturesSection";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/HeroSection";
import { Navbar } from "@/components/Navbar";
import { StatsSection } from "@/components/StatsSection";
import React from "react";

export default function Home() {
  return (
    <main className="flex flex-col bg-white dark:bg-[#0a0e16] text-gray-800 dark:text-gray-200 font-sans">
      <Navbar />
      <div>
        <div >
          <HeroSection />
        </div>
        <div >
          <FeaturesSection />
        </div>
        <div >
          <StatsSection />
        </div>
        <div >
          <ContactPage />
        </div>
        <div >
          <Footer />
        </div>
      </div>
    </main>
  );
}