'use client';

import React from 'react';
import { CheckCircle, Crown } from 'lucide-react';
import Link from 'next/link';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import Image from 'next/image';

export function LeftAuthPanel({ bullets,
  name,
  desc
}: {
  bullets?: string[]
  name?: string,
  desc?: string
}) {
  const defaultBullets = [
    'Client-Centric Approach for Lasting Partnerships',
    'Streamlined Financial Management',
    'Integrated Resource Planning',
  ];
  const items = bullets || defaultBullets;

  return (
    <div className="hidden md:flex flex-col justify-between h-full w-1/2 bg-gradient-to-l from-[#c56a03] to-[#80410e] dark:bg-[#1F1F1F] text-white p-6">
      <div>
        <Link href="/" className="flex flex-row text-[24px] font-bold text-[#eee7d4] dark:text-[#fffaec] ">
          <Image width="50" height="50" src="https://lachsgolden.com/wp-content/uploads/2024/01/LACHS-logo-02-2048x1006-removebg-preview-e1735063006450.png"
            alt="" sizes="(max-width: 371px) 100vw, 371px"
            className='mr-3'
          />
          {name ? name : 'Lachs Golden - ERP'}

        </Link>
        <span className="text-[16px] font-normal text-[#ebb70f] dark:text-[#D4AF37] ml-2">
          {desc ? desc : ''}
        </span>
        <p className="mt-2 text-[16px] text-[#ebb70f] ">we stand at the forefront of financial innovation, providing a comprehensive suite of services tailored to meet the evolving needs of our global clientele.</p>
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
