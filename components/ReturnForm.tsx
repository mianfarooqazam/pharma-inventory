'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search } from 'lucide-react';
import { useInventory } from '@/contexts/InventoryContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { formatDate } from '@/lib/utils';

export function ReturnForm() {
  const { medicines, batches, transactions, addTransaction } = useInventory();
  const { addNotification } = useNotifications();
  const [formData, setFormData] = useState({
    transactionId: '',
    quantity: '',
    reason: '',
    notes: '',
  });
  const [searchTerm, setSearchTerm] = useState('');

  const reasons = [
    'Near Expiry',
    'Expired',
    'Damaged',
    'Quality Issue',
    'Wrong Medicine',
    'Other'
  ];

  // Get all sale transactions that can be returned
  const saleTransactions = transactions
    .filter(t => t.type === 'sale')
    .map(transaction => {
      const medicine = medicines.find(m => m.id === transaction.medicineId);
      const batch = batches.find(b => b.id === transaction.batchId);
      
      // Calculate how much has already been returned for this sale
      const returnedQuantity = transactions
        .filter(t => t.type === 'return' && t.medicineId === transaction.medicineId && t.batchId === transaction.batchId)
        .reduce((total, returnTransaction) => total + returnTransaction.quantity, 0);
      
      const remainingQuantity = transaction.quantity - returnedQuantity;
      
      return {
        ...transaction,
        medicineName: medicine?.name || 'Unknown',
        medicineStrength: medicine?.strength || '',
        batchNumber: batch?.batchNumber || 'Unknown',
        expiryDate: batch?.expiryDate || new Date(),
        returnedQuantity,
        remainingQuantity,
      };
    })
    .filter(transaction => transaction.remainingQuantity > 0) // Only show transactions that still have items to return
    .filter(transaction => {
      // Apply search filter
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        transaction.medicineName.toLowerCase().includes(searchLower) ||
        transaction.medicineStrength.toLowerCase().includes(searchLower) ||
        transaction.batchNumber.toLowerCase().includes(searchLower) ||
        transaction.type.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const selectedTransaction = saleTransactions.find(t => t.id === formData.transactionId);
  const selectedMedicine = medicines.find(m => m.id === selectedTransaction?.medicineId);
  const selectedBatch = batches.find(b => b.id === selectedTransaction?.batchId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTransaction) return;

    const returnQuantity = parseInt(formData.quantity);
    
    if (returnQuantity > selectedTransaction.remainingQuantity) {
      addNotification({
        type: 'error',
        title: 'Invalid Return Quantity',
        message: `Cannot return more than ${selectedTransaction.remainingQuantity} units (${selectedTransaction.returnedQuantity} already returned)`,
      });
      return;
    }

    // Record return transaction
    addTransaction({
      medicineId: selectedTransaction.medicineId,
      batchId: selectedTransaction.batchId,
      type: 'return',
      quantity: returnQuantity,
      unitPrice: selectedTransaction.unitPrice,
      totalAmount: returnQuantity * selectedTransaction.unitPrice,
      notes: `${formData.reason}: ${formData.notes}`,
      createdBy: 'current-user',
    });

    addNotification({
      type: 'success',
      title: 'Return Processed',
      message: `Successfully returned ${returnQuantity} units of ${selectedMedicine?.name}`,
    });

    // Reset form
    setFormData({
      transactionId: '',
      quantity: '',
      reason: '',
      notes: '',
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search sales for return..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Available Sales for Return */}
          <div className="space-y-4">
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>S.No</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Medicine</TableHead>
                    <TableHead>Batch Number</TableHead>
                    <TableHead>Expiry</TableHead>
                    <TableHead>Sold</TableHead>
                    <TableHead>Returned</TableHead>
                    <TableHead>Remaining</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {saleTransactions.map((transaction, index) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{transaction.medicineName}</div>
                          <div className="text-sm text-gray-500">{transaction.medicineStrength}</div>
                        </div>
                      </TableCell>
                      <TableCell>{transaction.batchNumber}</TableCell>
                      <TableCell>{formatDate(transaction.expiryDate)}</TableCell>
                      <TableCell>{transaction.quantity}</TableCell>
                      <TableCell>{transaction.returnedQuantity}</TableCell>
                      <TableCell className="font-medium">{transaction.remainingQuantity}</TableCell>
                      <TableCell>PKR {transaction.unitPrice.toFixed(2)}</TableCell>
                      <TableCell>PKR {transaction.totalAmount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleInputChange('transactionId', transaction.id)}
                        >
                          Select
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Return Form */}
          {selectedTransaction && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Return Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Return Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => handleInputChange('quantity', e.target.value)}
                    placeholder="Enter quantity to return"
                    max={selectedTransaction.remainingQuantity}
                    required
                  />
                  <p className="text-sm text-gray-500">
                    Maximum: {selectedTransaction.remainingQuantity} units (Sold: {selectedTransaction.quantity}, Returned: {selectedTransaction.returnedQuantity})
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">Return Reason</Label>
                  <Select value={formData.reason} onValueChange={(value) => handleInputChange('reason', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select reason" />
                    </SelectTrigger>
                    <SelectContent>
                      {reasons.map((reason) => (
                        <SelectItem key={reason} value={reason}>
                          {reason}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Description</Label>
                <Input
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Optional description"
                />
              </div>

              {formData.quantity && (
                <div className="bg-blue-600 border-blue-600 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-medium">Refund Amount:</span>
                    <span className="font-bold text-lg text-white">
                      PKR {(parseInt(formData.quantity) * selectedTransaction.unitPrice).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="submit" disabled={!formData.transactionId || !formData.quantity || !formData.reason}>
            Process Return
          </Button>
        </div>
      </form>
    </div>
  );
}