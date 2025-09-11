'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useInventory } from '@/contexts/InventoryContext';
import { useNotifications } from '@/contexts/NotificationContext';

interface PurchaseFormProps {
  initialType?: 'new' | 'restock';
  hideTypeSwitcher?: boolean;
}

export function PurchaseForm({ initialType = 'new', hideTypeSwitcher = false }: PurchaseFormProps) {
  const { medicines, batches, addMedicine, addBatch, addTransaction } = useInventory();
  const { addNotification } = useNotifications();
  const [purchaseType, setPurchaseType] = useState<'new' | 'restock'>(initialType);
  const [selectedMedicineId, setSelectedMedicineId] = useState('');
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

  const selectedMedicine = medicines.find(m => m.id === selectedMedicineId);

  const handleMedicineSelect = (medicineId: string) => {
    setSelectedMedicineId(medicineId);
    const medicine = medicines.find(m => m.id === medicineId);
    if (medicine) {
      const medicineBatches = batches.filter(batch => batch.medicineId === medicineId);
      const mostRecentBatch = medicineBatches.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0];
      
      setFormData(prev => ({
        ...prev,
        name: medicine.name,
        category: medicine.category,
        manufacturer: medicine.manufacturer,
        strength: medicine.strength,
        unit: medicine.unit,
        description: medicine.description || '',
        minStockLevel: medicine.minStockLevel.toString(),
        price: medicine.price.toString(),
        batchNumber: mostRecentBatch?.batchNumber || '',
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let medicineId: string;
    
    if (purchaseType === 'new') {
      const newMedicineInput = {
        name: formData.name,
        category: formData.category,
        manufacturer: formData.manufacturer,
        strength: formData.strength,
        unit: formData.unit,
        description: formData.description,
        minStockLevel: parseInt(formData.minStockLevel),
        price: parseFloat(formData.price),
      } as const;
      const addedMedicine = await addMedicine(newMedicineInput);
      if (!addedMedicine) return;
      medicineId = addedMedicine.id;
    } else {
      medicineId = selectedMedicineId;
    }
    
    const createdBatch = await addBatch({
      medicineId: medicineId,
      batchNumber: formData.batchNumber,
      expiryDate: new Date(formData.expiryDate),
      quantity: parseInt(formData.currentStock) || 0,
      costPrice: parseFloat(formData.purchasePrice),
      sellingPrice: parseFloat(formData.price),
    });

    if (createdBatch) {
      await addTransaction({
        medicineId: medicineId,
        batchId: createdBatch.id,
        type: 'purchase',
        quantity: parseInt(formData.currentStock) || 0,
        unitPrice: parseFloat(formData.purchasePrice),
        totalAmount: (parseInt(formData.currentStock) || 0) * parseFloat(formData.purchasePrice),
        notes: purchaseType === 'new' ? 'New medicine purchase' : 'Medicine restock',
        createdBy: null,
      });
    }

    addNotification({
      type: 'success',
      title: purchaseType === 'new' ? 'New Medicine Added' : 'Medicine Restocked',
      message: `Successfully ${purchaseType === 'new' ? 'added' : 'restocked'} ${formData.name} with ${formData.currentStock || 0} units`,
    });

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
    setSelectedMedicineId('');
    setPurchaseType('new');
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-6">
            {!hideTypeSwitcher && (
              <div className="space-y-4">
                <RadioGroup value={purchaseType} onValueChange={(value: 'new' | 'restock') => setPurchaseType(value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="new" id="new" />
                    <Label htmlFor="new">Purchase New Medicine</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="restock" id="restock" />
                    <Label htmlFor="restock">Restock Existing Medicine</Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Medicine Name</Label>
                  {purchaseType === 'restock' ? (
                    <Select value={selectedMedicineId} onValueChange={handleMedicineSelect}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select existing medicine" />
                      </SelectTrigger>
                      <SelectContent>
                        {medicines.map((medicine) => (
                          <SelectItem key={medicine.id} value={medicine.id}>
                            <div className="flex items-center justify-between w-full">
                              <span>{medicine.name} - {medicine.strength}</span>
                              <span className="text-sm text-gray-500 ml-2">
                                {medicine.currentStock} units
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter medicine name"
                      required
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => handleInputChange('category', value)}
                    disabled={purchaseType === 'restock'}
                  >
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
                    disabled={purchaseType === 'restock'}
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
                    disabled={purchaseType === 'restock'}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Select 
                    value={formData.unit} 
                    onValueChange={(value) => handleInputChange('unit', value)}
                    disabled={purchaseType === 'restock'}
                  >
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
                    disabled={purchaseType === 'restock'}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="purchasePrice">Purchase Price per Unit (PKR)</Label>
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
                  <Label htmlFor="price">Expected Selling Price per Unit (PKR)</Label>
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

            {formData.purchasePrice && formData.currentStock && (
              <div className="bg-blue-600 border-blue-600 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-white font-medium">Total Purchase Amount:</span>
                  <span className="font-bold text-lg text-white">
                    PKR {(parseInt(formData.currentStock) * parseFloat(formData.purchasePrice)).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
               
                <div className="space-y-2">
                  <Label htmlFor="currentStock">Quantity</Label>
                  <Input
                    id="currentStock"
                    type="number"
                    value={formData.currentStock}
                    onChange={(e) => handleInputChange('currentStock', e.target.value)}
                    placeholder="0"
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
                    disabled={purchaseType === 'restock'}
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
          <Button 
            type="submit" 
            disabled={
              purchaseType === 'new' 
                ? (!formData.name || !formData.category || !formData.manufacturer || !formData.strength || !formData.batchNumber || !formData.purchasePrice || !formData.price || !formData.minStockLevel || !formData.expiryDate)
                : (!selectedMedicineId || !formData.batchNumber || !formData.purchasePrice || !formData.price || !formData.expiryDate)
            }
          >
            {purchaseType === 'new' ? 'Record Purchase' : 'Record Restock'}
          </Button>
        </div>
      </form>
    </div>
  );
}