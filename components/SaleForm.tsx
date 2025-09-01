'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useInventory } from '@/contexts/InventoryContext';
import { useNotifications } from '@/contexts/NotificationContext';

export function SaleForm() {
  const { medicines, batches, addTransaction, getMedicineStock } = useInventory();
  const { addNotification } = useNotifications();
  const [formData, setFormData] = useState({
    medicineId: '',
    quantity: '',
    notes: '',
  });

  const selectedMedicine = medicines.find(m => m.id === formData.medicineId);
  const availableStock = selectedMedicine ? getMedicineStock(selectedMedicine.id) : 0;

  // Get the oldest batch for FIFO logic
  const getOldestBatch = (medicineId: string) => {
    return batches
      .filter(b => b.medicineId === medicineId && b.quantity > 0)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())[0];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMedicine) return;
    
    const quantity = parseInt(formData.quantity);
    const oldestBatch = getOldestBatch(formData.medicineId);
    
    if (!oldestBatch) {
      addNotification({
        type: 'error',
        title: 'Sale Failed',
        message: 'No available batches for this medicine',
      });
      return;
    }

    if (quantity > availableStock) {
      addNotification({
        type: 'error',
        title: 'Insufficient Stock',
        message: `Only ${availableStock} units available`,
      });
      return;
    }

    // Record sale transaction
    addTransaction({
      medicineId: formData.medicineId,
      batchId: oldestBatch.id,
      type: 'sale',
      quantity: quantity,
      unitPrice: oldestBatch.sellingPrice,
      totalAmount: quantity * oldestBatch.sellingPrice,
      notes: formData.notes,
      createdBy: 'current-user',
    });

    addNotification({
      type: 'success',
      title: 'Sale Recorded',
      message: `Successfully sold ${quantity} units of ${selectedMedicine.name}`,
    });

    // Reset form
    setFormData({
      medicineId: '',
      quantity: '',
      notes: '',
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Record Sale</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="medicine">Medicine *</Label>
              <Select value={formData.medicineId} onValueChange={(value) => handleInputChange('medicineId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select medicine" />
                </SelectTrigger>
                <SelectContent>
                  {medicines.map((medicine) => (
                    <SelectItem key={medicine.id} value={medicine.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{medicine.name} - {medicine.strength}</span>
                        <Badge variant="outline" className="ml-2">
                          {getMedicineStock(medicine.id)} units
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', e.target.value)}
                placeholder="Enter quantity"
                max={availableStock}
                required
              />
              {selectedMedicine && (
                <p className="text-sm text-gray-500">
                  Available: {availableStock} units
                </p>
              )}
            </div>
          </div>

          {selectedMedicine && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Sale Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Unit Price:</span>
                  <span className="ml-2 font-medium">
                    ${selectedMedicine.price.toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="ml-2 font-medium">
                    ${(parseInt(formData.quantity || '0') * selectedMedicine.price).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Optional notes"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="submit" disabled={!formData.medicineId || !formData.quantity}>
              Record Sale
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}