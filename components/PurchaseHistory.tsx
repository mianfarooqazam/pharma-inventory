'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Search, 
  Package, 
  Calendar,
  Download,
  Filter,
  ShoppingCart,
  RefreshCw,
  Eye
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface PurchaseHistoryItem {
  id: string;
  transaction_date: string;
  medicine_name: string;
  category: string;
  manufacturer: string;
  strength: string;
  unit: string;
  batch_number: string;
  quantity: number;
  cost_price: number;
  selling_price: number;
  total_amount: number;
  expiry_date: string;
  transaction_type: 'purchase' | 'restock';
  notes: string;
}

export function PurchaseHistory() {
  const { user } = useAuth();
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    loadPurchaseHistory();
  }, []);

  const loadPurchaseHistory = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('stock_transactions')
        .select(`
          id,
          created_at,
          quantity,
          unit_price,
          total_amount,
          notes,
          batches!inner (
            batch_number,
            expiry_date,
            cost_price,
            selling_price,
            medicines!inner (
              name,
              category,
              manufacturer,
              strength,
              unit
            )
          )
        `)
        .eq('type', 'purchase')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading purchase history:', error);
        return;
      }

      const formattedHistory: PurchaseHistoryItem[] = (data || []).map((item: any) => ({
        id: item.id,
        transaction_date: item.created_at,
        medicine_name: item.batches.medicines.name,
        category: item.batches.medicines.category,
        manufacturer: item.batches.medicines.manufacturer,
        strength: item.batches.medicines.strength,
        unit: item.batches.medicines.unit,
        batch_number: item.batches.batch_number,
        quantity: item.quantity,
        cost_price: item.unit_price,
        selling_price: item.batches.selling_price,
        total_amount: item.total_amount,
        expiry_date: item.batches.expiry_date,
        transaction_type: item.notes?.includes('restock') ? 'restock' : 'purchase',
        notes: item.notes || ''
      }));

      setPurchaseHistory(formattedHistory);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = purchaseHistory.filter((item) => {
    const matchesSearch = 
      item.medicine_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.batch_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.unit.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'all' || item.transaction_type === typeFilter;

    return matchesSearch && matchesType;
  });

  const totalPurchaseValue = filteredHistory.reduce((sum, item) => sum + item.total_amount, 0);
  const totalQuantity = filteredHistory.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                <p className="text-2xl font-bold text-blue-600">{filteredHistory.length}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Quantity</p>
                <p className="text-2xl font-bold text-green-600">{totalQuantity.toLocaleString()}</p>
              </div>
              <Package className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-purple-600">Rs. {totalPurchaseValue.toLocaleString()}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>Purchase & Restock History</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={loadPurchaseHistory}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm" disabled>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="flex-1 relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by medicine, manufacturer, batch..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant={typeFilter === 'all' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setTypeFilter('all')}
                className={typeFilter === 'all' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'border-blue-600 text-blue-600 hover:bg-blue-50'}
              >
                All
              </Button>
              <Button 
                variant={typeFilter === 'purchase' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setTypeFilter('purchase')}
                className={typeFilter === 'purchase' ? 'bg-green-600 hover:bg-green-700 text-white' : 'border-green-600 text-green-600 hover:bg-green-50'}
              >
                Purchased
              </Button>
              <Button 
                variant={typeFilter === 'restock' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setTypeFilter('restock')}
                className={typeFilter === 'restock' ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'border-purple-600 text-purple-600 hover:bg-purple-50'}
              >
                Restocked
              </Button>
            </div>
          </div>

          {/* History Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sr No</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Medicine</TableHead>
                  <TableHead>Manufacturer</TableHead>
                  <TableHead>Strength</TableHead>
                  <TableHead>Batch Number</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Cost Price</TableHead>
                  <TableHead>Total Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!loading && filteredHistory.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-center font-medium">
                        {index + 1}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{formatDate(new Date(item.transaction_date))}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(item.transaction_date).toLocaleTimeString()}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={item.transaction_type === 'purchase' ? 'default' : 'secondary'}
                          className={
                            item.transaction_type === 'purchase' 
                              ? 'bg-blue-600 text-white hover:bg-blue-700' 
                              : 'bg-green-600 text-white hover:bg-green-700'
                          }
                        >
                          {item.transaction_type === 'purchase' ? 'New Purchase' : 'Restock'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.medicine_name}</p>
                          <p className="text-sm text-gray-500">
                            {item.unit}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{item.manufacturer}</TableCell>
                      <TableCell>{item.strength}</TableCell>
                      <TableCell>
                        {item.batch_number}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{item.quantity.toLocaleString()}</span>
                      </TableCell>
                      <TableCell>Rs. {item.cost_price.toFixed(2)}</TableCell>
                      <TableCell>
                        <span className="font-bold text-green-600">
                          Rs. {item.total_amount.toFixed(2)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>

          {loading && (
            <div className="text-center py-8">
              <div className="flex items-center justify-center space-x-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Loading purchase history...</span>
              </div>
            </div>
          )}

          {!loading && filteredHistory.length === 0 && (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm || typeFilter !== 'all'
                  ? "No transactions found matching your filters."
                  : "No purchase history found."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
