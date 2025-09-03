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
import { formatDate } from '@/lib/utils';

export function SaleForm() {
  const { medicines, batches, addTransaction, getMedicineStock } = useInventory();
  const { addNotification } = useNotifications();
  const [formData, setFormData] = useState({
    medicineId: '',
    batchId: '',
    quantity: '',
    actualSellingPrice: '',
    notes: '',
  });

  const selectedMedicine = medicines.find(m => m.id === formData.medicineId);
  const availableStock = selectedMedicine ? getMedicineStock(selectedMedicine.id) : 0;

  // Get available batches for the selected medicine, sorted by expiry date (earliest first)
  const getAvailableBatches = (medicineId: string) => {
    return batches
      .filter(b => b.medicineId === medicineId && b.quantity > 0)
      .sort((a, b) => a.expiryDate.getTime() - b.expiryDate.getTime());
  };

  const availableBatches = getAvailableBatches(formData.medicineId);
  const selectedBatch = batches.find(b => b.id === formData.batchId);
  const batchStock = selectedBatch ? selectedBatch.quantity : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMedicine) return;
    
    const quantity = parseInt(formData.quantity);
    
    if (!formData.batchId) {
      addNotification({
        type: 'error',
        title: 'Sale Failed',
        message: 'Please select a batch to sell from',
      });
      return;
    }

    if (quantity > batchStock) {
      addNotification({
        type: 'error',
        title: 'Insufficient Stock',
        message: `Only ${batchStock} units available in selected batch`,
      });
      return;
    }

    // Record sale transaction with actual selling price
    addTransaction({
      medicineId: formData.medicineId,
      batchId: formData.batchId,
      type: 'sale',
      quantity: quantity,
      unitPrice: parseFloat(formData.actualSellingPrice),
      totalAmount: quantity * parseFloat(formData.actualSellingPrice),
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
      batchId: '',
      quantity: '',
      actualSellingPrice: '',
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
          {/* Sale Information */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="medicine">Medicine</Label>
                <Select value={formData.medicineId} onValueChange={(value) => handleInputChange('medicineId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select medicine" />
                  </SelectTrigger>
                  <SelectContent>
                    {medicines.map((medicine) => (
                      <SelectItem key={medicine.id} value={medicine.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{medicine.name} - {medicine.strength}</span>
                          <span className="text-sm text-gray-500 ml-2">
                            {getMedicineStock(medicine.id)} units
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="batch">Batch Number</Label>
                <Select value={formData.batchId} onValueChange={(value) => handleInputChange('batchId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select batch" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableBatches.map((batch) => (
                      <SelectItem key={batch.id} value={batch.id}>
                        <div className="flex items-center justify-between w-full space-x-4">
                          <span className="font-medium">Batch: {batch.batchNumber}</span>
                          <span className="text-sm text-blue-600 flex-shrink-0">
                            Expires: {formatDate(batch.expiryDate)}
                          </span>
                          <span className="text-sm text-gray-500 flex-shrink-0">
                            {batch.quantity} units
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {availableBatches.length === 0 && selectedMedicine && (
                  <p className="text-sm text-red-500">
                    No available batches for this medicine
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange('quantity', e.target.value)}
                  placeholder="Enter quantity"
                  max={batchStock}
                  required
                />
                {selectedBatch && (
                  <p className="text-sm text-gray-500">
                    Available in selected batch: {batchStock} units
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="actualSellingPrice">Actual Selling Price (PKR)</Label>
                <Input
                  id="actualSellingPrice"
                  type="number"
                  step="0.01"
                  value={formData.actualSellingPrice}
                  onChange={(e) => handleInputChange('actualSellingPrice', e.target.value)}
                  placeholder="0.00"
                  required
                />
                {selectedMedicine && (
                  <div className="space-y-1">
                    {selectedBatch && (
                      <p className="text-sm text-gray-500">
                        Purchase price: PKR {selectedBatch.costPrice.toFixed(2)}
                      </p>
                    )}
                    <p className="text-sm text-gray-500">
                      Expected selling price: PKR {selectedMedicine.price.toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {formData.actualSellingPrice && formData.quantity && (
            <div className="bg-blue-600 border-blue-600 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-white font-medium">Total Amount:</span>
                <span className="font-bold text-lg text-white">
                  PKR {(parseInt(formData.quantity) * parseFloat(formData.actualSellingPrice)).toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Description</Label>
            <Input
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Optional description"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="submit" disabled={!formData.medicineId || !formData.batchId || !formData.quantity || !formData.actualSellingPrice}>
            Record Sale
          </Button>
        </div>
      </form>
    </div>
  );
}