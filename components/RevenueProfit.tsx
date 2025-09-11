'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Calendar,
  Download,
  Filter,
  Search,
  Plus,
  FileText,
  ShoppingCart
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { supabase } from '@/lib/supabase';

export function RevenueProfit() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { toast } = useToast();

  const [revProfit, setRevProfit] = useState<{ revenue: number; cost_of_goods_sold: number; profit: number } | null>(null);
  const [monthly, setMonthly] = useState<{ sold_this_month: number; purchase_this_month: number; profit_this_month: number } | null>(null);
  const [yearly, setYearly] = useState<{ sold_this_year: number; purchase_this_year: number; profit_this_year: number } | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data: rp } = await supabase.from('v_revenue_profit').select('*').maybeSingle();
      const { data: m } = await supabase.from('v_monthly_kpis').select('*').maybeSingle();
      const { data: y } = await supabase.from('v_yearly_kpis').select('*').maybeSingle();
      setRevProfit((rp as any) || { revenue: 0, cost_of_goods_sold: 0, profit: 0 });
      setMonthly((m as any) || { sold_this_month: 0, purchase_this_month: 0, profit_this_month: 0 });
      setYearly((y as any) || { sold_this_year: 0, purchase_this_year: 0, profit_this_year: 0 });
      setLoading(false);
    };
    load();
  }, []);

  const metricsData = {
    purchaseThisYear: Math.round(yearly?.purchase_this_year ?? 0),
    soldThisYear: Math.round(yearly?.sold_this_year ?? 0),
    profitMarginThisYear: yearly && yearly.sold_this_year > 0 ? `${Math.round(((yearly.profit_this_year ?? 0) / yearly.sold_this_year) * 100)}%` : '0%',
    purchaseThisMonth: Math.round(monthly?.purchase_this_month ?? 0),
    soldThisMonth: Math.round(monthly?.sold_this_month ?? 0),
    profitMarginThisMonth: monthly && monthly.sold_this_month > 0 ? `${Math.round(((monthly.profit_this_month ?? 0) / monthly.sold_this_month) * 100)}%` : '0%'
  };

  const revenueData: any[] = [];

  const filteredData = revenueData.filter(item => {
    const matchesSearch = item.invoiceNo?.toLowerCase?.().includes(searchTerm.toLowerCase()) ||
      item.customerName?.toLowerCase?.().includes(searchTerm.toLowerCase()) ||
      item.city?.toLowerCase?.().includes(searchTerm.toLowerCase()) ||
      item.date?.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || item.status?.toLowerCase?.() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Headline KPIs */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          {
            title: "Revenue (All Time)",
            value: `₨ ${Math.round(revProfit?.revenue ?? 0).toLocaleString()}`,
            icon: TrendingUp,
            color: "text-emerald-600",
            gradient: "bg-emerald-600"
          },
          {
            title: "COGS (All Time)",
            value: `₨ ${Math.round(revProfit?.cost_of_goods_sold ?? 0).toLocaleString()}`,
            icon: DollarSign,
            color: "text-blue-600",
            gradient: "bg-blue-600"
          },
          {
            title: "Profit (All Time)",
            value: `₨ ${Math.round(revProfit?.profit ?? 0).toLocaleString()}`,
            icon: BarChart3,
            color: "text-purple-600",
            gradient: "bg-purple-600"
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.title}
              className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden relative"
            >
              <div className={`absolute inset-0 ${stat.gradient} opacity-10`} />
              <div className="absolute top-4 right-4 p-3 rounded-full bg-white">
                <Icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <CardHeader className="pb-2 relative z-10">
                <CardTitle className="text-base font-bold text-gray-700">{stat.title}</CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div> */}

      {/* Monthly/Yearly KPI Cards */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          {
            title: "Purchase This Month",
            value: `₨ ${metricsData.purchaseThisMonth.toLocaleString()}`,
            icon: DollarSign,
            color: "text-orange-600",
            gradient: "bg-orange-600"
          },
          {
            title: "Sold This Month",
            value: `₨ ${metricsData.soldThisMonth.toLocaleString()}`,
            icon: TrendingUp,
            color: "text-emerald-600",
            gradient: "bg-emerald-600"
          },
          {
            title: "Profit This Month",
            value: `₨ ${Math.round(monthly?.profit_this_month ?? 0).toLocaleString()}`,
            icon: BarChart3,
            color: "text-indigo-600",
            gradient: "bg-indigo-600"
          },
          {
            title: "Purchase This Year",
            value: `₨ ${metricsData.purchaseThisYear.toLocaleString()}`,
            icon: ShoppingCart,
            color: "text-blue-600",
            gradient: "bg-blue-600"
          },
          {
            title: "Sold This Year",
            value: `₨ ${metricsData.soldThisYear.toLocaleString()}`,
            icon: TrendingUp,
            color: "text-green-600",
            gradient: "bg-green-600"
          },
          {
            title: "Profit This Year",
            value: `₨ ${Math.round(yearly?.profit_this_year ?? 0).toLocaleString()}`,
            icon: BarChart3,
            color: "text-purple-600",
            gradient: "bg-purple-600"
          }
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden relative">
              <div className={`absolute inset-0 ${stat.gradient} opacity-10`} />
              <div className="absolute top-4 right-4 p-3 rounded-full bg-white"><Icon className={`h-6 w-6 ${stat.color}`} /></div>
              <CardHeader className="pb-2 relative z-10"><CardTitle className="text-base font-bold text-gray-700">{stat.title}</CardTitle></CardHeader>
              <CardContent className="relative z-10">
                <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div> */}

      {/* Controls (kept for future detail table wiring) */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5" />
              <span>Revenue & Profit Analysis</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button 
                variant={statusFilter === 'all' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setStatusFilter('all')}
                className={statusFilter === 'all' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'border-blue-600 text-blue-600 hover:bg-blue-50'}
              >
                All
              </Button>
              <Button 
                variant={statusFilter === 'paid' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setStatusFilter('paid')}
                className={statusFilter === 'paid' ? 'bg-green-600 hover:bg-green-700 text-white' : 'border-green-600 text-green-600 hover:bg-green-50'}
              >
                Paid
              </Button>
              <Button 
                variant={statusFilter === 'unpaid' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setStatusFilter('unpaid')}
                className={statusFilter === 'unpaid' ? 'bg-red-600 hover:bg-red-700 text-white' : 'border-red-600 text-red-600 hover:bg-red-50'}
              >
                Unpaid
              </Button>
              <Button variant="outline" size="sm" disabled>
                <FileText className="h-4 w-4 mr-2" />
                Report
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Placeholder table for future per-invoice analysis */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sr. No</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Invoice No</TableHead>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Total Bill</TableHead>
                  <TableHead>Profit</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow><TableCell colSpan={9} className="text-center text-gray-500 py-6">No data</TableCell></TableRow>
                ) : (
                  filteredData.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium text-gray-600">{index + 1}</TableCell>
                      <TableCell><div className="flex items-center space-x-2"><Calendar className="h-4 w-4 text-gray-400" /><span className="text-sm">{item.date}</span></div></TableCell>
                      <TableCell className="font-medium">{item.invoiceNo}</TableCell>
                      <TableCell className="font-medium">{item.customerName}</TableCell>
                      <TableCell>{item.city}</TableCell>
                      <TableCell className="font-semibold ">₨ {item.totalBill.toLocaleString()}</TableCell>
                      <TableCell className={`font-semibold ${item.status === 'Paid' ? 'text-green-600' : 'text-red-600'}`}>₨ {item.profit.toLocaleString()}</TableCell>
                      <TableCell><span className={`text-sm font-medium ${item.status === 'Paid' ? 'text-green-600' : 'text-red-600'}`}>{item.status}</span></TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}