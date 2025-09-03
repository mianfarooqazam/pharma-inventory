'use client';

import { useState, useEffect } from 'react';
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

interface EditMedicineDialogProps {
  medicineId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditMedicineDialog({ medicineId, open, onOpenChange }: EditMedicineDialogProps) {
  const { medicines, updateMedicine } = useInventory();
  const { addNotification } = useNotifications();
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    manufacturer: '',
    strength: '',
    unit: 'Tablet',
    minStockLevel: '',
    price: '',
  });

  const medicine = medicines.find(m => m.id === medicineId);

  const categories = [
    'Analgesic', 'Antibiotic', 'Anti-inflammatory', 'Antacid', 'Vitamin',
    'Antiseptic', 'Cough Syrup', 'Cardiovascular', 'Diabetes', 'Other'
  ];

  const units = ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Cream', 'Drops', 'Spray'];

  useEffect(() => {
    if (medicine) {
      setFormData({
        name: medicine.name,
        category: medicine.category,
        manufacturer: medicine.manufacturer,
        strength: medicine.strength,
        unit: medicine.unit,
        minStockLevel: medicine.minStockLevel.toString(),
        price: medicine.price.toString(),
      });
    }
  }, [medicine]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    updateMedicine(medicineId, {
      name: formData.name,
      category: formData.category,
      manufacturer: formData.manufacturer,
      strength: formData.strength,
      unit: formData.unit,
      minStockLevel: parseInt(formData.minStockLevel),
      price: parseFloat(formData.price),
    });

    addNotification({
      type: 'success',
      title: 'Medicine Updated',
      message: `${formData.name} has been successfully updated`,
    });
    
    onOpenChange(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!medicine) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Medicine</DialogTitle>
          
        </DialogHeader>
        
        <div className="border-t border-gray-200" />

        <form onSubmit={handleSubmit} className="space-y-6">
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

          {/* Stock Information */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minStockLevel">Minimum Stock Level</Label>
                <Input
                  id="minStockLevel"
                  type="number"
                  value={formData.minStockLevel}
                  onChange={(e) => handleInputChange('minStockLevel', e.target.value)}
                  placeholder="100"
                  required
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Update Medicine</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}