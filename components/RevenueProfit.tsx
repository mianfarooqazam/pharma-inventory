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
import { Checkbox } from '@/components/ui/checkbox';
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
  const [paymentStatus, setPaymentStatus] = useState<{[key: string]: boolean}>({
    '1': true,  // Paracetamol - Paid
    '2': false, // Amoxicillin - Unpaid
    '3': true,  // Ibuprofen - Paid
    '4': true,  // Omeprazole - Paid
    '5': false, // Metformin - Unpaid
  });

  // Mock data for revenue and profit in PKR
  const revenueData = [
    { id: '1', date: '2024-01-15', medicine: 'Paracetamol 500mg', quantity: 150, unitPrice: 250, totalRevenue: 37500, cost: 18750, profit: 18750, status: 'Paid' },
    { id: '2', date: '2024-01-15', medicine: 'Amoxicillin 250mg', quantity: 80, unitPrice: 500, totalRevenue: 40000, cost: 24000, profit: 16000, status: 'Unpaid' },
    { id: '3', date: '2024-01-14', medicine: 'Ibuprofen 400mg', quantity: 200, unitPrice: 300, totalRevenue: 60000, cost: 30000, profit: 30000, status: 'Paid' },
    { id: '4', date: '2024-01-14', medicine: 'Omeprazole 20mg', quantity: 60, unitPrice: 850, totalRevenue: 51000, cost: 30600, profit: 20400, status: 'Paid' },
    { id: '5', date: '2024-01-13', medicine: 'Metformin 500mg', quantity: 120, unitPrice: 400, totalRevenue: 48000, cost: 28800, profit: 19200, status: 'Unpaid' },
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

  const handlePaymentStatusChange = (itemId: string, checked: boolean) => {
    // Find the medicine name for the toast message
    const medicine = revenueData.find(item => item.id === itemId)?.medicine || 'Transaction';
    
    // Show confirmation toast directly
    const confirmationToast = toast({
      title: "Confirm Payment Status Change",
      description: `Are you sure you want to mark "${medicine}" as ${checked ? 'Paid' : 'Unpaid'}?`,
      variant: "default",
      action: (
        <div className="flex gap-2">
          <ToastAction
            altText="Confirm"
            onClick={() => {
              // Dismiss the confirmation toast
              confirmationToast.dismiss();
              
              // Update the payment status silently
              setPaymentStatus(prev => ({
                ...prev,
                [itemId]: checked
              }));
            }}
            className="bg-green-600 text-white hover:bg-green-700"
          >
            Confirm
          </ToastAction>
          <ToastAction
            altText="Cancel"
            onClick={() => {
              // Dismiss the confirmation toast
              confirmationToast.dismiss();
            }}
            className="bg-gray-600 text-white hover:bg-gray-700"
          >
            Cancel
          </ToastAction>
        </div>
      ),
    });
  };

  const getGrowthIcon = (growth: string) => {
    if (growth.startsWith('+')) {
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    } else {
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    }
  };

  const filteredData = revenueData.filter(item =>
    item.medicine.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
                placeholder="Search medicines or dates..."
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
                  <TableHead>Medicine</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Cost</TableHead>
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
                    <TableCell className="font-medium">{item.medicine}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>₨ {item.unitPrice.toLocaleString()}</TableCell>
                    <TableCell className="font-semibold text-green-600">
                      ₨ {item.totalRevenue.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-orange-600">
                      ₨ {item.cost.toLocaleString()}
                    </TableCell>
                    <TableCell className="font-semibold text-blue-600">
                      ₨ {item.profit.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`payment-${item.id}`}
                          checked={paymentStatus[item.id] || false}
                          onCheckedChange={(checked) => handlePaymentStatusChange(item.id, checked as boolean)}
                          className={`${
                            paymentStatus[item.id] 
                              ? 'data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600' 
                              : 'data-[state=unchecked]:border-red-300'
                          }`}
                        />
                        <label 
                          htmlFor={`payment-${item.id}`}
                          className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
                            paymentStatus[item.id] ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {paymentStatus[item.id] ? 'Paid' : 'Unpaid'}
                        </label>
                      </div>
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
