# 🧠 PROJECT_CONTEXT.md

## 1. Project Overview
**Intelligent ERP System for Modern Business** (Lachs Golden & Co Holdings Inc.)

- Centralized ERP platform with modules: Finance, Inventory, CRM, HR, Settings, Analytics, etc.
- Premium “dark gold” theme: rich gold accents on neutral backgrounds; avoid blues.
- Support light mode and dark mode using Tailwind utility classes (`dark:` variants).
- Fully responsive: mobile-first; two-panel layouts on larger screens; adaptive grids.
- Consistent typography, spacing, and motion across components.
- Use Next.js App Router (`app/`), ShadcnUI components or plain elements with Tailwind utility classes, lucide-react icons, React Hook Form + Zod, TanStack Query + AxiosInstance, NextAuth for auth, LoadingContext for spinners.

> **Using with Copilot**: Keep this file open. At the top of each new file, insert:
> ```ts
> // Apply PROJECT_CONTEXT.md: dark-gold theme, Tailwind utility classes only, responsive, dark/light mode, ShadcnUI or utility-based components, Zod+RHF, TanStack+Axios, NextAuth, LoadingContext.
> ```
> Use this prompt so Copilot follows these guidelines without needing explicit config files.

---

## 2. Theme & Color Tokens (Utility Classes)
Use Tailwind utility classes with hex values or built-in gray scales. Do not rely on custom config; use arbitrary values or default utilities.

- **Primary Accent (Gold)**:
  - Light mode accent (dark gold): use `text-[#A17E25]`, `bg-[#A17E25]`, `hover:bg-[#8C6A1A]`.
  - Dark mode accent (bright gold): use `dark:text-[#D4AF37]`, `dark:bg-[#D4AF37]`, `dark:hover:bg-[#BFA132]`.

- **Backgrounds**:
  - Light mode page: `bg-white` or `bg-[#FFFFFF]`.
  - Dark mode page: `dark:bg-[#111827]` or `dark:bg-black`.
  - Card/surface: `bg-gray-50` / `dark:bg-[#1E293B]` or use hex: `bg-[#F3F4F6]` / `dark:bg-[#1E293B]`.
  - Auth card: `bg-white dark:bg-[#1E1E1E] shadow-lg rounded-lg`.

- **Text Colors**:
  - Primary text: `text-gray-800` / `dark:text-gray-200` or hex: `text-[#1F2937]` / `dark:text-[#E5E7EB]`.
  - Muted text: `text-gray-500` / `dark:text-gray-400` or `text-[#6B7280]` / `dark:text-[#9CA3AF]`.
  - Error text: `text-[#E53E3E]` / `dark:text-[#FC8181]`.

- **Borders**:
  - Light: `border border-gray-300` or `border-[ #D1D5DB ]`.
  - Dark: `dark:border-[#374151]`.

- **Accent States**:
  - Success: `text-green-500` / `dark:text-green-400`.
  - Info: `text-blue-500` / `dark:text-blue-400`.
  - Warning: `text-amber-500` / `dark:text-amber-400`.
  - Error: as above.

Use built-in gray and color utilities when possible, or arbitrary hex in brackets: `bg-[#A17E25]`.

---

## 3. Typography & Spacing (Utility Classes)
- **Font Family**: import Inter or system sans; apply `font-sans` globally.
- **Headings**:
  - H1: `text-5xl font-extrabold` (~48px).
  - H2: `text-4xl font-bold` (~36px).
  - H3: `text-3xl font-bold` (~30px).
  - H4: `text-2xl font-semibold` (~24px).
  - H5: `text-xl font-semibold` (~20px).
  - H6: `text-lg font-medium` (~18px).
- **Body**: `text-base leading-relaxed` (16px).
- **Small**: `text-sm` (14px), `text-xs` (12px).

- **Spacing**: use Tailwind spacing: `p-4`,`p-6`,`p-8`,`mt-4`,`mb-6`,`gap-4`,`gap-6`. For exact values, use arbitrary: `h-[548px]`, `md:h-[635px]`, etc.

---

## 4. Layout & Dimensions
All layouts use Tailwind utility classes; no config required.

### 4.1. Navbar
- **Height**: `h-16`.
- **Classes**: `fixed top-0 left-0 w-full h-16 bg-white dark:bg-[#1E293B] shadow flex items-center px-6`.
- **Text**: logo `text-[#A17E25] dark:text-[#D4AF37]`, links `text-gray-800 dark:text-gray-200 hover:text-[#A17E25] dark:hover:text-[#D4AF37]`.
- **Mobile menu**: `md:hidden` for hamburger; dropdown panel `bg-white dark:bg-[#1E293B]`.

### 4.2. Hero Section
- **Offset**: parent with `pt-16` so content appears below navbar.
- **Height**: `h-[548px] md:h-[548px]` or `min-h-[calc(100vh-64px)]` using utility: `min-h-[calc(100vh-4rem)]`.
- **Classes**: `max-w-screen-xl mx-auto flex flex-col justify-center items-center px-4 bg-white dark:bg-[#111827] text-center`.
- **Headline**: `text-4xl md:text-5xl font-bold text-gray-800 dark:text-gray-200 mb-4`.
- **Subtitle**: `text-base md:text-lg text-gray-500 dark:text-gray-400 mb-6`.
- **Buttons**: Primary: `bg-[#A17E25] hover:bg-[#8C6A1A] text-white rounded-lg px-6 py-3 shadow transition`; Outline: `border border-[#A17E25] text-[#A17E25] hover:bg-[#FEF3C7] rounded-lg px-6 py-3`.

### 4.3. Auth Card
- **Wrapper**: `flex items-center justify-center min-h-screen bg-white dark:bg-[#111827] px-4`.
- **Card**: `bg-white dark:bg-[#1E1E1E] shadow-lg rounded-lg flex flex-col md:flex-row w-full max-w-[900px] md:h-[635px] overflow-hidden`.
- **Left Panel**: `hidden md:flex flex-col justify-between h-full w-1/2 bg-gradient-to-b from-[#A17E25] to-[#8C6A1A] dark:bg-[#1F1F1F] text-white p-6`.
  - Top: `<h2 class="text-[24px] font-bold">Lachs Golden ERP</h2>` + `<p class="mt-2 text-[16px]">Enterprise Resource Planning Solution</p>`.
  - Bottom bullets: `<ul class="space-y-2">` each `<li class="flex items-center"><CheckCircle class="w-5 h-5 mr-2 text-white"/><span class="text-[14px]">...</span></li>`.
- **Form Panel**: `flex-1 flex items-center justify-center p-6 overflow-auto`.
  - Form container: `w-full max-w-md space-y-4`.
  - Title: `text-[24px] font-semibold text-gray-800 dark:text-gray-200`.
  - Fields: `<Label>` + `<Input>` or `<input class="w-full px-4 py-2 border border-gray-300 dark:border-[#374151] rounded-md focus:outline-none focus:ring-2 focus:ring-[#A17E25] dark:focus:ring-[#D4AF37] bg-transparent text-gray-800 dark:text-gray-200 placeholder:text-gray-500 dark:placeholder:text-gray-400" />`.
  - Error: `mt-1 text-[12px] text-[#E53E3E] dark:text-[#FC8181]`.
  - Button: `w-full bg-[#A17E25] hover:bg-[#8C6A1A] text-white rounded-lg py-2 disabled:opacity-50`.
  - Checkbox: `<input type="checkbox" class="h-4 w-4 text-[#A17E25] border-gray-300 dark:border-[#374151] rounded" />`.
  - Links: `text-[#A17E25] hover:underline`.

### 4.4. Dashboard
- **Root**: `flex bg-white dark:bg-[#111827] min-h-screen`.
- **Sidebar**: `hidden lg:flex flex-col w-64 bg-white dark:bg-[#1E1E1E] shadow`.
  - Links: `flex items-center px-4 py-2 rounded hover:bg-[#FEF3C7] dark:hover:bg-[#3E3E3E] text-gray-800 dark:text-gray-200` plus active `bg-[#A17E25] text-white`.
- **Main**: `flex-1 p-6 overflow-auto`.
  - Stats grid: `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">` cards: `bg-white dark:bg-[#1E293B] rounded-lg shadow p-6`.
  - Charts grid: `<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">` wrappers: `bg-white dark:bg-[#1E293B] rounded-lg shadow p-4`.
  - Tables: wrap in `<div class="overflow-auto bg-white dark:bg-[#1E293B] rounded-lg shadow p-4">`.

### 4.5. Tables
- `<div class="overflow-auto"> <table class="min-w-full divide-y divide-gray-300 dark:divide-[#374151]">`.
- `<thead class="bg-gray-50 dark:bg-[#1E293B]"> <tr> <th class="px-4 py-2 text-left text-sm font-medium text-gray-800 dark:text-gray-200">...`.
- `<tbody class="divide-y divide-gray-200 dark:divide-[#374151]"> <tr class="odd:bg-white even:bg-gray-50 dark:odd:bg-[#1E293B] dark:even:bg-[#1F2A3A]"> <td class="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">...`.

### 4.6. Forms Beyond Auth
- Use same input styles. Layout with `grid grid-cols-1 md:grid-cols-2 gap-4`.
- Toggles/selects styled similarly. Buttons same primary style.

### 4.7. Buttons & Interactions
- **Primary**: `bg-[#A17E25] hover:bg-[#8C6A1A] text-white font-medium rounded-lg px-4 py-2 shadow transition duration-150`.
- **Dark mode**: `dark:bg-[#D4AF37] dark:hover:bg-[#BFA132]`.
- **Secondary**: `bg-gray-100 dark:bg-[#1E293B] hover:bg-gray-200 dark:hover:bg-[#2A2E3B] text-gray-800 dark:text-gray-200 rounded-lg px-4 py-2`.
- **Disabled**: `opacity-50 cursor-not-allowed`.

### 4.8. Alerts & Toasts
- Container: top-right: `fixed top-4 right-4 space-y-2`.
- Toast: `bg-white dark:bg-[#1E293B] border-l-4 border-green-500 dark:border-green-400 text-gray-800 dark:text-gray-200 p-4 rounded-lg shadow`.
- Role: `role="alert"`.

### 4.9. LoadingSpinner & Overlay
- Spinner: `<Loader2 class="h-6 w-6 animate-spin text-[#A17E25] dark:text-[#D4AF37]"/>` inside `flex items-center justify-center`.
- Overlay: `<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">` + spinner.

### 4.10. Icons
- lucide-react icons with class `text-[#A17E25] dark:text-[#D4AF37]`. Size with `w-6 h-6` or as needed.

### 4.11. Motion & Transitions
- Use Tailwind: `transition ease-in-out duration-150` on interactive elements; `hover:shadow-lg`, `hover:-translate-y-0.5 motion-safe:transform`.
- For reduced motion: `motion-safe:` and `motion-reduce:transition-none`.
- For modals/page transitions, optionally Framer Motion with short durations.

---

## 5. Auth Page Specifics
Common structure; keep prompt at top when generating.

### 5.1. Wrapper & Card
```html
<div class="flex items-center justify-center min-h-screen bg-white dark:bg-[#111827] px-4">
  <div class="bg-white dark:bg-[#1E1E1E] shadow-lg rounded-lg flex flex-col md:flex-row w-full max-w-[900px] md:h-[635px] overflow-hidden">
    <!-- LeftAuthPanel -->
    <!-- Form Panel -->
  </div>
</div>
```

### 5.2. LeftAuthPanel
```tsx
export function LeftAuthPanel() {
  return (
    <div class="hidden md:flex flex-col justify-between h-full w-1/2 bg-gradient-to-b from-[#A17E25] to-[#8C6A1A] dark:bg-[#1F1F1F] text-white p-6">
      <div>
        <h2 class="text-[24px] font-bold">Lachs Golden ERP</h2>
        <p class="mt-2 text-[16px]">Enterprise Resource Planning Solution</p>
      </div>
      <ul class="space-y-2">
        <li class="flex items-center"><CheckCircle className="w-5 h-5 mr-2 text-white"/><span class="text-[14px]">AI-Powered Analytics & Insights</span></li>
        <!-- more bullets -->
      </ul>
    </div>
  );
}
```

### 5.3. Form Panel
- `<div class="flex-1 flex items-center justify-center p-6 overflow-auto">`.
- Form container: `<form class="w-full max-w-md space-y-4">`.
- Fields: use `<Label>` + `<Input>` or `<input>` with classes:
  `w-full px-4 py-2 border border-gray-300 dark:border-[#374151] rounded-md focus:outline-none focus:ring-2 focus:ring-[#A17E25] dark:focus:ring-[#D4AF37] bg-transparent text-gray-800 dark:text-gray-200 placeholder:text-gray-500 dark:placeholder:text-gray-400`.
- Error: `<p class="mt-1 text-[12px] text-[#E53E3E] dark:text-[#FC8181]">...</p>`.
- Button: `<button type="submit" class="w-full bg-[#A17E25] hover:bg-[#8C6A1A] dark:bg-[#D4AF37] dark:hover:bg-[#BFA132] text-white rounded-lg py-2 disabled:opacity-50">`.
- Checkbox: `<input type="checkbox" class="h-4 w-4 text-[#A17E25] dark:text-[#D4AF37] border-gray-300 dark:border-[#374151] rounded" />`.
- Links: `<a href="..." class="text-[#A17E25] hover:underline">`.

### 5.4. Page Variants
- **Signup**: fields: first & last name side-by-side (`grid grid-cols-1 md:grid-cols-2 gap-4`), company, email, password, terms checkbox.
- **Login**: email, password, remember me.
- **Forgot Password**: email only.
- **Reset Password**: password & confirm password; extract `token` from query param in client component.

### 5.5. Form Logic
- Use React Hook Form + Zod for schema and validation.
- Submit via TanStack Query `useMutation` with AxiosInstance POST to API.
- On mutate: `setIsLoading(true)`; on success/error: `setIsLoading(false)`, show message or redirect.
- Show loading overlay via LoadingContext.

---

## 6. Dashboard Components

### 6.1. Sidebar & Topbar
- Sidebar: `hidden lg:flex flex-col w-64 bg-white dark:bg-[#1E1E1E]`.
- Links: `flex items-center px-4 py-2 rounded hover:bg-[#FEF3C7] dark:hover:bg-[#3E3E3E] text-gray-800 dark:text-gray-200`, active: `bg-[#A17E25] text-white`.
- Topbar: `flex items-center justify-between bg-white dark:bg-[#1E1E1E] px-4 py-2 shadow`.
- Include theme toggle, user menu.

### 6.2. Stat Cards
- Grid: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6`.
- Card: `bg-white dark:bg-[#1E293B] rounded-lg shadow p-6 flex flex-col`.
- Title: `text-sm text-gray-500 dark:text-gray-400`; Value: `text-2xl font-bold text-gray-800 dark:text-gray-200`; Icon: `text-[#A17E25] dark:text-[#D4AF37]`.

### 6.3. Charts
- Wrapper: `bg-white dark:bg-[#1E293B] rounded-lg shadow p-4`.
- Use Recharts/Chart.js, set stroke/fill colors to accent or muted.
- Responsive: width=100%, height via parent container.

### 6.4. Tables
- As in section 4.5.

### 6.5. Forms & Settings
- Use same utility classes as auth forms; layout with grid if multiple fields.

### 6.6. Modals & Overlays
- Use fixed inset overlay and content box as in section 5.
- Animations: fade/scale with Tailwind transitions or Framer Motion.

### 6.7. Alerts & Toasts
- Use fixed container; style per section 4.8.

### 6.8. Loading
- Use LoadingOverlay via LoadingContext.
- Spinner as in 4.9.

---

## 7. Motion & Accessibility
- Use Tailwind `transition ease-in-out duration-150`, `hover:shadow-lg`, `hover:scale-105 motion-safe:transform`.
- Respect `motion-reduce`: `motion-reduce:transition-none`.
- Focus: `focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A17E25] dark:focus:ring-[#D4AF37]`.
- Semantic HTML and ARIA roles: `<nav>`, `<main>`, `<header>`, `<footer>`, `aria-current`, `role="alert"`, `aria-modal`, etc.
- Contrast: ensure text/background meets WCAG.

---

## 8. Copilot Prompt Template
At the top of any new file, insert:
```ts
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
```
This ensures Copilot generates code matching these guidelines.

---

## 9. Usage Notes
- **Keep this file open** in VSCode for Copilot context.
- **Use VSCode snippet** (prefix e.g. `erpcomp`) to insert prompt automatically.
- **Don't reference tailwind.config.js**; rely on utility classes and arbitrary values directly.
- **Verify dimensions**: compare rendered UI against shared images to ensure heights (`h-16`, `h-[548px]`, `md:h-[635px]`) match.
- **Adjust hex codes** if Figma uses slightly different gold shades; update prompt accordingly.

---

_By following this `PROJECT_CONTEXT.md`, all components and pages in the Intelligent ERP System will share a cohesive dark-gold theme, correct dimensions, and consistent responsive and accessible behavior._
