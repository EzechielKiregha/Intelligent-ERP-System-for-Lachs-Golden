"use client";
import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import {
  Server,
  Cpu,
  DollarSign,
  Users,
  Cloud,
  Plug,
  LifeBuoy,
  Smile,
  Menu,
  X,
} from 'lucide-react';
import { useNavigation } from '@/hooks/use-navigation';
import { ModeToggle } from './toggleTheme';

// Navbar Component
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
    <nav className="bg-white shadow-md fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-[20px] font-bold text-[#1E40AF]">Lachs Golden ERP
            </Link>
          </div>
          {/* Desktop menu */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            {navItems.map(item => (
              <Link key={item.href} href={item.href} className="text-[14px] text-[#333333] hover:text-[#1E40AF]">
                {item.label}
              </Link>
            ))}
            <ModeToggle />
            <Button onClick={() => nav('/signup')} className="bg-[#1E40AF] cursor-pointer hover:bg-[#1C3A9B] text-white">Get Started</Button>
          </div>
          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-md text-[#333333] hover:bg-gray-100">
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
      {/* Mobile menu panel */}
      {menuOpen && (
        <div className="md:hidden bg-white shadow-md">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map(item => (
              <Link key={item.href} href={item.href} className="block px-3 py-2 rounded-md text-[14px] text-[#333333] hover:bg-gray-100">
                {item.label}
              </Link>
            ))}
            <Link href="" onClick={() => nav('/signup')} className="block px-3 py-2">
              <Button className="w-full bg-[#1E40AF] hover:bg-[#1C3A9B] text-white">Get Started</Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

// Hero Section
export function HeroSection() {

  const nav = useNavigation();


  return (
    <section className="flex items-center justify-center text-center bg-[#F5F5F5] pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-[32px] font-bold text-[#333333] mb-4">
          Intelligent ERP System for Modern Business
        </h1>
        <p className="text-[16px] text-[#555555] mb-6">
          Streamline your operations with AI-powered insights and automation at Lachs Golden & Co Holdings Inc.
        </p>
        <div className="flex justify-center space-x-4">
          <Button onClick={() => nav('/signup')} className="bg-[#1E40AF] cursor-pointer hover:bg-[#1C3A9B] text-white">
            Request Demo
          </Button>
          <Link href="#features">
            <Button className="bg-white border border-[#1E40AF] cursor-pointer text-[#1E40AF] hover:bg-[#F0F7FF] px-6 py-3">
              Learn More
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

// Feature Card
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}
export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <Card className="p-4 rounded-lg shadow-sm hover:shadow-md transition">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <div className="text-[#1E40AF]">{icon}</div>
          <h3 className="text-[18px] font-semibold text-[#333333]">{title}</h3>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-[14px] text-[#555555] mt-2">{description}</p>
      </CardContent>
    </Card>
  );
}

// Features Section
export function FeaturesSection() {
  const features = [
    {
      icon: <Server className="w-6 h-6" />,
      title: 'Centralized Data',
      description: 'Unified dashboard with real-time synchronization across all departments.',
    },
    {
      icon: <Cpu className="w-6 h-6" />,
      title: 'AI-Driven Insights',
      description: 'Advanced analytics and predictive modeling for informed decision-making.',
    },
    {
      icon: <DollarSign className="w-6 h-6" />,
      title: 'Financial Management',
      description: 'Comprehensive financial tracking and automated reporting systems.',
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'HR Management',
      description: 'Streamlined employee management and automated payroll processing.',
    },
    {
      icon: <Plug className="w-6 h-6" />,
      title: 'CRM Integration',
      description: 'Enhanced customer relationship management with AI-powered insights.',
    },
    {
      icon: <Cloud className="w-6 h-6" />,
      title: 'Cloud Architecture',
      description: 'Secure, scalable cloud-based solution for seamless access.',
    },
  ];

  return (
    <section id="features" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-[28px] font-bold text-[#333333] text-center mb-8">
          Comprehensive Business Solutions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, idx) => (
            <FeatureCard key={idx} icon={f.icon} title={f.title} description={f.description} />
          ))}
        </div>
      </div>
    </section>
  );
}

// Stats Section
export function StatsSection() {
  const stats = [
    { icon: <LifeBuoy className="w-6 h-6" />, value: '24/7', label: 'Support Available' },
    { icon: <Smile className="w-6 h-6" />, value: '500+', label: 'Happy Clients' },
    { icon: <Server className="w-6 h-6" />, value: '99.9%', label: 'Uptime Guarantee' },
    { icon: <Plug className="w-6 h-6" />, value: '50+', label: 'Integration Partners' },
  ];
  return (
    <section id="stats" className="py-16 bg-[#F5F5F5]">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-[28px] font-bold text-[#333333] text-center mb-8">Key Metrics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          {stats.map((s, idx) => (
            <div key={idx} className="p-4 bg-white rounded-lg shadow-sm">
              <div className="flex items-center justify-center mb-2 text-[#1E40AF]">{s.icon}</div>
              <p className="text-[24px] font-semibold text-[#333333]">{s.value}</p>
              <p className="text-[14px] text-[#555555] mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Footer
export function Footer() {
  const solutions = [
    { label: 'Financial Management', href: '#' },
    { label: 'HR System', href: '#' },
    { label: 'CRM', href: '#' },
    { label: 'Analytics', href: '#' },
  ];
  const companyLinks = [
    { label: 'About Us', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Partners', href: '#' },
    { label: 'Contact', href: '#' },
  ];
  const social = [
    { icon: <LifeBuoy className="w-5 h-5" />, href: '#' },
    // add other social icons as needed
  ];

  return (
    <footer id="contact" className="bg-[#1E40AF] text-white py-10">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div>
          <h3 className="text-[18px] font-semibold mb-4">Solutions</h3>
          <ul className="space-y-2">
            {solutions.map((s, idx) => (
              <li key={idx}>
                <a href={s.href} className="text-[14px] hover:underline">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-[18px] font-semibold mb-4">Company</h3>
          <ul className="space-y-2">
            {companyLinks.map((c, idx) => (
              <li key={idx}>
                <a href={c.href} className="text-[14px] hover:underline">
                  {c.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-[18px] font-semibold mb-4">Connect</h3>
          <div className="flex space-x-4">
            {social.map((s, idx) => (
              <a key={idx} href={s.href} className="hover:text-gray-300">
                {s.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-8 text-center text-[12px] text-white/80">
        © {new Date().getFullYear()} Lachs Golden ERP. All rights reserved.
      </div>
    </footer>
  );
}
