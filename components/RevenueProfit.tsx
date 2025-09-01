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
  FileText
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function RevenueProfit() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data for revenue and profit in PKR
  const revenueData = [
    { id: '1', date: '2024-01-15', medicine: 'Paracetamol 500mg', quantity: 150, unitPrice: 250, totalRevenue: 37500, cost: 18750, profit: 18750, margin: '50%' },
    { id: '2', date: '2024-01-15', medicine: 'Amoxicillin 250mg', quantity: 80, unitPrice: 500, totalRevenue: 40000, cost: 24000, profit: 16000, margin: '40%' },
    { id: '3', date: '2024-01-14', medicine: 'Ibuprofen 400mg', quantity: 200, unitPrice: 300, totalRevenue: 60000, cost: 30000, profit: 30000, margin: '50%' },
    { id: '4', date: '2024-01-14', medicine: 'Omeprazole 20mg', quantity: 60, unitPrice: 850, totalRevenue: 51000, cost: 30600, profit: 20400, margin: '40%' },
    { id: '5', date: '2024-01-13', medicine: 'Metformin 500mg', quantity: 120, unitPrice: 400, totalRevenue: 48000, cost: 28800, profit: 19200, margin: '40%' },
  ];

  const summaryData = {
    totalRevenue: 236500,
    totalCost: 132150,
    totalProfit: 104350,
    profitMargin: '44.1%',
    revenueGrowth: '+12.5%',
    profitGrowth: '+8.3%'
  };

  const getProfitBadge = (margin: string) => {
    const marginValue = parseFloat(margin.replace('%', ''));
    if (marginValue >= 50) {
      return <Badge variant="default" className="bg-green-100 text-green-800">High</Badge>;
    } else if (marginValue >= 30) {
      return <Badge variant="default" className="bg-blue-100 text-blue-800">Medium</Badge>;
    } else {
      return <Badge variant="secondary">Low</Badge>;
    }
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
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₨{summaryData.totalRevenue.toLocaleString()}</div>
            <div className="flex items-center space-x-1 text-xs text-green-600">
              {getGrowthIcon(summaryData.revenueGrowth)}
              <span>{summaryData.revenueGrowth}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <BarChart3 className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₨{summaryData.totalCost.toLocaleString()}</div>
            <p className="text-xs text-gray-500">Cost of goods sold</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₨{summaryData.totalProfit.toLocaleString()}</div>
            <div className="flex items-center space-x-1 text-xs text-blue-600">
              {getGrowthIcon(summaryData.profitGrowth)}
              <span>{summaryData.profitGrowth}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryData.profitMargin}</div>
            <p className="text-xs text-gray-500">Net profit margin</p>
          </CardContent>
        </Card>
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
                  <TableHead>Date</TableHead>
                  <TableHead>Medicine</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Profit</TableHead>
                  <TableHead>Margin</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{item.date}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{item.medicine}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>₨{item.unitPrice.toLocaleString()}</TableCell>
                    <TableCell className="font-semibold text-green-600">
                      ₨{item.totalRevenue.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-orange-600">
                      ₨{item.cost.toLocaleString()}
                    </TableCell>
                    <TableCell className="font-semibold text-blue-600">
                      ₨{item.profit.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {getProfitBadge(item.margin)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <FileText className="h-4 w-4" />
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

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Performing Medicines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {revenueData
                .sort((a, b) => b.profit - a.profit)
                .slice(0, 5)
                .map((item, index) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      <span className="text-sm font-medium">{item.medicine}</span>
                    </div>
                                         <div className="text-right">
                       <div className="text-sm font-semibold text-green-600">
                         ₨{item.profit.toLocaleString()}
                       </div>
                       <div className="text-xs text-gray-500">{item.margin} margin</div>
                     </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Profit Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
                             <div className="flex items-center justify-between">
                 <span className="text-sm text-gray-600">Daily Average</span>
                 <span className="font-semibold">₨{Math.round(summaryData.totalProfit / 5).toLocaleString()}</span>
               </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Best Day</span>
                <span className="font-semibold text-green-600">Jan 14, 2024</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Profit Growth</span>
                <span className="font-semibold text-blue-600">{summaryData.profitGrowth}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Revenue Growth</span>
                <span className="font-semibold text-green-600">{summaryData.revenueGrowth}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
