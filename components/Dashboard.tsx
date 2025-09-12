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
  const [totalCustomers, setTotalCustomers] = useState<number>(0);

  const [monthlySalesSeries, setMonthlySalesSeries] = useState<Array<{ label: string; total: number }>>([]);

  useEffect(() => {
    const loadKpis = async () => {
      const { data: inv } = await supabase.from('v_inventory_summary').select('*').maybeSingle();
      if (inv) setInventorySummary(inv as any);
      const { data: mon } = await supabase.from('v_monthly_kpis').select('*').maybeSingle();
      if (mon) setMonthlyKpis(mon as any);
      
      // Load total customers count
      const { count } = await supabase.from('customers').select('*', { count: 'exact', head: true });
      setTotalCustomers(count || 0);
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
      gradient: 'from-blue-500 to-blue-700',
      bgGlow: 'bg-blue-500/20',
      accent: 'bg-blue-500'
    },
    {
      title: 'Total Stock',
      value: totalStock.toLocaleString(),
      icon: Activity,
      description: 'Units in inventory',
      color: 'text-green-600',
      gradient: 'from-green-500 to-green-700',
      bgGlow: 'bg-green-500/20',
      accent: 'bg-green-500'
    },
    {
      title: 'Stock Value',
      value: `Rs. ${Math.round(totalValue).toLocaleString()}`,
      icon: DollarSign,
      description: 'Total inventory value (cost basis)',
      color: 'text-purple-600',
      gradient: 'from-purple-500 to-purple-700',
      bgGlow: 'bg-purple-500/20',
      accent: 'bg-purple-500'
    },
    {
      title: 'Monthly Sales',
      value: `Rs. ${Math.round(monthlySales).toLocaleString()}`,
      icon: ShoppingCart,
      description: 'Current month sales',
      color: 'text-emerald-600',
      gradient: 'from-emerald-500 to-emerald-700',
      bgGlow: 'bg-emerald-500/20',
      accent: 'bg-emerald-500'
    },
    {
      title: 'Total Customers',
      value: totalCustomers.toString(),
      icon: Users,
      description: 'Registered customers',
      color: 'text-indigo-600',
      gradient: 'from-indigo-500 to-indigo-700',
      bgGlow: 'bg-indigo-500/20',
      accent: 'bg-indigo-500'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card 
              key={stat.title} 
              className="group relative overflow-hidden border-0 bg-white backdrop-blur-sm hover:bg-white/80 transition-all duration-500 scale-105 hover:scale-100 shadow-2xl hover:shadow-lg aspect-square h-48 w-full"
              style={{
                animationDelay: `${index * 100}ms`,
                animation: `fadeInUp 0.6s ease-out forwards ${index * 100}ms`
              }}
            >
              {/* Animated background gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-10 group-hover:opacity-5 transition-opacity duration-500`} />
              
              {/* Glow effect */}
              <div className={`absolute -inset-1 ${stat.bgGlow} rounded-lg blur-lg opacity-30 group-hover:opacity-0 transition-opacity duration-500`} />
              
              {/* Top accent bar */}
              <div className={`absolute top-0 left-0 right-0 h-1 ${stat.accent} opacity-100 group-hover:opacity-60 transition-opacity duration-300`} />
              
              {/* Content */}
              <div className="relative z-10 h-full flex flex-col justify-between p-6">
                {/* Top: Title and Icon */}
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-gray-800 group-hover:text-gray-600 transition-colors duration-300">
                    {stat.title}
                  </CardTitle>
                  <div className="p-2 rounded-lg bg-white shadow-xl group-hover:shadow-lg transition-all duration-300 scale-110 group-hover:scale-100">
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </div>
                
                {/* Center: Amount */}
                <div className="flex-1 flex items-center justify-center">
                  <div className={`text-2xl font-bold ${stat.color} scale-105 group-hover:scale-100 transition-transform duration-300 text-center`}>
                    {stat.value}
                  </div>
                </div>
                
                {/* Bottom: Description */}
                <div className="text-left">
                  <p className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors duration-300">
                    {stat.description}
                  </p>
                </div>
              </div>

              {/* Corner decoration */}
              <div className="absolute bottom-0 right-0 w-20 h-20 opacity-10 group-hover:opacity-5 transition-opacity duration-500">
                <div className={`w-full h-full rounded-tl-full ${stat.accent}`} />
              </div>
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