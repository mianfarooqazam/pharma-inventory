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
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { useToast } from '@/hooks/use-toast';

interface EditMedicineDialogProps {
  medicineId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditMedicineDialog({ medicineId, open, onOpenChange }: EditMedicineDialogProps) {
  const { medicines, batches, updateMedicine } = useInventory();
  const { addNotification } = useNotifications();
  const { toast } = useToast();
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<{
    name: string;
    category: string;
    manufacturer: string;
    strength: string;
    unit: string;
    minStockLevel: number;
    currentStock: number;
    price: number;
  } | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    manufacturer: '',
    strength: '',
    unit: 'Tablet',
    minStockLevel: '',
    currentStock: '',
    price: '',
    batchNumber: '',
    purchasePrice: '',
    expiryDate: '',
  });

  const medicine = medicines.find(m => m.id === medicineId);
  
  // Get the first available batch for this medicine (for auto-population)
  const medicineBatch = batches.find(b => b.medicineId === medicineId);

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
        currentStock: medicine.currentStock.toString(),
        price: medicine.price.toString(),
        batchNumber: medicineBatch?.batchNumber || '',
        purchasePrice: medicineBatch?.costPrice.toString() || '',
        expiryDate: medicineBatch?.expiryDate ? medicineBatch.expiryDate.toISOString().split('T')[0] : '',
      });
    }
  }, [medicine, medicineBatch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Store the pending changes and show confirmation
    setPendingChanges({
      name: formData.name,
      category: formData.category,
      manufacturer: formData.manufacturer,
      strength: formData.strength,
      unit: formData.unit,
      minStockLevel: parseInt(formData.minStockLevel),
      currentStock: parseInt(formData.currentStock),
      price: parseFloat(formData.price),
    });
    
    setConfirmationOpen(true);
  };

  const confirmUpdate = () => {
    if (!pendingChanges) return;

    updateMedicine(medicineId, pendingChanges);

    addNotification({
      type: 'success',
      title: 'Medicine Updated',
      message: `${pendingChanges.name} has been successfully updated`,
    });

    
    setConfirmationOpen(false);
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
                <Label htmlFor="currentStock">Initial Stock</Label>
                <Input
                  id="currentStock"
                  type="number"
                  value={formData.currentStock}
                  onChange={(e) => handleInputChange('currentStock', e.target.value)}
                  placeholder="0"
                  required
                />
              </div>

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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Update Medicine</Button>
          </DialogFooter>
        </form>
        
        <ConfirmationDialog
          open={confirmationOpen}
          onOpenChange={setConfirmationOpen}
          title="Confirm Medicine Update"
          description={`Are you sure you want to update ${pendingChanges?.name}? This will save all the changes you've made.`}
          confirmText="Save Changes"
          onConfirm={confirmUpdate}
          variant="edit"
        />
      </DialogContent>
    </Dialog>
  );
}