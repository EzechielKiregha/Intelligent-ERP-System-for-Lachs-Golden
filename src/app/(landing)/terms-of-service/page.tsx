import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LayoutDashboard, Square, SquareArrowDownRight } from "lucide-react";
import {
  LifeBuoy,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
} from 'lucide-react';
import Image from "next/image";

export default function TermsOfService() {
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
          <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>

          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <p className="text-muted-foreground mb-6">
              Last updated: June 15, 2025
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
              <p>
                Welcome to Lachs Golden Intelligent ERP (&quot;Company&quot;, &quot;we&quot;,
                &quot;our&quot;, &quot;us&quot;)! These Terms of Service
                (&quot;Terms&quot;, &quot;Terms of Service&quot;) govern your
                use of our website and software application Lachs Golden Intelligent ERP (together
                or individually &quot;Service&quot;) operated by Lachs Golden Intelligent ERP.
              </p>
              <p className="mt-2">
                Our Privacy Policy also governs your use of our Service and
                explains how we collect, safeguard and disclose information that
                results from your use of our web pages. Your agreement with us
                includes these Terms and our Privacy Policy
                (&quot;Agreements&quot;). You acknowledge that you have read and
                understood Agreements, and agree to be bound by them.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. Communications</h2>
              <p>
                By using our Service, you agree to subscribe to newsletters,
                marketing or promotional materials and other information we may
                send. However, you may opt out of receiving any, or all, of
                these communications from us by following the unsubscribe link
                or by emailing us.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. Purchases</h2>
              <p>
                If you wish to purchase any product or service made available
                through the Service (&quot;Purchase&quot;), you may be asked to
                supply certain information relevant to your Purchase including
                your credit card number, the expiration date of your credit
                card, your billing address, and your shipping information.
              </p>
              <p className="mt-2">
                You represent and warrant that: (i) you have the legal right to
                use any credit card(s) or other payment method(s) in connection
                with any Purchase; and that (ii) the information you supply to
                us is true, correct and complete.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. Content</h2>
              <p>
                Our Service allows you to post, link, store, share and otherwise
                make available certain information, text, graphics, videos, or
                other material (&quot;Content&quot;). You are responsible for
                the Content that you post on or through the Service, including
                its legality, reliability, and appropriateness.
              </p>
              <p className="mt-2">
                By posting Content on or through the Service, You represent and
                warrant that: (i) the Content is yours (you own it) and/or you
                have the right to use it and the right to grant us the rights
                and license as provided in these Terms, and (ii) that the
                posting of your Content on or through the Service does not
                violate the privacy rights, publicity rights, copyrights,
                contract rights or any other rights of any person or entity.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                5. Prohibited Uses
              </h2>
              <p>
                You may use the Service only for lawful purposes and in
                accordance with Terms. You agree not to use the Service:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-2">
                <li>
                  In any way that violates any applicable national or
                  international law or regulation.
                </li>
                <li>
                  For the purpose of exploiting, harming, or attempting to
                  exploit or harm minors in any way.
                </li>
                <li>
                  To transmit, or procure the sending of, any advertising or
                  promotional material, including any &quot;junk mail&quot;,
                  &quot;chain letter,&quot; &quot;spam,&quot; or any other
                  similar solicitation.
                </li>
                <li>
                  To impersonate or attempt to impersonate Company, a Company
                  employee, another user, or any other person or entity.
                </li>
                <li>
                  In any way that infringes upon the rights of others, or in any
                  way is illegal, threatening, fraudulent, or harmful, or in
                  connection with any unlawful, illegal, fraudulent, or harmful
                  purpose or activity.
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                6. Intellectual Property
              </h2>
              <p>
                The Service and its original content (excluding Content provided
                by users), features and functionality are and will remain the
                exclusive property of Lachs Golden Intelligent ERP and its licensors. The Service
                is protected by copyright, trademark, and other laws of both the
                United States and foreign countries. Our trademarks and trade
                dress may not be used in connection with any product or service
                without the prior written consent of Lachs Golden Intelligent ERP.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                7. Open Source License
              </h2>
              <p>
                Lachs Golden Intelligent ERP is provided under the MIT License. You are free to
                use, modify, and distribute the software according to the terms
                of this license.
              </p>
              <p className="mt-2">
                The MIT License grants permission, free of charge, to any person
                obtaining a copy of this software and associated documentation
                files, to deal in the Software without restriction, including
                without limitation the rights to use, copy, modify, merge,
                publish, distribute, sublicense, and/or sell copies of the
                Software.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">8. Termination</h2>
              <p>
                We may terminate or suspend your account and bar access to the
                Service immediately, without prior notice or liability, under
                our sole discretion, for any reason whatsoever and without
                limitation, including but not limited to a breach of the Terms.
              </p>
              <p className="mt-2">
                If you wish to terminate your account, you may simply
                discontinue using the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                9. Limitation of Liability
              </h2>
              <p>
                In no event shall Lachs Golden Intelligent ERP, nor its directors, employees,
                partners, agents, suppliers, or affiliates, be liable for any
                indirect, incidental, special, consequential or punitive
                damages, including without limitation, loss of profits, data,
                use, goodwill, or other intangible losses, resulting from (i)
                your access to or use of or inability to access or use the
                Service; (ii) any conduct or content of any third party on the
                Service; (iii) any content obtained from the Service; and (iv)
                unauthorized access, use or alteration of your transmissions or
                content, whether based on warranty, contract, tort (including
                negligence) or any other legal theory, whether or not we have
                been informed of the possibility of such damage.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                10. Changes to Terms
              </h2>
              <p>
                We reserve the right, at our sole discretion, to modify or
                replace these Terms at any time. If a revision is material we
                will provide at least 30 days&apos; notice prior to any new
                terms taking effect. What constitutes a material change will be
                determined at our sole discretion.
              </p>
              <p className="mt-2">
                By continuing to access or use our Service after any revisions
                become effective, you agree to be bound by the revised terms. If
                you do not agree to the new terms, you are no longer authorized
                to use the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">11. Contact Us</h2>
              <p>
                If you have any questions about these Terms, please contact us
                at:
              </p>
              <p className="mt-2">
                <strong>Email:</strong> kireghacorp@gmail.com
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
