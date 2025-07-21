'use client'

import React from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from 'contents/authContext';
import { useRouter } from 'next/navigation';
import { ArrowUpRight } from 'lucide-react';

export function HeroSection() {

  const user = useAuth().user

  const router = useRouter();
  return (
    <section className="pt-16 bg-transparent">
      <div className="min-h-[calc(100vh-4rem)] max-w-screen-xl mx-auto flex flex-col md:flex-row justify-center items-center px-4 gap-4 text-center">
        <div className="flex-1 flex flex-col justify-center items-center md:items-start text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-gray-200 mb-4">
            Intelligent ERP - Lachs Golden
          </h1>
          <p className="text-base md:text-lg text-gray-500 dark:text-gray-400 mb-12">
            A centralized enterprise resource planning (ERP) solution designed to streamline business operations at Lachs Golden & Co Holdings Inc.
          </p>
          <div className="flex space-x-4">
            <Button onClick={() => {
              if (!user) { router.push('/signup') }
              else { router.push('/dashboard') }

            }} className="border-sidebar-border text-sidebar-accent-foreground bg-sidebar-accent hover:bg-sidebar-primary rounded-lg px-6 py-3 shadow transition cursor-pointer">
              {user ? 'Go to Dashboard' : 'Welcome to Lachs Golden ERP'}
            </Button>
            <Link

              target="_blank"
              rel="noopener noreferrer"
              href="https://lachsgolden.com/services"
            >
              <Button className="border border-sidebar-border text-[#A17E25] bg-[#FEF3C7] rounded-lg px-6 py-3">
                Explore Our Industries <ArrowUpRight />
              </Button>
            </Link>
          </div>
        </div>
        <div className="flex-1 hidden justify-center items-center md:flex shadow-2xl rounded-2xl">
          <Image
            src="/images/hero-image.PNG"
            alt="Dashboard Preview"
            width={1300}
            height={700}
            className="rounded-lg shadow-lg w-full"
          />
        </div>
      </div>
    </section>
  );
}