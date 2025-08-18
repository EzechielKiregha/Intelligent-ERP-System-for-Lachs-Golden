'use client';

import React from 'react';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export function LeftAuthPanel({
  bullets,
  name,
  desc,
  backgroundImage,
}: {
  bullets?: string[];
  name?: string;
  desc?: string;
  backgroundImage?: string; // optional background image URL
}) {
  const defaultBullets = [
    'Client-Centric Approach for Lasting Partnerships',
    'Streamlined Financial Management',
    'Integrated Resource Planning',
  ];
  const items = bullets || defaultBullets;

  // sensible default background (you can replace with your own URL)
  const bg = backgroundImage ?? 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=1600&auto=format&fit=crop&ixlib=rb-4.0.3&s=abcdef';

  return (
    <div
      className="hidden md:flex flex-col justify-between h-full w-1/2 relative text-white p-6"
      style={{
        backgroundImage: `url(${bg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
      aria-label="Left promotional panel"
    >
      {/* overlay for readability */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg, rgba(12,7,3,0.72) 0%, rgba(128,65,14,0.62) 40%, rgba(0,0,0,0.45) 100%)',
          backdropFilter: 'saturate(1.1) blur(0.2px)',
        }}
      />

      {/* content sits above overlay */}
      <div className="relative z-10 flex flex-col justify-between h-full">
        <div>
          <Link href="/" className="flex items-center text-[24px] font-bold text-[#eee7d4] dark:text-[#fffaec] ">
            <Image
              width={50}
              height={50}
              src="https://lachsgolden.com/wp-content/uploads/2024/01/LACHS-logo-02-2048x1006-removebg-preview-e1735063006450.png"
              alt={`${name ?? 'Lachs Golden'} logo`}
              sizes="(max-width: 371px) 100vw, 371px"
              className="mr-3 rounded-sm"
            />
            {name ?? 'Lachs Golden - ERP'}
          </Link>

          {desc ? (
            <span className="text-[16px] font-normal text-[#ebb70f] dark:text-[#D4AF37] ml-2 block">
              {desc}
            </span>
          ) : null}

          <p className="mt-2 text-[16px] text-[#ebb70f] max-w-prose">
            we stand at the forefront of financial innovation, providing a comprehensive suite of services tailored to meet the evolving needs of our global clientele.
          </p>
        </div>

        <div>
          <h2 className="text-[24px] font-semibold mb-4">Transform You Business Operations</h2>
          <ul className="space-y-2">
            {items.map((text, idx) => (
              <li key={idx} className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-[#ffcc23]" />
                <span className="text-[14px]">{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
