'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Calendar } from 'lucide-react';
import { useInventory, type Batch } from '@/contexts/InventoryContext';
import { formatDate } from '@/lib/utils';

export function TransactionHistory() {
  const { transactions, medicines, batches } = useInventory();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTransactions = transactions.filter(transaction => {
    const medicine = medicines.find(m => m.id === transaction.medicineId);
    return medicine?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           transaction.type.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getTransactionBadge = (type: string) => {
    switch (type) {
      case 'purchase':
        return <Badge className="bg-blue-600 text-white hover:bg-blue-700">Purchase</Badge>;
      case 'sale':
        return <Badge className="bg-green-600 text-white hover:bg-green-700">Sale</Badge>;
      case 'return':
        return <Badge variant="destructive">Return</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <div>
      <div className="space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Transaction Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>S.No</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Medicine</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Batch/Expiry</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions
                .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                .map((transaction, index) => {
                  const medicine = medicines.find(m => m.id === transaction.medicineId);
                  
                  const batch = batches.find(b => b.id === transaction.batchId);
                  
                  return (
                    <TableRow key={transaction.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        {formatDate(transaction.createdAt)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{medicine?.name}</p>
                          <p className="text-sm text-gray-500">{medicine?.strength}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getTransactionBadge(transaction.type)}
                      </TableCell>
                      <TableCell>
                        {batch ? (
                          <div className="text-sm">
                            <span className="font-medium">Batch: {batch.batchNumber}</span>
                            <br />
                            <span className="text-gray-500">Expires: {formatDate(batch.expiryDate)}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>{transaction.quantity}</TableCell>
                      <TableCell>PKR {transaction.unitPrice.toFixed(2)}</TableCell>
                      <TableCell>
                        <span className={
                          transaction.type === 'sale' ? 'text-green-600 font-medium' :
                          transaction.type === 'purchase' ? 'text-blue-600 font-medium' :
                          'text-red-600 font-medium'
                        }>
                          PKR {transaction.totalAmount.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-500">
                          {transaction.notes || '-'}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </div>

        {filteredTransactions.length === 0 && (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchTerm ? 'No transactions found matching your search.' : 'No transactions recorded yet.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}