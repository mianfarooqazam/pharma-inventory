'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  DollarSign,
  Calendar,
  Activity
} from 'lucide-react';
import { useInventory } from '@/contexts/InventoryContext';
import { StockChart } from './StockChart';
import { QuickActions } from './QuickActions';

export function Dashboard() {
  const { 
    medicines, 
    batches, 
    transactions, 
    getLowStockMedicines, 
    getExpiringBatches 
  } = useInventory();

  const lowStockMedicines = getLowStockMedicines();
  const expiringBatches = getExpiringBatches(30);
  
  const totalStock = medicines.reduce((sum, med) => sum + med.currentStock, 0);
  const totalValue = batches.reduce((sum, batch) => sum + (batch.quantity * batch.sellingPrice), 0);
  
  const salesTransactions = transactions.filter(t => t.type === 'sale');
  const totalSales = salesTransactions.reduce((sum, t) => sum + t.totalAmount, 0);
  const totalCost = salesTransactions.reduce((sum, t) => {
    const batch = batches.find(b => b.id === t.batchId);
    return sum + (batch ? batch.costPrice * t.quantity : 0);
  }, 0);
  const profit = totalSales - totalCost;

  const stats = [
    {
      title: 'Total Medicines',
      value: medicines.length.toString(),
      icon: Package,
      description: 'Active medicines',
      color: 'text-blue-600',
    },
    {
      title: 'Total Stock',
      value: totalStock.toLocaleString(),
      icon: Activity,
      description: 'Units in inventory',
      color: 'text-green-600',
    },
    {
      title: 'Stock Value',
      value: `$${totalValue.toFixed(2)}`,
      icon: DollarSign,
      description: 'Total inventory value',
      color: 'text-purple-600',
    },
    {
      title: 'Monthly Profit',
      value: `$${profit.toFixed(2)}`,
      icon: TrendingUp,
      description: 'This month',
      color: profit >= 0 ? 'text-green-600' : 'text-red-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Alerts and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
              <p className="text-sm text-gray-500">No low stock alerts</p>
            ) : (
              <div className="space-y-2">
                {lowStockMedicines.slice(0, 5).map((medicine) => (
                  <div key={medicine.id} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{medicine.name}</span>
                    <Badge variant="destructive" className="text-xs">
                      {medicine.currentStock} left
                    </Badge>
                  </div>
                ))}
                {lowStockMedicines.length > 5 && (
                  <p className="text-xs text-gray-500">
                    +{lowStockMedicines.length - 5} more items
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
              <p className="text-sm text-gray-500">No expiring medicines</p>
            ) : (
              <div className="space-y-2">
                {expiringBatches.slice(0, 5).map((batch) => (
                  <div key={batch.id} className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium">{batch.medicineName}</span>
                      <p className="text-xs text-gray-500">Batch: {batch.batchNumber}</p>
                    </div>
                    <Badge variant="destructive" className="text-xs">
                      {Math.ceil((batch.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                    </Badge>
                  </div>
                ))}
                {expiringBatches.length > 5 && (
                  <p className="text-xs text-gray-500">
                    +{expiringBatches.length - 5} more items
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <QuickActions />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StockChart />
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Latest stock movements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transactions.slice(0, 5).map((transaction) => {
                const medicine = medicines.find(m => m.id === transaction.medicineId);
                return (
                  <div key={transaction.id} className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium">{medicine?.name}</span>
                      <p className="text-xs text-gray-500">
                        {transaction.type} • {transaction.quantity} units
                      </p>
                    </div>
                    <Badge 
                      variant={transaction.type === 'sale' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      ${transaction.totalAmount.toFixed(2)}
                    </Badge>
                  </div>
                );
              })}
              {transactions.length === 0 && (
                <p className="text-sm text-gray-500">No recent transactions</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}