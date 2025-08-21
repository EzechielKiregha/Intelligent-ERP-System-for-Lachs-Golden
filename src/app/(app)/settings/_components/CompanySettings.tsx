'use client';

import { useHRSummary } from '@/lib/hooks/hr';
import { useInventorySummaryCards } from '@/lib/hooks/inventory';
import { useContacts } from '@/lib/hooks/crm';
import { useFinanceSummaryPeriod } from '@/lib/hooks/finance';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import BasePopover from '@/components/BasePopover';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { MapPin, Mail, Building2, Users, Package, Contact, DollarSign, AlertTriangle } from 'lucide-react';
import { useUserSettings } from '../hooks/useUserSettings';
import { useCompanySettings, useUpdateCompanySetting } from '../hooks/useCompanySettings';

export default function CompanySettings() {
  const { userData } = useUserSettings();

  // 🔹 Fetch cross-module summaries
  const { data: hrSummary } = useHRSummary();
  const { data: invSummary } = useInventorySummaryCards();
  const { data: contacts = [] } = useContacts();
  const { data: finance } = useFinanceSummaryPeriod('month');
  const { data: companySettings, isLoading: settingsLoading } = useCompanySettings();

  if (!userData?.company) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          No company data available.
        </CardContent>
      </Card>
    );
  }

  const { company } = userData;

  // Derived metrics
  const totalCustomers = contacts.length;
  const lowStockItems = invSummary?.lowStockCount || 0;
  const monthlyProfit = finance ? finance.netProfit : 0;

  return (
    <Card className="bg-sidebar border-[var(--sidebar-border)] shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sidebar-foreground">
          <Building2 className="h-5 w-5" />
          Company Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* 📊 Company Health Dashboard */}
        <section>
          <h3 className="text-lg font-medium text-sidebar-foreground mb-4 flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Company Health Dashboard
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Stat
              label="Employees"
              value={hrSummary?.totalEmployees || 0}
              icon={<Users className="h-4 w-4 text-blue-500" />}
              helpText="Total active employees in the system"
            />
            <Stat
              label="Products"
              value={invSummary?.totalProducts || 0}
              icon={<Package className="h-4 w-4 text-green-400" />}
              helpText="Total inventory items tracked"
            />
            <Stat
              label="Customers"
              value={totalCustomers}
              icon={<Contact className="h-4 w-4 text-purple-700" />}
              helpText="Total CRM contacts"
            />
            <Stat
              label="Monthly Profit"
              value={`$${(monthlyProfit || 0).toLocaleString()}`}
              icon={<DollarSign className="h-4 w-4 text-emerald-400" />}
              helpText="Net profit after expenses"
            />
          </div>

          {/* Risk Alert */}
          {lowStockItems > 5 && (
            <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded flex items-center gap-2 text-sm text-orange-300">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              <span>{lowStockItems} products are below threshold. Consider restocking.</span>
            </div>
          )}
        </section>

        {/* Company Details */}
        <section>
          <h3 className="text-lg font-medium text-sidebar-foreground mb-4 flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Company Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <Label>Name</Label>
              <p className="text-sidebar-foreground mt-1 font-medium">{company.name}</p>
            </div>
            <div>
              <Label>Industry</Label>
              <p className="text-sidebar-foreground mt-1">{company.industry}</p>
            </div>
            <div>
              <Label>Founded</Label>
              <p className="text-sidebar-foreground mt-1">{format(new Date(company.foundedDate ? company.foundedDate : new Date()), 'MMM d, yyyy')}</p>
            </div>
            <div>
              <Label>Legal Name</Label>
              <p className="text-sidebar-foreground mt-1">{company.name} Inc.</p>
            </div>
          </div>
        </section>

        {/* Address */}
        <section>
          <h3 className="text-lg font-medium text-sidebar-foreground mb-4 flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Address
          </h3>
          <div className="space-y-1 text-sm text-sidebar-foreground">
            <p>{company.addressLine1 || '123 Innovation Drive'}</p>
            <p>
              {company.city || 'San Francisco'}, {company.state || 'CA'} {company.postalCode || '94107'}
            </p>
            <p>{company.country || 'United States'}</p>
          </div>
          <BasePopover title="Edit Address" buttonLabel="Edit Address" >
            <form className="space-y-4">
              <div>
                <Label>Street Address</Label>
                <Input defaultValue={company.addressLine1 || ''} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>City</Label>
                  <Input defaultValue={company.city || ''} />
                </div>
                <div>
                  <Label>State / Region</Label>
                  <Input defaultValue={company.state || ''} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Postal Code</Label>
                  <Input defaultValue={company.postalCode || ''} />
                </div>
                <div>
                  <Label>Country</Label>
                  <Input defaultValue={company.country || ''} />
                </div>
              </div>
              <Button type="submit" className="w-full">Save Address</Button>
            </form>
          </BasePopover>
        </section>

        {/* Contact Information */}
        <section>
          <h3 className="text-lg font-medium text-sidebar-foreground mb-4 flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Contact Information
          </h3>
          <div className="space-y-2 text-sm">
            <div>
              <Label>Email</Label>
              <p className="text-sidebar-foreground mt-1">{company.contactEmail || 'admin@lachsgolden.com'}</p>
            </div>
            <div>
              <Label>Phone</Label>
              <p className="text-sidebar-foreground mt-1">{company.contactPhone}</p>
            </div>
            <div>
              <Label>Website</Label>
              <p className="text-sidebar-foreground mt-1">{company.website}</p>
            </div>
          </div>
        </section>

        {/* Inventory Settings */}
        <section>
          <h3 className="text-lg font-medium text-sidebar-foreground mb-4">Inventory Settings</h3>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between items-center p-3 bg-sidebar-primary/70 rounded">
              <div>
                <Label>Default Low-Stock Threshold</Label>
                <p className="text-sidebar-foreground/70">Products below this quantity trigger alerts</p>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  defaultValue={companySettings?.lowStockThreshold || 10}
                  className="w-20 text-right"
                  onBlur={(e) => {
                    useUpdateCompanySetting().mutate({
                      key: 'lowStockThreshold',
                      value: parseInt(e.target.value),
                    });
                  }}
                />
                <span className="text-xs text-sidebar-foreground">units</span>
              </div>
            </div>
          </div>
        </section>

        {/* CRM Settings */}
        <section>
          <h3 className="text-lg font-medium text-sidebar-foreground mb-4">CRM Settings</h3>
          <div className="space-y-4 text-sm">
            <div className="p-3 bg-sidebar-primary/70 rounded">
              <Label>Customer Tagging Rules</Label>
              <p className="text-sidebar-foreground/70 mb-2">Automatically tag customers based on behavior</p>
              <Button variant="outline" size="sm">Configure Rules</Button>
            </div>
          </div>
        </section>
      </CardContent>
    </Card>
  );
}

// 🔹 Reusable Stat Component
function Stat({ label, value, icon, helpText }: { label: string; value: string | number; icon: React.ReactNode; helpText?: string }) {
  return (
    <div className="p-3 bg-sidebar-primary/70 rounded border border-sidebar-accent/30 hover:border-sidebar-accent/50 transition-colors group relative">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <Label className="text-xs uppercase tracking-wide opacity-90">{label}</Label>
      </div>
      <p className="text-lg font-semibold text-sidebar-foreground">{value}</p>
      {helpText && (
        <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-sidebar-accent text-sidebar-accent-foreground text-xs p-2 rounded shadow-lg z-10 whitespace-nowrap">
          {helpText}
        </div>
      )}
    </div>
  );
}