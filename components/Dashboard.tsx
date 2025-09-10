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
import { useState } from 'react';
import { formatDate } from '@/lib/utils';

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

  // Helper functions for card styling
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
  
  // Calculate comprehensive statistics
  const totalStock = medicines.reduce((sum, med) => sum + med.currentStock, 0);
  const totalValue = batches.reduce((sum, batch) => sum + (batch.quantity * batch.sellingPrice), 0);
  
  // Sales and profit calculations
  const salesTransactions = transactions.filter(t => t.type === 'sale');
  const purchaseTransactions = transactions.filter(t => t.type === 'purchase');
  const returnTransactions = transactions.filter(t => t.type === 'return');
  
  const totalSales = salesTransactions.reduce((sum, t) => sum + t.totalAmount, 0);
  const totalPurchases = purchaseTransactions.reduce((sum, t) => sum + t.totalAmount, 0);
  const totalReturns = returnTransactions.reduce((sum, t) => sum + t.totalAmount, 0);
  
  const totalCost = salesTransactions.reduce((sum, t) => {
    const batch = batches.find(b => b.id === t.batchId);
    return sum + (batch ? batch.costPrice * t.quantity : 0);
  }, 0);
  const profit = totalSales - totalCost;
  
  // Monthly calculations (current month)
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  const monthlySales = salesTransactions.filter(t => {
    const transactionDate = new Date(t.createdAt || new Date());
    return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
  }).reduce((sum, t) => sum + t.totalAmount, 0);
  
  const monthlyPurchases = purchaseTransactions.filter(t => {
    const transactionDate = new Date(t.createdAt || new Date());
    return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
  }).reduce((sum, t) => sum + t.totalAmount, 0);
  
  const monthlyProfit = monthlySales - (monthlyPurchases * 0.7); // Assuming 30% margin
  
  // Recent sales (last 10 sales)
  const recentSales = salesTransactions
    .sort((a, b) => new Date(b.createdAt || new Date()).getTime() - new Date(a.createdAt || new Date()).getTime())
    .slice(0, 10);
  
  // Get unique customers from sales
  const uniqueCustomers = new Set(salesTransactions.map(t => t.notes?.split(' - ')[0] || 'Unknown')).size;
  
  // Get current month name
  const currentMonthName = currentDate.toLocaleString('default', { month: 'long' });
  
  // Generate month sales comparison data (last 6 months)
  const generateMonthSalesData = () => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthName = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear();
      
      const monthSales = salesTransactions.filter(t => {
        const transactionDate = new Date(t.createdAt || new Date());
        return transactionDate.getMonth() === date.getMonth() && 
               transactionDate.getFullYear() === date.getFullYear();
      }).reduce((sum, t) => sum + t.totalAmount, 0);
      
      months.push({
        month: monthName,
        year: year.toString(),
        sales: monthSales,
        fullMonth: `${monthName} ${year}`
      });
    }
    return months;
  };
  
  const monthSalesData = generateMonthSalesData();

  const stats = [
    {
      title: 'Total Medicines',
      value: medicines.length.toString(),
      icon: Package,
      description: 'Active medicines in inventory',
      color: 'text-blue-600',
      change: '+2 this month',
      changeType: 'positive'
    },
    {
      title: 'Total Stock',
      value: totalStock.toLocaleString(),
      icon: Activity,
      description: 'Units in inventory',
      color: 'text-green-600',
      change: `${((totalStock / medicines.length) || 0).toFixed(1)} avg per medicine`,
      changeType: 'neutral'
    },
    {
      title: 'Stock Value',
      value: `PKR ${totalValue.toLocaleString()}`,
      icon: DollarSign,
      description: 'Total inventory value',
      color: 'text-purple-600',
      change: 'Based on selling prices',
      changeType: 'neutral'
    },
    {
      title: 'Monthly Sales',
      value: `PKR ${monthlySales.toLocaleString()}`,
      icon: ShoppingCart,
      description: `${currentMonthName} sales`,
      color: 'text-emerald-600',
      change: `${salesTransactions.length} transactions`,
      changeType: 'positive'
    },
    {
      title: 'Monthly Profit',
      value: `PKR ${monthlyProfit.toLocaleString()}`,
      icon: TrendingUp,
      description: `${currentMonthName} profit`,
      color: monthlyProfit >= 0 ? 'text-green-600' : 'text-red-600',
      change: `${((monthlyProfit / monthlySales) * 100 || 0).toFixed(1)}% margin`,
      changeType: monthlyProfit >= 0 ? 'positive' : 'negative'
    },
    {
      title: 'Total Customers',
      value: uniqueCustomers.toString(),
      icon: Users,
      description: 'Unique customers served',
      color: 'text-indigo-600',
      change: 'Active customers',
      changeType: 'positive'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome to {settings.companyName}</h1>
            <p className="text-blue-100 mt-1">Here's what's happening with your pharmacy today</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-100">Today's Date</p>
            <p className="text-lg font-semibold">{formatDate(new Date())}</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden relative border-0">
              {/* Background Gradient */}
              <div className={`absolute inset-0 ${getGradientClass(stat.title)} opacity-5`} />
              
              {/* Icon Background */}
              <div className={`absolute top-3 right-3 p-2 rounded-lg bg-white shadow-sm`}>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              
              <CardHeader className="pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10 pt-0">
                <div className={`text-2xl font-bold ${stat.color} mb-1`}>
                  {stat.value}
                </div>
                <p className="text-xs text-gray-500 mb-2">
                  {stat.description}
                </p>
                <div className="flex items-center text-xs">
                  {stat.changeType === 'positive' && <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />}
                  {stat.changeType === 'negative' && <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />}
                  <span className={`text-xs ${
                    stat.changeType === 'positive' ? 'text-green-600' : 
                    stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-500'
                  }`}>
                    {stat.change}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Sales */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="h-5 w-5 text-green-500" />
                <CardTitle>Recent Sales</CardTitle>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onNavigate?.('invoices')}
                className="flex items-center space-x-1"
              >
                <Eye className="h-4 w-4" />
                <span>View All</span>
              </Button>
            </div>
            <CardDescription>
              Latest sales transactions from your pharmacy
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentSales.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-sm text-gray-500">No recent sales</p>
                <p className="text-xs text-gray-400 mt-1">Start selling to see transactions here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentSales.map((transaction, index) => {
                  const medicine = medicines.find(m => m.id === transaction.medicineId);
                  const batch = batches.find(b => b.id === transaction.batchId);
                  const customerName = transaction.notes?.split(' - ')[0] || 'Walk-in Customer';
                  const transactionDate = new Date(transaction.createdAt || new Date());
                  
                  return (
                    <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-semibold text-green-600">#{index + 1}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{medicine?.name || 'Unknown Medicine'}</p>
                          <p className="text-xs text-gray-500">
                            {customerName} • {transaction.quantity} units • {formatDate(transactionDate)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-green-600">
                          PKR {transaction.totalAmount.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {batch?.batchNumber || 'N/A'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alerts and Quick Actions */}
        <div className="space-y-6">
          {/* Low Stock Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <span>Low Stock Alerts</span>
              </CardTitle>
              <CardDescription>
                Medicines below minimum stock level
              </CardDescription>
            </CardHeader>
            <CardContent>
              {lowStockMedicines.length === 0 ? (
                <div className="text-center py-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Activity className="h-6 w-6 text-green-500" />
                  </div>
                  <p className="text-sm text-gray-500">All medicines well stocked</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {lowStockMedicines.slice(0, 4).map((medicine) => (
                    <div key={medicine.id} className="flex items-center justify-between p-2 bg-orange-50 rounded-lg">
                      <span className="text-sm font-medium">{medicine.name}</span>
                      <Badge variant="destructive" className="text-xs">
                        {medicine.currentStock} left
                      </Badge>
                    </div>
                  ))}
                  {lowStockMedicines.length > 4 && (
                    <p className="text-xs text-gray-500 text-center">
                      +{lowStockMedicines.length - 4} more items
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Expiry Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-red-500" />
                <span>Expiry Alerts</span>
              </CardTitle>
              <CardDescription>
                Medicines expiring within 30 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              {expiringBatches.length === 0 ? (
                <div className="text-center py-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Calendar className="h-6 w-6 text-green-500" />
                  </div>
                  <p className="text-sm text-gray-500">No expiring medicines</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {expiringBatches.slice(0, 4).map((batch) => (
                    <div key={batch.id} className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                      <div>
                        <span className="text-sm font-medium">{batch.medicineName}</span>
                        <p className="text-xs text-gray-500">Batch: {batch.batchNumber}</p>
                      </div>
                      <Badge variant="destructive" className="text-xs">
                        {Math.ceil((batch.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                      </Badge>
                    </div>
                  ))}
                  {expiringBatches.length > 4 && (
                    <p className="text-xs text-gray-500 text-center">
                      +{expiringBatches.length - 4} more items
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <QuickActions onNavigate={onNavigate} onSearchResults={setSearchResults} />
        </div>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5 text-blue-500" />
              <span>Search Results</span>
            </CardTitle>
            <CardDescription>
              Found {searchResults.length} medicine(s) matching your search
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.map((medicine) => (
                <div key={medicine.id} className="border bg-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-sm">{medicine.name}</h4>
                    <p className="font-semibold text-xs  bg-blue-50 px-2 py-1 rounded">{medicine.manufacturer}</p>
                  </div>
                  <p className="text-xs text-gray-600">{medicine.category}</p>
                  <div className="mt-3 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-gray-600">Current Stock:</span>
                      <span className="text-xs font-medium">{medicine.currentStock} {medicine.unit}s</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-gray-600">Selling Price:</span>
                      <span className="text-xs text-green-600 font-semibold">PKR {medicine.price.toFixed(2)}/unit</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Month Sales Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            <span>Monthly Sales Comparison</span>
          </CardTitle>
          <CardDescription>
            Sales performance over the last 6 months
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthSalesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                  axisLine={{ stroke: '#e0e0e0' }}
                  tickLine={{ stroke: '#e0e0e0' }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  axisLine={{ stroke: '#e0e0e0' }}
                  tickLine={{ stroke: '#e0e0e0' }}
                  tickFormatter={(value) => `PKR ${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  formatter={(value: number) => [`PKR ${value.toLocaleString()}`, 'Sales']}
                  labelFormatter={(label, payload) => {
                    if (payload && payload[0]) {
                      return payload[0].payload.fullMonth;
                    }
                    return label;
                  }}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar 
                  dataKey="sales" 
                  fill="#3b82f6" 
                  radius={[4, 4, 0, 0]}
                  stroke="#2563eb"
                  strokeWidth={1}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Chart Summary */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-lg font-bold text-blue-600">
                PKR {monthSalesData.reduce((sum, month) => sum + month.sales, 0).toLocaleString()}
              </div>
              <div className="text-xs text-blue-600 font-medium">Total 6 Months</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-lg font-bold text-green-600">
                PKR {Math.max(...monthSalesData.map(m => m.sales)).toLocaleString()}
              </div>
              <div className="text-xs text-green-600 font-medium">Best Month</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold text-gray-600">
                PKR {Math.round(monthSalesData.reduce((sum, month) => sum + month.sales, 0) / monthSalesData.length).toLocaleString()}
              </div>
              <div className="text-xs text-gray-600 font-medium">Average Monthly</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}