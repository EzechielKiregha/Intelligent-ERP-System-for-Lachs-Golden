import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useNavigation } from '@/hooks/use-navigation';
import { ModeToggle } from './toggleTheme';
import { Menu, X } from 'lucide-react';

export function Navbar() {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const nav = useNavigation();
  const navItems = [
    { label: 'Features', href: '/#features' },
    { label: 'Solutions', href: '/#solutions' },
    { label: 'Stats', href: '/#stats' },
    { label: 'Contact', href: '/#contact' },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full h-16 bg-white dark:bg-[#1E293B] shadow flex items-center z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-full px-6">
        <Link href="/" className="text-[20px] font-bold text-[#A17E25] dark:text-[#D4AF37]">
          Lachs Golden ERP
        </Link>
        {/* Desktop menu */}
        <div className="hidden md:flex md:items-center md:space-x-6">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="text-gray-800 dark:text-gray-200 hover:text-[#A17E25] dark:hover:text-[#D4AF37]"
            >
              {item.label}
            </Link>
          ))}
          <ModeToggle />
          <Button onClick={() => nav('/signup')} className="bg-[#A17E25] hover:bg-[#8C6A1A] text-white">
            Get Started
          </Button>
        </div>
        {/* Mobile menu button */}
        <div className="flex items-center md:hidden">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#374151]"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>
      {/* Mobile menu panel */}
      {menuOpen && (
        <div className="md:hidden bg-white dark:bg-[#1E293B] shadow">
          <div className="flex flex-col px-4 py-2 space-y-1">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-2 rounded text-gray-800 dark:text-gray-200 hover:bg-[#FEF3C7] dark:hover:bg-[#3E3E3E]"
              >
                {item.label}
              </Link>
            ))}
            <Button onClick={() => nav('/signup')} className="w-full bg-[#A17E25] hover:bg-[#8C6A1A] text-white">
              Get Started
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}