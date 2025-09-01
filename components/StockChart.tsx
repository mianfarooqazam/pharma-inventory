'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useInventory } from '@/contexts/InventoryContext';

export function StockChart() {
  const { medicines } = useInventory();

  const chartData = medicines.map(medicine => ({
    name: medicine.name.substring(0, 10) + (medicine.name.length > 10 ? '...' : ''),
    current: medicine.currentStock,
    minimum: medicine.minStockLevel,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stock Levels</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="current" fill="#3B82F6" name="Current Stock" />
            <Bar dataKey="minimum" fill="#EF4444" name="Minimum Level" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}