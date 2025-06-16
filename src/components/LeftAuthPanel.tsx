'use client';

import React from 'react';
import { CheckCircle, Crown } from 'lucide-react';
import Link from 'next/link';

export function LeftAuthPanel({ bullets }: { bullets?: string[] }) {
  const defaultBullets = [
    'AI-Powered Analytics & Insights',
    'Streamlined Financial Management',
    'Integrated Resource Planning',
  ];
  const items = bullets || defaultBullets;

  return (
    <div className="hidden md:flex flex-col justify-between h-full w-1/2 bg-gradient-to-l from-[#80410e] to-[#c56a03] dark:bg-[#1F1F1F] text-white p-6">
      <div>
        <Link href="/" className="flex flex-row text-[24px] font-bold text-[#eee7d4] dark:text-[#fffaec] ">
          <Crown className='w-10 h-10' /> Lachs Golden
        </Link>
        <p className="mt-2 text-[16px] text-[#ebb70f] ">Enterprise Resource Planning Solution</p>
      </div>
      <div className="">
        <h2 className="text-[24px] font-semibold mb-4">Transform You Business Operations</h2>
        <ul className="space-y-2">
          {items.map((text, idx) => (
            <li key={idx} className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-[#ffcc23] " />
              <span className="text-[14px]">{text}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
