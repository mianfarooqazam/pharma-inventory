'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useInventory } from '@/contexts/InventoryContext';
import { useNotifications } from '@/contexts/NotificationContext';

interface AddMedicineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddMedicineDialog({ open, onOpenChange }: AddMedicineDialogProps) {
  const { addMedicine } = useInventory();
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
  });

  const categories = [
    'Analgesic', 'Antibiotic', 'Anti-inflammatory', 'Antacid', 'Vitamin',
    'Antiseptic', 'Cough Syrup', 'Cardiovascular', 'Diabetes', 'Other'
  ];

  const units = ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Cream', 'Drops', 'Spray'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    addMedicine({
      name: formData.name,
      category: formData.category,
      manufacturer: formData.manufacturer,
      strength: formData.strength,
      unit: formData.unit,
      description: formData.description,
      minStockLevel: parseInt(formData.minStockLevel),
      currentStock: parseInt(formData.currentStock),
      price: parseFloat(formData.price),
    });

    addNotification({
      type: 'success',
      title: 'Medicine Added',
      message: `${formData.name} has been successfully added to inventory`,
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
    });
    
    onOpenChange(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Medicine</DialogTitle>
          <DialogDescription>
            Enter the details for the new medicine to add to your inventory.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Medicine Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter medicine name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
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
                placeholder="e.g., 500mg"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unit *</Label>
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
              <Label htmlFor="price">Unit Price (PKR) *</Label>
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

            <div className="space-y-2">
              <Label htmlFor="minStockLevel">Minimum Stock Level *</Label>
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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Medicine</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}