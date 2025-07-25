import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Square, SquareArrowDownRight } from "lucide-react";
import {
  LifeBuoy,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
} from 'lucide-react';
import Image from "next/image";

export default function PrivacyPolicy() {
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
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className=" fixed w-full border-b-3 border-[#D4AF37] dark:bg-gray-950 bg-gray-50 bg-clip-padding backdrop-filter backdrop-blur-lg bg-opacity-40 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between">
          <Link href="/" className="text-xl items-center font-bold flex flex-row gap-1.5 text-sidebar-primary dark:text-[#D4AF37]">
            <Image width="50" height="50" src="https://lachsgolden.com/wp-content/uploads/2024/01/LACHS-logo-02-2048x1006-removebg-preview-e1735063006450.png"
              alt="" sizes="(max-width: 371px) 100vw, 371px" />
            <p>{'Intelligent ERP - Lachs Golden'}</p>
            <span className="hidden md:flex text-sm text-muted-foreground">{'Inc.'}</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" className="gap-2 cursor-pointer text-[#80410e] dark:text-[#D4AF37]">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 mt-20">
        <div className="container mx-auto py-12 max-w-3xl">
          <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>

          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <p className="text-muted-foreground mb-6">
              Last updated: June 15, 2025
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
              <p>
                Lachs Golden (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;)
                respects your privacy and is committed to protecting your
                personal data. This privacy policy will inform you about how we
                look after your personal data when you visit our website and
                tell you about your privacy rights and how the law protects you.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                The Data We Collect
              </h2>
              <p>
                We may collect, use, store and transfer different kinds of
                personal data about you which we have grouped together as
                follows:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-2">
                <li>
                  <strong>Identity Data</strong> includes first name, last name,
                  username or similar identifier.
                </li>
                <li>
                  <strong>Contact Data</strong> includes email address.
                </li>
                <li>
                  <strong>Technical Data</strong> includes internet protocol
                  (IP) address, browser type and version, time zone setting and
                  location, browser plug-in types and versions, operating system
                  and platform, and other technology on the devices you use to
                  access this website.
                </li>
                <li>
                  <strong>Usage Data</strong> includes information about how you
                  use our website and services.
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                How We Use Your Data
              </h2>
              <p>
                We will only use your personal data when the law allows us to.
                Most commonly, we will use your personal data in the following
                circumstances:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-2">
                <li>To register you as a new user.</li>
                <li>To provide and improve our services.</li>
                <li>To manage our relationship with you.</li>
                <li>To administer and protect our business and website.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
              <p>
                We have put in place appropriate security measures to prevent
                your personal data from being accidentally lost, used, or
                accessed in an unauthorized way, altered, or disclosed. In
                addition, we limit access to your personal data to those
                employees, agents, contractors, and other third parties who have
                a business need to know.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Data Retention</h2>
              <p>
                We will only retain your personal data for as long as necessary
                to fulfill the purposes we collected it for, including for the
                purposes of satisfying any legal, accounting, or reporting
                requirements.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Your Legal Rights</h2>
              <p>
                Under certain circumstances, you have rights under data
                protection laws in relation to your personal data, including the
                right to:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-2">
                <li>Request access to your personal data.</li>
                <li>Request correction of your personal data.</li>
                <li>Request erasure of your personal data.</li>
                <li>Object to processing of your personal data.</li>
                <li>Request restriction of processing your personal data.</li>
                <li>Request transfer of your personal data.</li>
                <li>Right to withdraw consent.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                Changes to This Privacy Policy
              </h2>
              <p>
                We may update our privacy policy from time to time. We will
                notify you of any changes by posting the new privacy policy on
                this page and updating the &quot;last updated&quot; date at the
                top of this privacy policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
              <p>
                If you have any questions about this privacy policy or our
                privacy practices, please contact us at:
              </p>
              <p className="mt-2">
                <strong>Email:</strong> arkar1712luffy@gmail.com
              </p>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer id="contact" className="bg-transparent border-t-3 border-[#D4AF37] text-white py-10">
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
          © {new Date().getFullYear()} Golden Intelingent ERP. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
