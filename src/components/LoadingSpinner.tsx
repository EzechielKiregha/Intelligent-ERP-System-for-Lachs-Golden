// Apply PROJECT_CONTEXT.md styling:
// - Dark-gold theme: use utility classes: light-mode accent bg-[#A17E25] hover:bg-[#8C6A1A], dark-mode accent dark:bg-[#D4AF37] hover:dark:bg-[#BFA132].
// - Backgrounds: bg-white / dark:bg-[#111827], card bg-white dark:bg-[#1E1E1E].
// - Text: text-gray-800 / dark:text-gray-200, muted text-gray-500 / dark:text-gray-400.
// - Navbar height h-16; Hero height h-[548px] offset by pt-16; Auth card md:h-[635px] with LeftAuthPanel + form.
// - Use Tailwind utility classes only (including arbitrary values for exact heights/spacings). Avoid inline styles.
// - Use ShadcnUI components or plain elements styled per utilities; icons from lucide-react with text-[#A17E25] dark:text-[#D4AF37].
// - Form logic: React Hook Form + Zod; data: TanStack Query + AxiosInstance; auth: NextAuth; loading overlay via LoadingContext.
// - Responsive: mobile-first; two-panel layout on md+ for auth; sidebar+main for dashboard.
// - Accessibility: focus rings focus:ring-2 focus:ring-offset-2 focus:ring-[#A17E25] dark:focus:ring-[#D4AF37], semantic HTML, ARIA roles.
// - Verify dimensions: ensure heights (h-16, h-[548px], md:h-[635px]) match shared designs.
// - Ensure consistent spacing, typography, and motion using Tailwind utilities (e.g., p-4, gap-6, transition ease-in-out duration-150).
// - Leave all logic intact (React Hook Form, TanStack Query, AxiosInstance, NextAuth, etc.).
'use client';

import { useLoading } from '@/contexts/loadingContext';

const LoadingSpinner = () => {
  const { isLoading } = useLoading();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-[#A17E25] dark:border-t-[#D4AF37] border-gray-200"></div>
    </div>
  );
};

export default LoadingSpinner;