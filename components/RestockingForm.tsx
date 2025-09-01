'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useInventory } from '@/contexts/InventoryContext';
import { useNotifications } from '@/contexts/NotificationContext';

export function RestockingForm() {
  const { medicines, addBatch, addTransaction } = useInventory();
  const { addNotification } = useNotifications();
  const [formData, setFormData] = useState({
    medicineId: '',
    batchNumber: '',
    quantity: '',
    costPrice: '',
    sellingPrice: '',
    expiryDate: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const medicine = medicines.find(m => m.id === formData.medicineId);
    if (!medicine) return;

    // Add new batch
    addBatch({
      medicineId: formData.medicineId,
      batchNumber: formData.batchNumber,
      expiryDate: new Date(formData.expiryDate),
      quantity: parseInt(formData.quantity),
      costPrice: parseFloat(formData.costPrice),
      sellingPrice: parseFloat(formData.sellingPrice),
    });

    // Record purchase transaction
    addTransaction({
      medicineId: formData.medicineId,
      batchId: '', // This would be the actual batch ID in a real app
      type: 'purchase',
      quantity: parseInt(formData.quantity),
      unitPrice: parseFloat(formData.costPrice),
      totalAmount: parseInt(formData.quantity) * parseFloat(formData.costPrice),
      notes: formData.notes,
      createdBy: 'current-user', // This would be the actual user ID
    });

    addNotification({
      type: 'success',
      title: 'Restock Recorded',
      message: `Successfully restocked ${formData.quantity} units of ${medicine.name}`,
    });

    // Reset form
    setFormData({
      medicineId: '',
      batchNumber: '',
      quantity: '',
      costPrice: '',
      sellingPrice: '',
      expiryDate: '',
      notes: '',
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const selectedMedicine = medicines.find(m => m.id === formData.medicineId);
  const currentStock = selectedMedicine ? selectedMedicine.currentStock : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Restock Existing Medicine</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Medicine Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="medicine">Medicine *</Label>
              <Select value={formData.medicineId} onValueChange={(value) => handleInputChange('medicineId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a medicine to restock" />
                </SelectTrigger>
                <SelectContent>
                  {medicines.map((medicine) => (
                    <SelectItem key={medicine.id} value={medicine.id}>
                      <div className="flex items-center justify-between w-full">
                        <span className="font-medium">{medicine.name}</span>
                        <span className="text-sm text-gray-500 ml-2">{medicine.strength}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedMedicine && (
              <div className="space-y-2">
                <Label>Current Stock</Label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-gray-800">
                      {currentStock.toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-500">{selectedMedicine.unit}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Min level: {selectedMedicine.minStockLevel}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Batch Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="batchNumber">Batch Number *</Label>
              <Input
                id="batchNumber"
                value={formData.batchNumber}
                onChange={(e) => handleInputChange('batchNumber', e.target.value)}
                placeholder="Enter batch number"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', e.target.value)}
                placeholder="Enter quantity"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date *</Label>
              <Input
                id="expiryDate"
                type="date"
                value={formData.expiryDate}
                onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="costPrice">Cost Price (PKR) *</Label>
              <Input
                id="costPrice"
                type="number"
                step="0.01"
                value={formData.costPrice}
                onChange={(e) => handleInputChange('costPrice', e.target.value)}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sellingPrice">Expected Selling Price (PKR) *</Label>
              <Input
                id="sellingPrice"
                type="number"
                step="0.01"
                value={formData.sellingPrice}
                onChange={(e) => handleInputChange('sellingPrice', e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
          </div>

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
            <Button type="submit">Record Restock</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
