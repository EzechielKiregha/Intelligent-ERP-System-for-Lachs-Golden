# 💼 FINANCE_CONTEXT.md

## 🔰 Overview
This file contains a complete dev and Copilot guide for implementing the **Finance module** of the **Intelligent ERP System**. It continues with the same project rules defined in `PROJECT_CONTEXT.md` and `DASHBOARD_CONTEXT.md`, focusing specifically on:

- Revenue & expense tracking
- Budgeting and forecasting
- Financial reports
- Financial analytics charts
- Reusable topbar/sidebar

---

## 🎨 Design & Theme Rules (Same as Project)
- **Dark-Gold Theme**: `from-[#A17E25] to-[#8C6A1A]`, with gold highlights `[#D4AF37]` in dark mode.
- **No Blue** unless semantically required (like Processing or Informational status).
- **Tailwind Utility Only** (no custom config).
- **ShadcnUI + Lucide Icons + Axios + TanStack Query**
- Responsive first; support mobile/tablet/desktop views.

---

## 🧠 Copilot Prompt Template
Paste this at the top of every finance-related component file:

```tsx
// Intelligent ERP System: Finance Module Component
// Use FINANCE_CONTEXT.md styling and logic:
// - Tailwind utility classes only (no inline styles, no custom tailwind.config.js)
// - Finance sidebar active, gold highlight
// - AxiosInstance from lib/axios.tsx + @tanstack/react-query
// - Icons from lucide-react
// - Theme: dark-gold (light: #A17E25, dark: #D4AF37)
// - Match layout to designs in finance mockup (finance overview cards, trend charts, ledger tables, AI insights)
// - Responsive grid layout for metrics and analytics
// - Suggest Prisma-based endpoints: /api/finance/summary, /api/finance/transactions, /api/finance/forecast, /api/finance/insights
```

---

## 📁 Folder Structure

```
/app/finance
  ├─ layout.tsx                     # Wraps finance section with sidebar/topbar
  ├─ page.tsx                       # Finance Overview page
  └─ _components/
       ├─ FinanceCards.tsx
       ├─ TransactionList.tsx
       ├─ ForecastChart.tsx
       ├─ BudgetSection.tsx
       ├─ FinancialInsights.tsx
       ├─ FilterToolbar.tsx
       ├─ CategoryBreakdownChart.tsx
       └─ ExportReportButton.tsx
```

---

## 🧩 Component Descriptions

### 🔸 FinanceCards.tsx
Shows key financial metrics:
- Total Revenue
- Total Expenses
- Net Profit
- Budget Usage

**Props**:
```ts
interface FinanceCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  delta?: string;
  deltaType?: 'increase' | 'decrease';
  tooltip?: string;
}
```

Cards use `bg-white dark:bg-[#1E293B]` with `text-[#A17E25] dark:text-[#D4AF37]` values.

---

### 🔸 TransactionList.tsx
Paginated list of financial transactions:
- Columns: Date, Description, Category, Amount, Status
- Status: Paid, Pending, Overdue (use status badge component)
- Use `useFinanceTransactions()` hook for fetching

---

### 🔸 ForecastChart.tsx
Line chart showing projected revenue/expenses for the next 6–12 months
- Use `Chart.js` or `Recharts`
- Include range toggle (e.g., 6m, 12m)

---

### 🔸 BudgetSection.tsx
Budget allocation and consumption chart
- Use progress bar per category: `bg-gray-200`, `bg-[#A17E25]`, `dark:bg-[#D4AF37]`
- E.g., Marketing: 70% used, Development: 45%
- Include budget limits and remaining

---

### 🔸 FinancialInsights.tsx
Similar to AIInsights, but finance-specific:
- Predictive cost spikes
- Unusual spending patterns
- Upcoming tax deadlines

---

### 🔸 FilterToolbar.tsx
- Date range picker (month, quarter, custom)
- Category dropdown (Marketing, HR, Logistics, etc.)
- Export CSV button

---

### 🔸 ExportReportButton.tsx
Trigger download of financial summary PDF
- POST `/api/finance/export`
- Button with loading state and success toast

---

## 🔗 Suggested API Endpoints

| Route                         | Purpose                              |
|------------------------------|--------------------------------------|
| GET /api/finance/summary     | Total revenue, expenses, net profit  |
| GET /api/finance/transactions| Paginated list of transactions       |
| GET /api/finance/forecast    | Forecast data for chart              |
| GET /api/finance/budget      | Budget per category                  |
| GET /api/finance/insights    | AI-generated financial suggestions   |
| POST /api/finance/export     | Trigger PDF/CSV financial report     |

---

## ⚙️ React Query Hooks

```ts
export function useFinanceSummary() {
  return useQuery(['finance', 'summary'], async () => {
    const { data } = await AxiosInstance.get('/api/finance/summary');
    return data;
  });
}

export function useFinanceTransactions(page = 1) {
  return useQuery(['finance', 'transactions', page], async () => {
    const { data } = await AxiosInstance.get(`/api/finance/transactions?page=${page}`);
    return data;
  });
}

export function useFinanceForecast(range = '6m') {
  return useQuery(['finance', 'forecast', range], async () => {
    const { data } = await AxiosInstance.get(`/api/finance/forecast?range=${range}`);
    return data;
  });
}

export function useBudgetData() {
  return useQuery(['finance', 'budget'], async () => {
    const { data } = await AxiosInstance.get('/api/finance/budget');
    return data;
  });
}

export function useFinanceInsights() {
  return useQuery(['finance', 'insights'], async () => {
    const { data } = await AxiosInstance.get('/api/finance/insights');
    return data;
  });
}

export function useExportFinanceReport() {
  return useMutation(async (params: any) => {
    const { data } = await AxiosInstance.post('/api/finance/export', params);
    return data;
  });
}
```

---

## 📄 Page Setup
In `/app/finance/page.tsx`, compose:

```tsx
import FinanceCards from './_components/FinanceCards';
import TransactionList from './_components/TransactionList';
import ForecastChart from './_components/ForecastChart';
import BudgetSection from './_components/BudgetSection';
import FinancialInsights from './_components/FinancialInsights';

export default function FinancePage() {
  return (
    <main className="p-6 bg-white dark:bg-[#111827]">
      <FinanceCards />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-6">
        <ForecastChart />
        <BudgetSection />
      </div>
      <TransactionList />
      <FinancialInsights />
    </main>
  );
}
```

---

## ✅ Summary Checklist
- [x] Use gold theming and Tailwind utility classes
- [x] Responsive mobile-friendly grids
- [x] Reuse Sidebar and Topbar with active `Finance` state
- [x] Loaders for async content (skeletons or spinners)
- [x] Clean, semantic layout and accessible components
- [x] Use React Query and AxiosInstance
- [x] Extendable: support CSV export, filtering, and future role access

---

*End of FINANCE_CONTEXT.md*
