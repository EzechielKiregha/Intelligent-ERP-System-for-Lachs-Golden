'use client';

import React from 'react';
import { CheckCircle } from 'lucide-react';

export function LeftAuthPanel({ bullets }: { bullets?: string[] }) {
  const defaultBullets = [
    'AI-Powered Analytics & Insights',
    'Streamlined Financial Management',
    'Integrated Resource Planning',
  ];
  const items = bullets || defaultBullets;

  return (
    <div className="hidden md:flex flex-col justify-between h-full w-1/2 bg-gradient-to-b from-[#A17E25] to-[#8C6A1A] dark:bg-[#1F1F1F] text-white p-6">
      <div>
        <h2 className="text-[24px] font-bold">Lachs Golden ERP</h2>
        <p className="mt-2 text-[16px]">Enterprise Resource Planning Solution</p>
      </div>
      <ul className="space-y-2">
        {items.map((text, idx) => (
          <li key={idx} className="flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-white" />
            <span className="text-[14px]">{text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
