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
  CheckCircle,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
} from 'lucide-react';
import { useNavigation } from '@/hooks/use-navigation';
import { ModeToggle } from './toggleTheme';

// LeftAuthPanel Component
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

// Hero Section
export function HeroSection() {
  const nav = useNavigation();
  return (
    <section className="pt-16 bg-white dark:bg-[#111827]">
      <div className="h-[548px] max-w-7xl mx-auto flex flex-col justify-center items-center px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-gray-200 mb-4">
          Intelligent ERP System for Modern Business
        </h1>
        <p className="text-base md:text-lg text-gray-500 dark:text-gray-400 mb-6">
          Streamline your operations with AI-powered insights and automation at Lachs Golden & Co Holdings Inc.
        </p>
        <div className="flex space-x-4">
          <Button onClick={() => nav('/signup')} className="bg-[#A17E25] hover:bg-[#8C6A1A] text-white rounded-lg px-6 py-3">
            Request Demo
          </Button>
          <Link href="#features">
            <Button className="border border-[#A17E25] text-[#A17E25] hover:bg-[#FEF3C7] rounded-lg px-6 py-3">
              Learn More
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

// Features Section
export function FeaturesSection() {
  const features = [
    {
      icon: <Server className="w-6 h-6 text-[#A17E25] dark:text-[#D4AF37]" />,
      title: 'Centralized Data',
      description: 'Unified dashboard with real-time synchronization across all departments.',
    },
    {
      icon: <Cpu className="w-6 h-6 text-[#A17E25] dark:text-[#D4AF37]" />,
      title: 'AI-Driven Insights',
      description: 'Advanced analytics and predictive modeling for informed decision-making.',
    },
    {
      icon: <DollarSign className="w-6 h-6 text-[#A17E25] dark:text-[#D4AF37]" />,
      title: 'Financial Management',
      description: 'Comprehensive financial tracking and automated reporting systems.',
    },
    {
      icon: <Users className="w-6 h-6 text-[#A17E25] dark:text-[#D4AF37]" />,
      title: 'HR Management',
      description: 'Streamlined employee management and automated payroll processing.',
    },
    {
      icon: <Plug className="w-6 h-6 text-[#A17E25] dark:text-[#D4AF37]" />,
      title: 'CRM Integration',
      description: 'Enhanced customer relationship management with AI-powered insights.',
    },
    {
      icon: <Cloud className="w-6 h-6 text-[#A17E25] dark:text-[#D4AF37]" />,
      title: 'Cloud Architecture',
      description: 'Secure, scalable cloud-based solution for seamless access.',
    },
  ];

  return (
    <section id="features" className="py-16 bg-white dark:bg-[#111827]">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 text-center mb-8">
          Comprehensive Business Solutions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, idx) => (
            <Card key={idx} className="p-6 rounded-lg shadow-md bg-white dark:bg-[#1E293B]">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  {f.icon}
                  <h3 className="text-[18px] font-semibold text-gray-800 dark:text-gray-200">
                    {f.title}
                  </h3>
                </div>
              </CardHeader>
              <CardContent>
                <p className="mt-2 text-[14px] text-gray-500 dark:text-gray-400">{f.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// Stats Section
export function StatsSection() {
  const stats = [
    { icon: <LifeBuoy className="w-6 h-6 text-[#A17E25] dark:text-[#D4AF37]" />, value: '24/7', label: 'Support Available' },
    { icon: <Smile className="w-6 h-6 text-[#A17E25] dark:text-[#D4AF37]" />, value: '500+', label: 'Happy Clients' },
    { icon: <Server className="w-6 h-6 text-[#A17E25] dark:text-[#D4AF37]" />, value: '99.9%', label: 'Uptime Guarantee' },
    { icon: <Plug className="w-6 h-6 text-[#A17E25] dark:text-[#D4AF37]" />, value: '50+', label: 'Integration Partners' },
  ];

  return (
    <section id="stats" className="py-16 bg-white dark:bg-[#111827]">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 text-center mb-8">
          Key Metrics
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s, idx) => (
            <div key={idx} className="p-6 bg-white dark:bg-[#1E293B] rounded-lg shadow flex flex-col items-center">
              <div className="mb-2">{s.icon}</div>
              <p className="text-2xl font-semibold text-gray-800 dark:text-gray-200">{s.value}</p>
              <p className="mt-1 text-[14px] text-gray-500 dark:text-gray-400">{s.label}</p>
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
    { icon: <LifeBuoy className="w-5 h-5 text-[#A17E25] dark:text-[#D4AF37]" />, href: '#' },
    { icon: <Facebook className="w-5 h-5 text-[#A17E25] dark:text-[#D4AF37]" />, href: '#' },
    { icon: <Twitter className="w-5 h-5 text-[#A17E25] dark:text-[#D4AF37]" />, href: '#' },
    { icon: <Linkedin className="w-5 h-5 text-[#A17E25] dark:text-[#D4AF37]" />, href: '#' },
    { icon: <Instagram className="w-5 h-5 text-[#A17E25] dark:text-[#D4AF37]" />, href: '#' },
  ];

  return (
    <footer id="contact" className="bg-[#030300] dark:bg-[#111827] text-white py-10">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div>
          <h3 className="text-[18px] font-semibold mb-4 text-gray-200">Solutions</h3>
          <ul className="space-y-2">
            {solutions.map((s, idx) => (
              <li key={idx}>
                <a href={s.href} className="text-[14px] text-gray-200 hover:underline">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-[18px] font-semibold mb-4 text-gray-200">Company</h3>
          <ul className="space-y-2">
            {companyLinks.map((c, idx) => (
              <li key={idx}>
                <a href={c.href} className="text-[14px] text-gray-200 hover:underline">
                  {c.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-[18px] font-semibold mb-4 text-gray-200">Connect</h3>
          <div className="flex space-x-4">
            {social.map((s, idx) => (
              <a key={idx} href={s.href} className="hover:text-gray-400">
                {s.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-8 text-center text-[12px] text-gray-400">
        © {new Date().getFullYear()} Lachs Golden ERP. All rights reserved.
      </div>
    </footer>
  );
}
