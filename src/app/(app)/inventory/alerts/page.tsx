import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LowStockAlerts from "../_components/LowStockAlerts";

export default function AlertsPage() {
  return (

    <div className="p-6 space-y-8">
      {/* Header Card */}
      <Card className="bg-[var(--sidebar)] text-[var(--sidebar-foreground)] border border-sidebar-border">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Low Stock Alerts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This Product Stock Alert. Use this page to visualize your company’s stock that is less than threshold alert in real-time.
          </p>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <p className="text-sm text-gray-800 dark:text-gray-300 max-w-2xl">
              Bellow are products that actually their stock has reached the set threshould, Nedd Imediate Action.
            </p>
          </div>
        </CardContent>
      </Card>
      {/* Product List */}
      <div className="p-6">
        <LowStockAlerts />
      </div>
    </div>

  )
}
