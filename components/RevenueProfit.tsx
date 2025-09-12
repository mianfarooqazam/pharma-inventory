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

interface InvoiceItemRow {
  id: string;
  invoice_no: string;
  date_str: string;
  customer: string;
  city: string;
  address: string;
  amount: number;
  status: 'Paid' | 'Unpaid';
}

export function RevenueProfit() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { toast } = useToast();

  const [monthly, setMonthly] = useState<{ sold_this_month: number; purchase_this_month: number; profit_this_month: number } | null>(null);
  const [yearly, setYearly] = useState<{ sold_this_year: number; purchase_this_year: number; profit_this_year: number } | null>(null);

  const [loading, setLoading] = useState(true);

  const [invoices, setInvoices] = useState<InvoiceItemRow[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data: m } = await supabase.from('v_monthly_kpis').select('*').maybeSingle();
      const { data: y } = await supabase.from('v_yearly_kpis').select('*').maybeSingle();
      setMonthly((m as any) || { sold_this_month: 0, purchase_this_month: 0, profit_this_month: 0 });
      setYearly((y as any) || { sold_this_year: 0, purchase_this_year: 0, profit_this_year: 0 });

      const { data: invs } = await supabase
        .from('v_invoices_list')
        .select('*')
        .order('invoice_no', { ascending: false });
      setInvoices((invs || []) as any);

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

  const filteredInvoices = invoices.filter((i) => {
    const matchesText =
      i.invoice_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.date_str.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || i.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesText && matchesStatus;
  });

  const outstandingBalance = invoices
    .filter((i) => i.status === 'Unpaid')
    .reduce((sum, i) => sum + (i.amount || 0), 0);

  return (
    <div className="space-y-6 p-4">
      {/* Monthly/Yearly KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        {[
          {
            title: "Purchase This Year",
            value: `₨ ${metricsData.purchaseThisYear.toLocaleString()}`,
            description: "Total inventory purchases",
            icon: ShoppingCart,
            color: "text-blue-600",
            gradient: "from-blue-500 to-blue-700",
            bgGlow: "bg-blue-500/20",
            accent: "bg-blue-500"
          },
          {
            title: "Sold This Year",
            value: `₨ ${metricsData.soldThisYear.toLocaleString()}`,
            description: "Annual sales revenue",
            icon: TrendingUp,
            color: "text-green-600",
            gradient: "from-green-500 to-green-700",
            bgGlow: "bg-green-500/20",
            accent: "bg-green-500"
          },
          {
            title: "Profit This Year",
            value: `₨ ${Math.round(yearly?.profit_this_year ?? 0).toLocaleString()}`,
            description: "Net profit generated",
            icon: BarChart3,
            color: "text-purple-600",
            gradient: "from-purple-500 to-purple-700",
            bgGlow: "bg-purple-500/20",
            accent: "bg-purple-500"
          },
          {
            title: "Purchase This Month",
            value: `₨ ${metricsData.purchaseThisMonth.toLocaleString()}`,
            description: "Monthly procurement cost",
            icon: ShoppingCart,
            color: "text-blue-600",
            gradient: "from-blue-500 to-blue-700",
            bgGlow: "bg-blue-500/20",
            accent: "bg-blue-500"
          },
          {
            title: "Sold This Month",
            value: `₨ ${metricsData.soldThisMonth.toLocaleString()}`,
            description: "Current month sales",
            icon: TrendingUp,
            color: "text-green-600",
            gradient: "from-green-500 to-green-700",
            bgGlow: "bg-green-500/20",
            accent: "bg-green-500"
          },
          {
            title: "Profit This Month",
            value: `₨ ${Math.round(monthly?.profit_this_month ?? 0).toLocaleString()}`,
            description: "Monthly net earnings",
            icon: BarChart3,
            color: "text-purple-600",
            gradient: "from-purple-500 to-purple-700",
            bgGlow: "bg-purple-500/20",
            accent: "bg-purple-500"
          },
          {
            title: "Outstanding Balance",
            value: `₨ ${Math.round(outstandingBalance).toLocaleString()}`,
            description: "Pending customer dues",
            icon: DollarSign,
            color: "text-red-600",
            gradient: "from-red-500 to-red-700",
            bgGlow: "bg-red-500/20",
            accent: "bg-red-500"
          },
        ].map((stat, index) => {
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
                  <CardTitle className="text-lg  text-gray-800 group-hover:text-gray-600 transition-colors duration-300">
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

      {/* Controls and Invoice List (like Invoices) */}
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
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search by invoice no, customer, or date..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sr No</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Invoice No</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Total Bill</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="text-center text-gray-500 py-6">No invoices</TableCell></TableRow>
                ) : (
                  filteredInvoices.map((inv, idx) => (
                    <TableRow key={inv.id}>
                      <TableCell className="text-center font-medium">{idx + 1}</TableCell>
                      <TableCell>{inv.date_str}</TableCell>
                      <TableCell className="font-medium">{inv.invoice_no}</TableCell>
                      <TableCell>{inv.customer}</TableCell>
                      <TableCell>{inv.city}</TableCell>
                      <TableCell>₨ {inv.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <span className={`text-sm font-medium ${inv.status === 'Paid' ? 'text-green-600' : 'text-red-600'}`}>
                          {inv.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            const hash = `#invoices?customer=${encodeURIComponent(inv.customer)}`;
                            window.location.hash = hash;
                          }}
                        >
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span><FileText className="h-4 w-4" /></span>
                              </TooltipTrigger>
                              <TooltipContent>
                                view invoices
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </Button>
                      </TableCell>
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