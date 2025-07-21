import {
  LifeBuoy,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
} from 'lucide-react';

export function Footer() {
  const solutions = [
    { label: 'Financial Management', href: '#' },
    { label: 'HR System', href: '#' },
    { label: 'CRM', href: '#' },
    { label: 'Analytics', href: '#' },
  ];
  const companyLinks = [
    { label: 'Industries', href: 'https://lachsgolden.com/services/' },
    { label: 'Contact us', href: 'https://lachsgolden.com/contact-us-2/' },
    { label: 'Who we are', href: 'https://lachsgolden.com/about/' },
  ];
  const social = [
    { icon: <LifeBuoy className="w-5 h-5 text-[#D4AF37] dark:text-[#D4AF37]" />, href: '#' },
    { icon: <Facebook className="w-5 h-5 text-[#D4AF37] dark:text-[#D4AF37]" />, href: '#' },
    { icon: <Twitter className="w-5 h-5 text-[#D4AF37] dark:text-[#D4AF37]" />, href: '#' },
    { icon: <Linkedin className="w-5 h-5 text-[#D4AF37] dark:text-[#D4AF37]" />, href: '#' },
    { icon: <Instagram className="w-5 h-5 text-[#D4AF37] dark:text-[#D4AF37]" />, href: '#' },
  ];

  return (
    <footer id="contact" className="bg-transparent border-t-3 border-[#D4AF37] dark:text-white py-10">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div>
          <h3 className="text-[18px] font-semibold mb-4 dark:text-gray-200">Solutions</h3>
          <ul className="space-y-2">
            {solutions.map((s, idx) => (
              <li key={idx}>
                <a href={s.href} className="text-[14px] dark:text-gray-200 hover:underline">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-[18px] font-semibold mb-4 dark:text-gray-200">Company</h3>
          <ul className="space-y-2">
            {companyLinks.map((c, idx) => (
              <li key={idx}>
                <a href={c.href} className="text-[14px] dark:text-gray-200 hover:underline">
                  {c.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-[18px] font-semibold mb-4 dark:text-gray-200">Connect</h3>
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
        © {new Date().getFullYear()} Golden Intelingent ERP. All rights reserved.
      </div>
    </footer>
  );
}
