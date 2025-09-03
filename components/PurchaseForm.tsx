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
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    manufacturer: '',
    strength: '',
    unit: 'Tablet',
    description: '',
    minStockLevel: '',
    currentStock: '',
    price: '',
    batchNumber: '',
    purchasePrice: '',
    expiryDate: '',
  });

  const categories = [
    'Analgesic', 'Antibiotic', 'Anti-inflammatory', 'Antacid', 'Vitamin',
    'Antiseptic', 'Cough Syrup', 'Cardiovascular', 'Diabetes', 'Other'
  ];

  const units = ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Cream', 'Drops', 'Spray'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Add new medicine first
    const newMedicine = {
      name: formData.name,
      category: formData.category,
      manufacturer: formData.manufacturer,
      strength: formData.strength,
      unit: formData.unit,
      description: formData.description,
      minStockLevel: parseInt(formData.minStockLevel),
      currentStock: parseInt(formData.currentStock) || 0,
      price: parseFloat(formData.price),
    };
    
    // Add the new medicine and get its ID
    const addedMedicine = addMedicine(newMedicine);
    
    // Add new batch for the new medicine
    addBatch({
      medicineId: addedMedicine.id,
      batchNumber: formData.batchNumber,
      expiryDate: new Date(formData.expiryDate),
      quantity: parseInt(formData.currentStock) || 0,
      costPrice: parseFloat(formData.purchasePrice),
      sellingPrice: parseFloat(formData.price),
    });

    addNotification({
      type: 'success',
      title: 'New Medicine Added',
      message: `Successfully added ${formData.name} with ${formData.currentStock || 0} units`,
    });

    // Reset form
    setFormData({
      name: '',
      category: '',
      manufacturer: '',
      strength: '',
      unit: 'Tablet',
      description: '',
      minStockLevel: '',
      currentStock: '',
      price: '',
      batchNumber: '',
      purchasePrice: '',
      expiryDate: '',
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-6">
            {/* Basic Medicine Information */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Medicine Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter medicine name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="manufacturer">Manufacturer</Label>
                  <Input
                    id="manufacturer"
                    value={formData.manufacturer}
                    onChange={(e) => handleInputChange('manufacturer', e.target.value)}
                    placeholder="Enter manufacturer"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="strength">Strength</Label>
                  <Input
                    id="strength"
                    value={formData.strength}
                    onChange={(e) => handleInputChange('strength', e.target.value)}
                    placeholder="e.g., 500mg"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Select value={formData.unit} onValueChange={(value) => handleInputChange('unit', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map((unit) => (
                        <SelectItem key={unit} value={unit}>
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="batchNumber">Batch Number</Label>
                  <Input
                    id="batchNumber"
                    value={formData.batchNumber}
                    onChange={(e) => handleInputChange('batchNumber', e.target.value)}
                    placeholder="Enter batch number"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Pricing Information */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="purchasePrice">Purchase Price (PKR)</Label>
                  <Input
                    id="purchasePrice"
                    type="number"
                    step="0.01"
                    value={formData.purchasePrice}
                    onChange={(e) => handleInputChange('purchasePrice', e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Expected Selling Price (PKR)</Label>
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
            </div>

            {/* Stock & Batch Information */}
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minStockLevel">Minimum Stock Level</Label>
                  <Input
                    id="minStockLevel"
                    type="number"
                    value={formData.minStockLevel}
                    onChange={(e) => handleInputChange('minStockLevel', e.target.value)}
                    placeholder="Enter minimum stock"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentStock">Initial Stock</Label>
                  <Input
                    id="currentStock"
                    type="number"
                    value={formData.currentStock}
                    onChange={(e) => handleInputChange('currentStock', e.target.value)}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Optional description"
              />
            </div>
          </div>

        <div className="flex justify-end space-x-2">
          <Button type="submit">Record Purchase</Button>
        </div>
      </form>
    </div>
  );
}