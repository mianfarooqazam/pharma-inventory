'use client';

import { useState } from 'react';
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
  Eye,
  FileText,
  ShoppingCart
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';

export function RevenueProfit() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  // Mock data for revenue and profit in PKR
  const revenueData = [
    { id: '1', date: '2024-01-15', invoiceNo: 'INV-1001', customerName: 'Ali Khan', city: 'Lahore', totalBill: 37500, profit: 18750, status: 'Paid' },
    { id: '2', date: '2024-01-15', invoiceNo: 'INV-1002', customerName: 'Sara Ahmed', city: 'Karachi', totalBill: 40000, profit: 16000, status: 'Unpaid' },
    { id: '3', date: '2024-01-14', invoiceNo: 'INV-1003', customerName: 'Usman Iqbal', city: 'Rawalpindi', totalBill: 60000, profit: 30000, status: 'Paid' },
    { id: '4', date: '2024-01-14', invoiceNo: 'INV-1004', customerName: 'Ayesha Noor', city: 'Peshawar', totalBill: 51000, profit: 20400, status: 'Paid' },
    { id: '5', date: '2024-01-13', invoiceNo: 'INV-1005', customerName: 'Bilal Hussain', city: 'Lahore', totalBill: 48000, profit: 19200, status: 'Unpaid' },
  ];

  // New metrics data
  const metricsData = {
    purchaseThisYear: 1580000, // Purchases made this year
    soldThisYear: 2840000, // Sales made this year
    profitMarginThisYear: '44.4%', // Profit margin for this year
    purchaseThisMonth: 132150, // Purchases made this month
    soldThisMonth: 236500, // Sales made this month
    profitMarginThisMonth: '44.1%' // Profit margin for this month
  };


  const getGrowthIcon = (growth: string) => {
    if (growth.startsWith('+')) {
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    } else {
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    }
  };

  const filteredData = revenueData.filter(item =>
    item.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.date.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          {
            title: "Purchase This Year",
            value: `₨ ${metricsData.purchaseThisYear.toLocaleString()}`,
            icon: ShoppingCart,
            description: "Total purchases this year",
            color: "text-blue-600",
            gradient: "bg-blue-600"
          },
          {
            title: "Sold This Year",
            value: `₨ ${metricsData.soldThisYear.toLocaleString()}`,
            icon: TrendingUp,
            description: "Total sales this year",
            color: "text-green-600",
            gradient: "bg-green-600"
          },
          {
            title: "Profit Margin This Year",
            value: metricsData.profitMarginThisYear,
            icon: BarChart3,
            description: "Yearly profit margin",
            color: "text-purple-600",
            gradient: "bg-purple-600"
          },
          {
            title: "Purchase This Month",
            value: `₨ ${metricsData.purchaseThisMonth.toLocaleString()}`,
            icon: DollarSign,
            description: "Current month purchases",
            color: "text-orange-600",
            gradient: "bg-orange-600"
          },
          {
            title: "Sold This Month",
            value: `₨ ${metricsData.soldThisMonth.toLocaleString()}`,
            icon: TrendingUp,
            description: "Current month sales",
            color: "text-emerald-600",
            gradient: "bg-emerald-600"
          },
          {
            title: "Profit Margin This Month",
            value: metricsData.profitMarginThisMonth,
            icon: BarChart3,
            description: "Current month profit margin",
            color: "text-indigo-600",
            gradient: "bg-indigo-600"
          }
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.title}
              className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden relative"
            >
              {/* Background Color */}
              <div
                className={`absolute inset-0 ${stat.gradient} opacity-10 transition-all duration-300`}
              />

              {/* Icon Background */}
              <div
                className="absolute top-4 right-4 p-3 rounded-full bg-white transition-all duration-300"
              >
                <Icon className={`h-6 w-6 ${stat.color}`} />
              </div>

              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-base font-bold text-gray-700">
                  {stat.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className={`text-3xl font-bold ${stat.color} mb-2`}>
                  {stat.value}
                </div>
                <div className="flex items-center space-x-1 text-xs text-gray-600 font-medium">
                  <span>{stat.description}</span>
                </div>
              </CardContent>  
            </Card>
          );
        })}
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5" />
              <span>Revenue & Profit Analysis</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
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
                placeholder="Search invoices, customers, cities or dates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>

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
                {filteredData.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium text-gray-600">
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{item.date}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{item.invoiceNo}</TableCell>
                    <TableCell className="font-medium">{item.customerName}</TableCell>
                    <TableCell>{item.city}</TableCell>
                    <TableCell className="font-semibold text-green-600">
                      ₨ {item.totalBill.toLocaleString()}
                    </TableCell>
                    <TableCell className="font-semibold text-blue-600">
                      ₨ {item.profit.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <span className={`text-sm font-medium ${item.status === 'Paid' ? 'text-green-600' : 'text-red-600'}`}>
                        {item.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
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
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

     
    </div>
  );
}
