'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useInventory } from '@/contexts/InventoryContext';
import { useNotifications } from '@/contexts/NotificationContext';

export function ReturnForm() {
  const { medicines, addTransaction } = useInventory();
  const { addNotification } = useNotifications();
  const [formData, setFormData] = useState({
    medicineId: '',
    quantity: '',
    reason: '',
    notes: '',
  });

  const reasons = [
    'Expired',
    'Damaged',
    'Customer Return',
    'Quality Issue',
    'Wrong Medicine',
    'Other'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const medicine = medicines.find(m => m.id === formData.medicineId);
    if (!medicine) return;

    // Record return transaction
    addTransaction({
      medicineId: formData.medicineId,
      batchId: '', // This would be selected from available batches
      type: 'return',
      quantity: parseInt(formData.quantity),
      unitPrice: medicine.price,
      totalAmount: parseInt(formData.quantity) * medicine.price,
      notes: `${formData.reason}: ${formData.notes}`,
      createdBy: 'current-user',
    });

    addNotification({
      type: 'info',
      title: 'Return Processed',
      message: `Processed return of ${formData.quantity} units of ${medicine.name}`,
    });

    // Reset form
    setFormData({
      medicineId: '',
      quantity: '',
      reason: '',
      notes: '',
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Process Return</CardTitle>
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
                      {medicine.name} - {medicine.strength}
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
                required
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="reason">Return Reason *</Label>
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
            <Label htmlFor="notes">Additional Notes</Label>
            <Input
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Enter additional details"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="submit" disabled={!formData.medicineId || !formData.quantity || !formData.reason}>
              Process Return
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}