import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigation } from '@/hooks/use-navigation';
import Link from 'next/link';

export function HeroSection() {
  const nav = useNavigation();
  return (
    <section className="pt-16 bg-white dark:bg-[#111827]">
      <div className="min-h-[calc(100vh-4rem)] max-w-screen-xl mx-auto flex flex-col md:flex-row justify-center items-center px-4 text-center">
        <div className="flex-1 flex flex-col justify-center items-center md:items-start text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-gray-200 mb-4">
            Intelligent ERP System for Modern Business
          </h1>
          <p className="text-base md:text-lg text-gray-500 dark:text-gray-400 mb-6">
            Streamline your operations with AI-powered insights and automation at Lachs Golden & Co Holdings Inc.
          </p>
          <div className="flex space-x-4">
            <Button onClick={() => nav('/signup')} className="bg-[#A17E25] hover:bg-[#8C6A1A] text-white rounded-lg px-6 py-3 shadow transition">
              Request Demo
            </Button>
            <Link href="#features">
              <Button className="border border-[#A17E25] text-[#A17E25] hover:bg-[#FEF3C7] rounded-lg px-6 py-3">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
        <div className="flex-1 hidden md:flex justify-center items-center">
          <img
            src="/images/dashboard-hero.png"
            alt="Dashboard Preview"
            className="rounded-lg shadow-lg w-full max-w-md"
          />
        </div>
      </div>
    </section>
  );
}