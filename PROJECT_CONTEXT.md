# 🧠 PROJECT_CONTEXT.md

## 🏢 Project Title
**Intelligent ERP System for Modern Business**

An ERP platform for Lachs Golden & Co Holdings Inc., integrating business modules (Finance, HR, CRM, Inventory) with clean UI, responsive layouts, and AI-driven insights. The design uses a **golden theme** with a preference for **dark gold** aesthetics across light and dark modes.

---

## 🎨 Design Theme

### 🌗 Dual-Mode Support
Supports both light and dark mode. Default theme can be light, with dark mode via `dark:` Tailwind utilities.

### 🌈 Primary Colors
| Token          | Light Mode         | Dark Mode          | Notes                                      |
|----------------|--------------------|---------------------|--------------------------------------------|
| `--primary`     | `#D4AF37` (Gold)   | `#FFD700` (Bright Gold) | Used for buttons, highlights, links        |
| `--primary-hover` | `#B8860B`        | `#CFAF1A`           | Hover state for gold buttons/links         |
| `--bg`          | `#FFF8E1`         | `#121212`           | Page background                            |
| `--card`        | `#FFFFFF`         | `#1E1E1E`           | Panel/card background                      |
| `--text`        | `#333333`         | `#FFFFFF`           | Default body text                          |
| `--muted-text`  | `#555555`         | `#CCCCCC`           | Used for descriptions                      |
| `--error`       | `#E53E3E`         | `#FF6B6B`           | Validation errors, alerts                  |
| `--input-border`| `#CCCCCC`         | `#444444`           | Input and card borders                     |

---

## 🔤 Typography
- **Font**: System font stack or `Inter`, fallback `sans-serif`
- **Sizes**: Use Tailwind text sizing or arbitrary values as in Figma:
  - Headings: `text-[24px]`, `text-[20px]`, etc.
  - Body: `text-[14px]`, `text-[16px]`

---

## 📐 Layout Rules

### 🧱 Auth Pages
- **Two-panel layout** on `md+`:
  - **Left panel**: Branding ("Lachs Golden"), feature bullets, dark gold gradient
  - **Right panel**: Form section
- On mobile: panels stack vertically

### 📊 Dashboard
- Sidebar navigation (with golden active highlight)
- Main content:
  - Summary cards: white or dark bg, golden icon/title
  - Responsive grid for charts, tables

### 💻 Landing Page
- Fixed navbar
- Hero section: left intro + right dashboard mockup image
- Features, Stats, and Footer sections

---

## 🧩 Component Styling Rules

### 🔘 Buttons
- **Primary Filled**: `bg-[#D4AF37] text-white hover:bg-[#B8860B]`
- **Outline**: `border border-[#D4AF37] text-[#D4AF37] hover:bg-[#FFF3E0]`

### 🧾 Inputs & Labels
- Border: `border-[#CCCCCC]` or `dark:border-[#444444]`
- Focus: `focus:ring-2 focus:ring-[#D4AF37]`
- Rounded: `rounded-md` or `rounded-lg`

### 🗃 Cards / Panels
- White/Dark background
- Rounded corners: `rounded-lg`
- Shadow: `shadow-md`

### 🔄 Loading Spinner
```tsx
// src/components/LoadingSpinner.tsx
import { Loader2 } from 'lucide-react';
export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-4">
      <Loader2 className="h-6 w-6 animate-spin text-[#D4AF37]" />
    </div>
  );
}
```
Use inside buttons or full-screen loaders. Respect dark/light mode.

---

## ⚙️ Form Behavior
- Use **React Hook Form** + **Zod** for validation
- Use **TanStack Query** with **AxiosInstance** for API calls
- Use `useLoading()` from LoadingContext to display loading states

---

## 📦 Tech Stack Keywords for Copilot
```ts
// UI Framework: Tailwind CSS with className-based theming
// Component Kit: ShadcnUI (button, input, card, etc.)
// Icons: lucide-react (e.g., Lock, CheckCircle, Server, etc.)
// Auth: NextAuth.js (credential provider, signIn, signUp)
// API: TanStack Query + AxiosInstance
// Form: React Hook Form + Zod
// State: LoadingContext (client-only context to show spinners)
// Routing: Next.js App Router (`app/` directory)
```

---

## 🧠 Instruction for Copilot
> When generating any page or component in this ERP system, apply the dark gold theme described above. Use Tailwind `className` for all styling (no inline `style={{}}`). Ensure responsive layout, dark mode support via `dark:` classes, and use ShadcnUI and lucide-react components consistently. Respect accessibility (focus rings, aria, etc.). Match the visual style of the Figma frames/images provided.

---

## 🔁 Reuse Instruction
Whenever you generate a file, prompt Copilot with:

> "Please apply design rules from PROJECT_CONTEXT.md to this component/page."

Or, copy-paste the block:
```ts
// Apply PROJECT_CONTEXT.md styling: use dark gold (#D4AF37), responsive layout, Tailwind classNames, light/dark mode, ShadcnUI components, and lucide-react icons. Form = RHF + Zod, API = TanStack + Axios.
```

---
