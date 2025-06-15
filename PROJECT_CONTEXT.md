# Intelligent ERP System for Modern Business - Project Context for Copilot

- Theme tokens:
  - Gold accent: #D4AF37, hover #B8860B
  - Light BG: #FFF8E1, White: #FFFFFF
  - Dark BG: #121212, #1E1E1E
  - Text: #333333 on light, #FFFFFF on dark
  - Focus ring: #D4AF37
  - Rounded corners: 8px (rounded-lg); Shadows: shadow-md
- Layout patterns:
  - Auth pages: two-panel on md+: LeftAuthPanel + form panel; stack on mobile.
  - Landing: Navbar fixed + Hero + Features + Stats + Footer.
  - Dashboard: Sidebar + main content cards with gold accents.
- UI libs: ShadcnUI components, lucide-react icons.
- Behavior: React Hook Form + Zod, TanStack Query + AxiosInstance, NextAuth, LoadingContext.
- Accessibility: semantic HTML, aria-labels, visible focus rings.
- Responsiveness: mobile-first, use Tailwind breakpoints (sm, md, lg).
