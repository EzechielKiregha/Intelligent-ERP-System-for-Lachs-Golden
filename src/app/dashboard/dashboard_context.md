# 🗂️ Dashboard Context & Copilot Prompt Guide

## Overview
This document consolidates everything needed to build the **Dashboard** in the Intelligent ERP System, following the dark-gold theme from `PROJECT_CONTEXT.md`, but focused specifically on the dashboard. Place this file in your project (e.g., docs/DASHBOARD_CONTEXT.md) and keep it open in VSCode for Copilot context.

### Key Points
- **Dark-Gold Theme**: Sidebar gradient, gold accents, neutral backgrounds. Avoid blues except for status badges when semantically needed.
- **Tailwind Utility Classes Only**: No custom tailwind.config.js settings; use built-in utilities and arbitrary values in brackets for exact dimensions.
- **Responsive & Accessible**: Mobile-first design, proper ARIA roles, focus rings, semantic HTML.
- **ShadcnUI or Plain Elements**: Use ShadcnUI components if available; otherwise, build with `<div>`, `<button>`, etc., styled via Tailwind classes.
- **Data Integration**: Use `lib/axios.tsx` AxiosInstance and `@tanstack/react-query` hooks to fetch data from suggested endpoints. Use LoadingContext for spinners.
- **Icons**: Use `lucide-react` icons colored with gold accents (`text-[#A17E25]` in light, `dark:text-[#D4AF37]` in dark).

---

## 1. Copilot Prompt Template
At the top of each dashboard component file (`/app/dashboard/_components/*.tsx`), insert this block so Copilot knows exactly what to generate:

```ts
// Intelligent ERP System Dashboard Component
// Follow DASHBOARD_CONTEXT.md and PROJECT_CONTEXT.md styling:
// - Dark-gold sidebar: gradient `bg-gradient-to-b from-[#A17E25] to-[#8C6A1A]`, text-white, full height.
// - Tailwind utility classes only, including arbitrary values for exact widths/heights.
// - Avoid blues except in status badges (e.g., stock status), use gold/neutral color palette.
// - Responsive grid layout: mobile-first, collapse sidebar on small screens.
// - Use ShadcnUI components or plain elements styled with Tailwind utilities.
// - Data fetching via AxiosInstance (from lib/axios.tsx) + TanStack Query; show skeleton/loaders from LoadingContext.
// - Icons from lucide-react, colored gold (#A17E25) in light mode and bright gold (#D4AF37) in dark.
// - Follow the layout in Dashboard.jpg exactly: sidebar, topbar, metric cards, analytics panels, activity feed, AI insights section.
// - Suggest API endpoints based on Prisma schema: /api/dashboard/stats, /api/dashboard/revenue, /api/inventory/summary, /api/activities/recent, /api/insights, /api/reports/generate.
// - Accessibility: semantic HTML (nav, main, header, section), ARIA roles (aria-current for active nav), focus rings (`focus:ring-2 focus:ring-offset-2 focus:ring-[#A17E25]` / `dark:focus:ring-[#D4AF37]`).
```

Keep this snippet at the top before imports. Having this and `DASHBOARD_CONTEXT.md` open helps Copilot generate accurate code.

---

## 2. Suggested Folder & File Structure
```
/app/dashboard
  ├─ layout.tsx             # Wraps Dashboard pages (Sidebar + Topbar + content)
  ├─ page.tsx               # Renders the main Dashboard overview using components
  └─ _components/
       ├─ Sidebar.tsx
       ├─ Topbar.tsx
       ├─ MetricCards.tsx
       ├─ RevenueAnalytics.tsx
       ├─ SalesDistribution.tsx
       ├─ ActivityFeed.tsx
       ├─ AIInsights.tsx
       ├─ GenerateReportButton.tsx
       ├─ SkeletonLoader.tsx
       └─ StatusBadge.tsx
```

- **layout.tsx**: Client component that renders `<Sidebar />`, `<Topbar />`, and a `<main>` wrapper for child routes.
- **page.tsx**: Uses Query hooks to fetch data for metrics, analytics, activities, insights, then composes the UI.
- **_components**: Each component file starts with the Copilot prompt.
- **hooks**: In `/lib/hooks` or similar, define custom hooks: `useDashboardStats()`, `useRevenueAnalytics()`, `useInventorySummary()`, `useRecentActivities()`, `useAIInsights()`, `useGenerateReport()`.

---

## 3. Detailed Component Guidance

### 3.1 Sidebar.tsx
**Purpose**: Vertical navigation on the left for Dashboard sections.

**Visual**:
- Full viewport height (`h-screen`), width `w-64` on desktop.
- Background: dark-gold gradient: `bg-gradient-to-b from-[#A17E25] to-[#8C6A1A]` in light mode; in dark mode, you may use same or `dark:bg-gradient-to-b dark:from-[#8C6A1A] dark:to-[#A17E25]` or a near-black with gold accent highlights.
- Text: `text-white` for labels and icons.
- Logo/Title at top: `Lachs Golden ERP` with `text-[20px] font-bold` and optional smaller subtitle `ERP System` in muted white (`text-white/80`).

**Layout**:
- Use `<nav aria-label="Sidebar" className="flex flex-col justify-between h-screen py-6 px-4">`.
- Top section: logo/title.
- Middle navigation links: list of items: Dashboard, Finance, Inventory, HR, CRM.
  - Each link: `<a>` or `<Link>` with classes:
    - Default: `flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A17E25]`.
    - Active (current): `bg-white/20` or `bg-[#FFFFFF]/20` with `aria-current="page"`.
    - Text: `text-white`, icon: lucide icon with `className="w-5 h-5"`.
- Bottom: optional logout or settings link.

**Responsive**:
- On small screens: hide sidebar by default (`hidden lg:flex`). Implement a hamburger toggle in `Topbar` to show sidebar as overlay: `<div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden">` and slide-in panel `w-64 bg-gradient-to-b ...`.

---

### 3.2 Topbar.tsx
**Purpose**: Header on top of main area: page title, subtitle, user avatar, notifications.

**Visual**:
- Height: `h-16` or `h-14` (56px). Background: `bg-white dark:bg-[#1E293B]`, bottom border: `border-b border-gray-200 dark:border-[#374151]`.
- Left: title text: `Intelligent ERP Dashboard` with `text-2xl font-bold text-gray-800 dark:text-gray-200`.
- Subtitle: `text-sm text-gray-500 dark:text-gray-400` below or next to title.
- Right: icon button for notifications (bell icon), user avatar with dropdown.

**Layout**:
- `<header className="flex items-center justify-between px-6 h-16 bg-white dark:bg-[#1E293B] border-b border-gray-200 dark:border-[#374151]">`.
- Left: `<div>` with title and subtitle stacked or inline depending on space.
- Right: `<div className="flex items-center space-x-4">`:
  - Notification button: `<button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#374151] focus:ring-2 focus:ring-offset-2 focus:ring-[#A17E25] dark:focus:ring-[#D4AF37]"> <BellIcon className="w-5 h-5 text-gray-800 dark:text-gray-200" /></button>`.
  - Avatar: `<Menu>` or custom dropdown using ShadcnUI `DropdownMenu`:
    - Avatar circle with user initials or image: `<img src={user.image} alt="User avatar" className="w-8 h-8 rounded-full" />`.
    - Dropdown list: Profile, Settings, Logout.

**Responsive**:
- On narrow screens: collapse title to smaller text, use icons for toggling sidebar.
- Include sidebar toggle: `<button>` with hamburger icon visible when sidebar is hidden (`lg:hidden`).

---

### 3.3 MetricCards.tsx
**Purpose**: Display key metrics in cards (Total Revenue, New Orders, Total Customers, Inventory Status).

**Props**:
```ts
interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  delta?: string;            // e.g. "+24%", "-3%"
  deltaType?: 'increase' | 'decrease';
  subtitle?: string;         // e.g. "vs last month", "Active orders"
}
```

**Visual**:
- Card background: `bg-white dark:bg-[#1E293B] rounded-lg shadow p-4 flex items-center justify-between`.
- Left: icon in a small circle background: `<div className="p-2 bg-[#FEF3C7] dark:bg-[#3E3E3E] rounded-full">{icon}</div>`. Use subtle background for icon container.
- Center-left: title & value:
  - Title: `text-sm font-medium text-gray-500 dark:text-gray-400`
  - Value: `text-xl font-bold text-gray-800 dark:text-gray-200`
- Right: delta badge:
  - If increase: `text-green-500` and up arrow icon; if decrease: `text-red-500` and down arrow.
  - Use lucide icons: `ArrowUp` or `ArrowDown` with matching color.
  - Subtitle below delta or under value: `text-xs text-gray-500 dark:text-gray-400`.

**Layout**:
- Use flex: `<div className="flex items-center space-x-4">`.
- For delta badge: `<div className="flex items-center text-green-500"> <ArrowUp className="w-4 h-4" /> <span className="ml-1 text-sm">+24%</span> </div>`.
- For subtitle: place below value: wrap value & subtitle in a `<div>`.

**Responsive**:
- Grid container in page: `<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">`.

---

### 3.4 RevenueAnalytics.tsx
**Purpose**: Show revenue by quarter or time range with percent changes.

**Data**: From hook `useRevenueAnalytics()` returning:
```ts
interface RevenueQuarter {
  quarter: string;   // "Q1 2025"
  revenue: number;   // e.g. 580000
  changePercent: number; // +15, -3
}
```

**Visual**:
- Card wrapper: `bg-white dark:bg-[#1E293B] rounded-lg shadow p-4`.
- Header: `<div className="flex justify-between items-center mb-4"> <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Revenue Analytics</h3> <SelectDropdown options={["Last 7 days", "Last 30 days", "Last quarter"]} /></div>`.
- List: vertical stack: for each quarter:
  - Row container: `flex justify-between items-center py-2`.
  - Left: `<div>` with quarter label: `text-sm text-gray-500 dark:text-gray-400`, below revenue: `text-base font-medium text-gray-800 dark:text-gray-200`.
  - Right: percent change badge: `<span className={change>0? 'text-green-500':'text-red-500'}>{change > 0 ? `+${change}%` : `${change}%`}</span>`.
- Optionally: small chart placeholder or sparkline (later integration).

**Responsive**:
- In grid: `<div className="col-span-1 md:col-span-2 lg:col-span-1">` depending on design.
- Use flex-col on narrow widths.

---

### 3.5 SalesDistribution.tsx
**Purpose**: Show inventory summary: total items, low stock items, pending orders, each with status badge.

**Data**: From `useInventorySummary()` returning:
```ts
interface InventorySummary {
  totalItems: number;
  lowStock: number;
  pendingOrders: number;
}
```

**Visual**:
- Card wrapper similar to RevenueAnalytics: `bg-white dark:bg-[#1E293B] rounded-lg shadow p-4`.
- Header: `<h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Sales Distribution</h3>` and optional filter dropdown on right.
- Content: list of items:
  - Total Items: icon `<Box>` or `<Package>` icon, value and label, status text "In Stock" in green: `text-green-500`.
  - Low Stock Items: icon `<AlertTriangle>`, value, status badge "Warning" in amber: `text-amber-500`.
  - Pending Orders: icon `<Clock>`, value, status badge "Processing" in neutral or blue-like? For semantic, use `text-[#2563EB] dark:text-[#60A5FA]` only here since it's informational; but if avoiding blue entirely, use gold or gray? Suggest `text-primary` for actionable or use neutral: `text-gray-500 dark:text-gray-400`. Clarify: status color semantics: In Stock (green), Warning (amber), Processing (use neutral or gold accent `text-[#A17E25]`).
- Each row: `flex justify-between items-center py-2`.
- Badge: `<span className="text-green-500 text-sm font-medium">In Stock</span>`.

**Responsive**:
- Similar grid layout.

---

### 3.6 ActivityFeed.tsx
**Purpose**: List recent activities with icon, description, timestamp, and differing background or subtle separators.

**Data**: From `useRecentActivities()` returning array of:
```ts
interface Activity {
  id: string;
  type: 'order'|'registration'|'shipment'|...;
  message: string;            // "New order #12345 received"
  timestamp: string;          // ISO string
}
```

**Visual**:
- Container Card: `bg-white dark:bg-[#1E293B] rounded-lg shadow p-4`.
- Header: `<div className="flex justify-between items-center mb-4"><h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Recent Activities</h3><Link href="/activities" className="text-sm text-[#A17E25] hover:underline">View All</Link></div>`.
- List: `<ul className="space-y-2">`.
- Each item: `<li className="flex items-center bg-gray-50 dark:bg-[#1F2A3A] rounded-lg p-3">`.
  - Icon: choose based on `type`: e.g. order: `<CheckCircle>` for success, registration: `<UserPlus>`, shipment: `<Truck>`, styled `text-[#A17E25] dark:text-[#D4AF37]`, in container: `bg-white/30 dark:bg-white/20 p-2 rounded-full`.
  - Content: `<div className="ml-3"> <p className="text-sm text-gray-800 dark:text-gray-200">{message}</p> <p className="text-xs text-gray-500 dark:text-gray-400">{timeAgo(timestamp)}</p> </div>`.
- Helper: `timeAgo` function to display "2 hours ago".

**Responsive**:
- List width auto; items stack vertically. For many items, container scroll: `max-h-[300px] overflow-auto`.

---

### 3.7 AIInsights.tsx
**Purpose**: Display AI-driven insights cards and “Generate Report” button.

**Data**: From `useAIInsights()` returning array:
```ts
interface Insight {
  id: string;
  title: string;      // e.g., "Predictive Analytics"
  description: string; // "Revenue forecast shows 15% growth..."
  iconType: 'analytics'|'risk'|'growth';
}
```

**Visual**:
- Wrapper container: `bg-white dark:bg-[#1E293B] rounded-lg shadow p-4 mt-6` but from image it appears as a floating card overlay at bottom.
- Title: `<h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">AI-Driven Insights</h3>`.
- Cards grid: `grid grid-cols-1 md:grid-cols-3 gap-4`.
- Each insight card: `bg-[#FEF9C3] dark:bg-[#3E3E3E] rounded-lg p-4 flex items-start`:
  - Icon: based on type: predictive analytics: `<TrendingUp>`; risk: `<AlertTriangle>`; growth: `<Lightbulb>`; icons colored `text-[#A17E25] dark:text-[#D4AF37]`.
  - Content: `<div className="ml-3"> <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{title}</p> <p className="text-xs text-gray-700 dark:text-gray-300 mt-1">{description}</p> </div>`.
- Generate Report Button: right-aligned: `<Button className="mt-4 bg-[#A17E25] hover:bg-[#8C6A1A] text-white">Generate Report</Button>`.

**Positioning**:
- In the sample image, AI Insights appears overlapping bottom of main content. To replicate:
  - In layout, position a wrapper: `<div className="relative">` around main content, then `<div className="absolute bottom-0 left-0 w-full px-6 transform translate-y-1/2">` containing AIInsights card. Use `pointer-events-none` on parent and `pointer-events-auto` on card so content above remains interactive.
  - Alternatively, place AIInsights below content with sufficient margin.

**Responsive**:
- Cards stack vertically on small screens; grid on md+.

---

### 3.8 GenerateReportButton.tsx
**Purpose**: Button to trigger report generation.

**Behavior**:
- On click: call `mutate` from `useGenerateReport()` hook (POST `/api/reports/generate`).
- Show loading spinner inside: `<Loader2 className="w-4 h-4 animate-spin text-white"/>` and disable button.
- On success: show toast "Report generated" or link to download.

**Visual**:
- `<button className="bg-[#A17E25] hover:bg-[#8C6A1A] text-white rounded-lg px-4 py-2 shadow transition">Generate Report</button>`.

---

### 3.9 SkeletonLoader.tsx
**Purpose**: Show placeholders while data loads.

**Visual**:
- Use shimmer effect or simple gray blocks: for cards: `<div className="animate-pulse bg-gray-200 dark:bg-[#374151] rounded-lg h-24"/>`.
- For list items: `<div className="animate-pulse bg-gray-200 dark:bg-[#374151] h-12 rounded-lg mb-2"/>`.

**Usage**:
- In page.tsx, when `isLoading`, render skeleton components in place of real data.

---

### 3.10 StatusBadge.tsx
**Purpose**: Reusable badge for statuses.

**Props**:
```ts
interface StatusBadgeProps {
  label: string;
  variant: 'success'|'warning'|'processing'|'normal';
}
```

**Visual**:
- success: `text-green-500 bg-green-100 dark:bg-green-900/30`;
- warning: `text-amber-500 bg-amber-100 dark:bg-amber-900/30`;
- processing: choose neutral/gold: `text-[#A17E25] bg-[#FEF3C7] dark:bg-[#3E3E3E]`;
- normal: `text-gray-500 bg-gray-100 dark:bg-[#374151]`.
- Classes: `inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium`.

**Usage**:
- In SalesDistribution and MetricCards if needed.

---

## 4. API Endpoints & React Query Hooks
Define hooks in `/lib/hooks/dashboard.ts` or similar.

### 4.1 AxiosInstance
Make sure `lib/axios.tsx` exports:
```ts
import axios from 'axios';
const AxiosInstance = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_BASE || '', headers: { 'Content-Type': 'application/json' } });
export default AxiosInstance;
```

### 4.2 Prisma-derived Endpoints
Based on your Prisma schema for revenue, orders, customers, inventory, activities, insights:
- `GET /api/dashboard/stats`:
  - Returns: `{ totalRevenue: number; revenueChange: number; newOrders: number; newOrdersChange: number; totalCustomers: number; customerChange: number; inventoryStatus: { percentage: number; status: string; } }`
- `GET /api/dashboard/revenue?range=last7days`:
  - Returns array of `{ quarter: string; revenue: number; changePercent: number; }` or time-series data.
- `GET /api/inventory/summary`:
  - Returns `{ totalItems: number; lowStock: number; pendingOrders: number; }`.
- `GET /api/activities/recent`:
  - Returns array of `{ id, type, message, timestamp }` sorted by timestamp desc.
- `GET /api/insights`:
  - Returns array of `{ id, title, description, iconType }` (from AI service or mock).
- `POST /api/reports/generate`:
  - Body: filters or date range; Returns: `{ reportUrl: string }` or triggers email. Use AxiosInstance.

### 4.3 React Query Hooks
Example in `/lib/hooks/dashboard.ts`:
```ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AxiosInstance from '@/lib/axios';

export function useDashboardStats() {
  return useQuery(['dashboard', 'stats'], async () => {
    const { data } = await AxiosInstance.get('/api/dashboard/stats');
    return data;
  });
}

export function useRevenueAnalytics(range: string) {
  return useQuery(['dashboard', 'revenue', range], async () => {
    const { data } = await AxiosInstance.get(`/api/dashboard/revenue?range=${range}`);
    return data;
  });
}

export function useInventorySummary() {
  return useQuery(['inventory', 'summary'], async () => {
    const { data } = await AxiosInstance.get('/api/inventory/summary');
    return data;
  });
}

export function useRecentActivities() {
  return useQuery(['activities', 'recent'], async () => {
    const { data } = await AxiosInstance.get('/api/activities/recent');
    return data;
  });
}

export function useAIInsights() {
  return useQuery(['insights'], async () => {
    const { data } = await AxiosInstance.get('/api/insights');
    return data;
  });
}

export function useGenerateReport() {
  const queryClient = useQueryClient();
  return useMutation(async (params: any) => {
    const { data } = await AxiosInstance.post('/api/reports/generate', params);
    return data;
  }, {
    onSuccess: (data) => {
      // Optionally: invalidate or refetch queries
    }
  });
}
```

In components, use these hooks for data and loading states.

---

## 5. Page Implementation (page.tsx)
In `/app/dashboard/page.tsx`:
```tsx
'use client';
import React from 'react';
import { useDashboardStats, useRevenueAnalytics, useInventorySummary, useRecentActivities, useAIInsights } from '@/lib/hooks/dashboard';
import Sidebar from './_components/Sidebar';
import Topbar from './_components/Topbar';
import MetricCards from './_components/MetricCards';
import RevenueAnalytics from './_components/RevenueAnalytics';
import SalesDistribution from './_components/SalesDistribution';
import ActivityFeed from './_components/ActivityFeed';
import AIInsights from './_components/AIInsights';
import { LoadingOverlay } from '@/components/LoadingOverlay';

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const [range, setRange] = React.useState('last7days');
  const { data: revenueData, isLoading: revenueLoading } = useRevenueAnalytics(range);
  const { data: inventoryData, isLoading: inventoryLoading } = useInventorySummary();
  const { data: activitiesData, isLoading: activitiesLoading } = useRecentActivities();
  const { data: insightsData, isLoading: insightsLoading } = useAIInsights();

  const loading = statsLoading || revenueLoading || inventoryLoading || activitiesLoading || insightsLoading;

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 overflow-auto bg-white dark:bg-[#111827] p-6 pt-4">
          {loading && <LoadingOverlay />}
          {/* Metric Cards */}
          {!statsLoading && stats && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <MetricCards
                icon={<DollarSign className="w-6 h-6 text-[#A17E25] dark:text-[#D4AF37]" />}
                title="Total Revenue"
                value={`$${stats.totalRevenue.toLocaleString()}`}
                delta={`${stats.revenueChange > 0 ? '+' : ''}${stats.revenueChange}%`}
                deltaType={stats.revenueChange >= 0 ? 'increase' : 'decrease'}
                subtitle="vs last month"
              />
              {/* Similarly for New Orders, Total Customers, Inventory Status */}
            </div>
          )}

          {/* Revenue Analytics & Sales Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {!revenueLoading && revenueData && (
              <RevenueAnalytics data={revenueData} range={range} onRangeChange={setRange} />
            )}
            {!inventoryLoading && inventoryData && (
              <SalesDistribution data={inventoryData} />
            )}
          </div>

          {/* Recent Activities */}
          {!activitiesLoading && activitiesData && (
            <ActivityFeed activities={activitiesData} />
          )}

          {/* AI Insights Section */}
          {!insightsLoading && insightsData && (
            <AIInsights insights={insightsData} />
          )}
        </main>
      </div>
    </div>
  );
}
```
- Wrap with appropriate LoadingOverlay to cover only main content when loading.
- Use `flex` and `overflow-auto` for scrolling content under fixed sidebar and topbar.

---

## 6. Responsive Behavior
- **Sidebar**: hidden on `sm`/`md`, toggle via Topbar button; on screens `lg:` show permanently.
- **Grid**: Use `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` for metric cards; other panels use similar breakpoints.
- **Spacing**: `p-4` or `p-6` with adjustments for small screens.

---

## 7. Accessibility
- **Sidebar**: `<nav aria-label="Sidebar">`; links have `aria-current="page"` when active.
- **Topbar**: `<header>` semantics; buttons have `aria-label`.
- **Cards & Sections**: `<section aria-labelledby>` if needed.
- **Focus**: ensure `focus:ring-2 focus:ring-offset-2 focus:ring-[#A17E25] dark:focus:ring-[#D4AF37]` on interactive elements.
- **Contrast**: verify text vs. background meets WCAG.

---

## 8. Improvements & Enhancements
- **Skeleton Loaders**: Show skeleton while each section loads instead of full overlay.
- **Animated Counters**: Use `react-countup` for metric values.
- **Charts Integration**: Add chart components (e.g., Recharts) for revenue trends.
- **Filter Controls**: Date pickers for analytics range.
- **Real-time Updates**: Use WebSockets or polling for live metrics.
- **Role-Based Views**: Conditionally render sections based on user role.
- **Localization**: Support multiple languages via `next-i18next`.
- **Dark-Gold Variants**: Adjust sidebar gradient for dark mode (e.g., darker base).
- **Testing**: Write unit tests for components and integration tests for data fetching.

---

## 9. Putting It All Together
1. **Keep DASHBOARD_CONTEXT.md open** for Copilot and developer reference.
2. **Create components** in `/app/dashboard/_components`, each starting with the Copilot prompt snippet above.
3. **Implement hooks** in `/lib/hooks/dashboard.ts` as shown.
4. **Implement `layout.tsx`** to wrap children with sidebar and topbar.
5. **Implement `page.tsx`** to compose the dashboard overview.
6. **Test responsiveness** by resizing viewport; ensure sidebar toggles correctly.
7. **Use LoadingContext** to display spinners or skeletons.
8. **Deploy and iterate**: refine styles, data, and performance.

With this single `DASHBOARD_CONTEXT.md` file, your Copilot and development environment have all the necessary instructions—component responsibilities, styling rules, data endpoints, hooks, responsive patterns, and enhancements—to build an incredible, dark-gold–themed dashboard matching the shared design image.

---

*End of DASHBOARD_CONTEXT.md*
