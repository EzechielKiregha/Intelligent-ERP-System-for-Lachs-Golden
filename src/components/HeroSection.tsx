'use client'

import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigation } from '@/hooks/use-navigation';
import Link from 'next/link';
import Image from 'next/image';

export function HeroSection() {
  const nav = useNavigation();
  return (
    <section className="pt-16 bg-white dark:bg-[#0f1522]">
      <div className="min-h-[calc(100vh-4rem)] max-w-screen-xl mx-auto flex flex-col md:flex-row justify-center items-center px-4 text-center">
        <div className="flex-1 flex flex-col justify-center items-center md:items-start text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-gray-200 mb-4">
            Intelligent ERP System for Modern Business
          </h1>
          <p className="text-base md:text-lg text-gray-500 dark:text-gray-400 mb-6">
            Streamline your operations with AI-powered insights and automation at Golden Intelingent ERP.
          </p>
          <div className="flex space-x-4">
            <Button onClick={() => nav('/signup')} className="bg-gradient-to-l from-[#80620e] to-[#c56a03] hover:bg-[#8C6A1A] text-white rounded-lg px-6 py-3 shadow transition">
              Request Demo
            </Button>
            <Link href="#features">
              <Button className="border border-[#A17E25] text-[#A17E25] bg-[#FEF3C7] rounded-lg px-6 py-3">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
        <div className="flex-1 hidden md:flex justify-center items-center rounded-2xl">
          <Image
            src="/images/dashboard-hero.jpg"
            alt="Dashboard Preview"
            width={1000}
            height={600}
            className="rounded-lg shadow-lg w-full max-w-md"
          />
        </div>
      </div>
    </section>
  );
}