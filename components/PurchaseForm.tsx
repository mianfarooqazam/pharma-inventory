'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useInventory } from '@/contexts/InventoryContext';
import { useNotifications } from '@/contexts/NotificationContext';

export function PurchaseForm() {
  const { medicines, addMedicine, addBatch, addTransaction } = useInventory();
  const { addNotification } = useNotifications();
  const [isNewMedicine, setIsNewMedicine] = useState(false);
  const [formData, setFormData] = useState({
    medicineId: '',
    medicineName: '',
    category: '',
    manufacturer: '',
    strength: '',
    unit: '',
    minStockLevel: '',
    price: '',
    batchNumber: '',
    quantity: '',
    costPrice: '',
    sellingPrice: '',
    expiryDate: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isNewMedicine) {
      // Add new medicine first
      const newMedicine = {
        name: formData.medicineName,
        category: formData.category,
        manufacturer: formData.manufacturer,
        strength: formData.strength,
        unit: formData.unit,
        minStockLevel: parseInt(formData.minStockLevel),
        currentStock: 0,
        price: parseFloat(formData.price),
      };
      
      // Add the new medicine and get its ID
      const addedMedicine = addMedicine(newMedicine);
      
      // Add new batch for the new medicine
      addBatch({
        medicineId: addedMedicine.id,
        batchNumber: formData.batchNumber,
        expiryDate: new Date(formData.expiryDate),
        quantity: parseInt(formData.quantity),
        costPrice: parseFloat(formData.costPrice),
        sellingPrice: parseFloat(formData.sellingPrice),
      });

      // Record purchase transaction
      addTransaction({
        medicineId: addedMedicine.id,
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
        title: 'New Medicine Added',
        message: `Successfully added ${formData.medicineName} with ${formData.quantity} units`,
      });
    } else {
      // Restock existing medicine
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
    }

    // Reset form
    setFormData({
      medicineId: '',
      medicineName: '',
      category: '',
      manufacturer: '',
      strength: '',
      unit: '',
      minStockLevel: '',
      price: '',
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Record Purchase</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Toggle between New Medicine and Restock */}
        <div className="flex space-x-2 mb-6">
          <Button
            type="button"
            variant={isNewMedicine ? "default" : "outline"}
            onClick={() => setIsNewMedicine(true)}
            className="flex-1"
          >
            Add New Medicine
          </Button>
          <Button
            type="button"
            variant={!isNewMedicine ? "default" : "outline"}
            onClick={() => setIsNewMedicine(false)}
            className="flex-1"
          >
            Restock Existing Medicine
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isNewMedicine ? (
            // New Medicine Form Fields
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="medicineName">Medicine Name *</Label>
                <Input
                  id="medicineName"
                  value={formData.medicineName}
                  onChange={(e) => handleInputChange('medicineName', e.target.value)}
                  placeholder="Enter medicine name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  placeholder="Enter category"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="manufacturer">Manufacturer *</Label>
                <Input
                  id="manufacturer"
                  value={formData.manufacturer}
                  onChange={(e) => handleInputChange('manufacturer', e.target.value)}
                  placeholder="Enter manufacturer"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="strength">Strength *</Label>
                <Input
                  id="strength"
                  value={formData.strength}
                  onChange={(e) => handleInputChange('strength', e.target.value)}
                  placeholder="Enter strength"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit">Unit *</Label>
                <Input
                  id="unit"
                  value={formData.unit}
                  onChange={(e) => handleInputChange('unit', e.target.value)}
                  placeholder="Enter unit"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="minStockLevel">Min Stock Level *</Label>
                <Input
                  id="minStockLevel"
                  type="number"
                  value={formData.minStockLevel}
                  onChange={(e) => handleInputChange('minStockLevel', e.target.value)}
                  placeholder="Enter min stock level"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Expected Selling Price (PKR) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
          ) : (
            // Restock Existing Medicine Form Fields
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
                        {medicine.name} - {medicine.strength}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

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
            <Button type="submit">Record Purchase</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}