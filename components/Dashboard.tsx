'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  DollarSign,
  Calendar,
  Activity,
  Search,
  ShoppingCart,
  Users,
  Receipt,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Eye
} from 'lucide-react';
import { useInventory } from '@/contexts/InventoryContext';
import { useSettings } from '@/contexts/SettingsContext';
import { StockChart } from './StockChart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { QuickActions } from './QuickActions';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface DashboardProps {
  onNavigate?: (tab: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { 
    medicines, 
    batches, 
    transactions, 
    getLowStockMedicines, 
    getExpiringBatches 
  } = useInventory();
  const { settings } = useSettings();
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const [inventorySummary, setInventorySummary] = useState<{ total_medicines: number; total_units_in_stock: number; total_stock_value_selling: number; total_stock_value_cost: number } | null>(null);
  const [monthlyKpis, setMonthlyKpis] = useState<{ month_start: string; month_end: string; sold_this_month: number; purchase_this_month: number; profit_this_month: number; units_sold_this_month: number } | null>(null);

  const [monthlySalesSeries, setMonthlySalesSeries] = useState<Array<{ label: string; total: number }>>([]);

  useEffect(() => {
    const loadKpis = async () => {
      const { data: inv } = await supabase.from('v_inventory_summary').select('*').maybeSingle();
      if (inv) setInventorySummary(inv as any);
      const { data: mon } = await supabase.from('v_monthly_kpis').select('*').maybeSingle();
      if (mon) setMonthlyKpis(mon as any);
    };
    loadKpis();
  }, []);

  useEffect(() => {
    const loadMonthlySales = async () => {
      const end = new Date();
      const start = new Date(end.getFullYear(), end.getMonth() - 11, 1);
      const { data } = await supabase
        .from('invoices')
        .select('date,total')
        .gte('date', start.toISOString().slice(0,10));

      // Build last 12 month buckets
      const buckets: Array<{ key: string; label: string; total: number }> = [];
      for (let i = 11; i >= 0; i--) {
        const d = new Date(end.getFullYear(), end.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        const label = `${d.toLocaleString('en-US', { month: 'short' })}-${String(d.getFullYear()).slice(-2)}`;
        buckets.push({ key, label, total: 0 });
      }

      (data || []).forEach((row: any) => {
        const d = new Date(row.date);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        const b = buckets.find(b => b.key === key);
        if (b) b.total += Number(row.total || 0);
      });

      setMonthlySalesSeries(buckets.map(({ label, total }) => ({ label, total })));
    };
    loadMonthlySales();
  }, []);

  const getGradientClass = (title: string) => {
    switch (title) {
      case 'Total Medicines':
        return 'bg-gradient-to-br from-blue-500 to-blue-600';
      case 'Total Stock':
        return 'bg-gradient-to-br from-green-500 to-green-600';
      case 'Stock Value':
        return 'bg-gradient-to-br from-purple-500 to-purple-600';
      case 'Monthly Sales':
        return 'bg-gradient-to-br from-emerald-500 to-emerald-600';
      case 'Monthly Profit':
        return 'bg-gradient-to-br from-orange-500 to-orange-600';
      case 'Total Customers':
        return 'bg-gradient-to-br from-indigo-500 to-indigo-600';
      default:
        return 'bg-gradient-to-br from-gray-500 to-gray-600';
    }
  };

  const lowStockMedicines = getLowStockMedicines();
  const expiringBatches = getExpiringBatches(30);
  
  const totalStock = inventorySummary?.total_units_in_stock ?? medicines.reduce((sum, med) => sum + med.currentStock, 0);
  const totalValue = inventorySummary?.total_stock_value_cost ?? batches.reduce((sum, batch) => sum + (batch.quantity * batch.costPrice), 0);
  const monthlySales = monthlyKpis?.sold_this_month ?? 0;

  const stats = [
    {
      title: 'Total Medicines',
      value: (inventorySummary?.total_medicines ?? medicines.length).toString(),
      icon: Package,
      description: 'Active medicines in inventory',
      color: 'text-blue-600',
      change: '',
      changeType: 'neutral'
    },
    {
      title: 'Total Stock',
      value: totalStock.toLocaleString(),
      icon: Activity,
      description: 'Units in inventory',
      color: 'text-green-600',
      change: '',
      changeType: 'neutral'
    },
    {
      title: 'Stock Value',
      value: `PKR ${Math.round(totalValue).toLocaleString()}`,
      icon: DollarSign,
      description: 'Total inventory value (cost basis)',
      color: 'text-purple-600',
      change: '',
      changeType: 'neutral'
    },
    {
      title: 'Monthly Sales',
      value: `PKR ${Math.round(monthlySales).toLocaleString()}`,
      icon: ShoppingCart,
      description: 'Current month sales',
      color: 'text-emerald-600',
      change: '',
      changeType: 'positive'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.title}
              className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden relative"
            >
              <div
                className={`absolute inset-0 ${getGradientClass(
                  stat.title
                )} opacity-10 transition-all duration-300`}
              />

              <div
                className={`absolute top-4 right-4 p-3 rounded-full bg-white transition-all duration-300`}
              >
                <Icon className={`h-6 w-6 ${stat.color}`} />
              </div>

              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-base font-bold text-gray-700">
                  {stat.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div
                  className={`text-3xl font-bold ${stat.color} mb-2`}
                >
                  {stat.value}
                </div>
                <p className="text-xs text-gray-600 font-medium">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Monthly Sales Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-gray-700">Monthly Sales (last 12 months)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlySalesSeries}>
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" name="Sales" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Low stock and expiring batches and others remain as-is */}
    </div>
  );
}