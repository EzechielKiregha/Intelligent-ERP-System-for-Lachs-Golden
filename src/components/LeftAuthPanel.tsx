// src/components/LeftAuthPanel.tsx
'use client';

import React from 'react';
import { CheckCircle } from 'lucide-react';

interface LeftAuthPanelProps {
  /** 
   * Optionally customize title/subtitle or bullet items,
   * but by default we show branding “Lachs Golden”, subtitle,
   * and bullet points like in Signup:
   * - AI-Powered Analytics & Insights
   * - Streamlined Financial Management
   * - Integrated Resource Planning
   */
  bullets?: string[];
  darkModeBg?: string; // optional override for dark mode background
}

export function LeftAuthPanel({
  bullets = [
    'AI-Powered Analytics & Insights',
    'Streamlined Financial Management',
    'Integrated Resource Planning',
  ],
  darkModeBg,
}: LeftAuthPanelProps) {
  // Light mode: gradient gold; Dark mode: use provided darkModeBg or fallback
  return (
    <div
      className={`hidden md:flex flex-col justify-center items-start flex-1 p-8 
        bg-gradient-to-b from-[#D4AF37] to-[#FFD700] 
        dark:${darkModeBg ?? 'bg-[#121212]'} 
        text-white rounded-lg shadow-md`}
    >
      <h2 className="text-[24px] font-bold mb-2">Lachs Golden</h2>
      <p className="text-[16px] mb-6">Enterprise Resource Planning Solution</p>
      <h3 className="text-[20px] font-semibold mb-4">Transform Your Business Operations</h3>
      <ul className="space-y-2">
        {bullets.map((text, idx) => (
          <li key={idx} className="flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-white" />
            <span className="text-[14px]">{text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
