'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { InvoicePreviewDialog } from './InvoicePreviewDialog';
import { InvoiceData } from './InvoicePreview';
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

  const customers = useMemo(() => [
    { name: 'Ali Khan', city: 'Lahore' },
    { name: 'Sara Ahmed', city: 'Karachi' },
    { name: 'Usman Iqbal', city: 'Rawalpindi' },
    { name: 'Ayesha Noor', city: 'Peshawar' },
    { name: 'Bilal Hussain', city: 'Lahore' },
    { name: 'Hina Malik', city: 'Islamabad' },
    { name: 'Faisal Raza', city: 'Karachi' },
    { name: 'Nida Shah', city: 'Multan' },
    { name: 'Hamza Tariq', city: 'Quetta' },
    { name: 'Maryam Zafar', city: 'Faisalabad' },
  ], []);

  const [customerName, setCustomerName] = useState('');
  const [cartItems, setCartItems] = useState<Array<{
    medicineId: string;
    batchId: string;
    quantity: number;
    unitPrice: number;
  }>>([]);

  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);

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
  const reservedInCartForBatch = useMemo(() => {
    if (!formData.batchId) return 0;
    return cartItems
      .filter(ci => ci.batchId === formData.batchId)
      .reduce((sum, ci) => sum + ci.quantity, 0);
  }, [cartItems, formData.batchId]);
  const batchStock = selectedBatch ? Math.max(0, selectedBatch.quantity - reservedInCartForBatch) : 0;

  const handleAddItem = () => {
    if (!formData.medicineId || !formData.batchId || !formData.quantity || !formData.actualSellingPrice) return;
    const quantity = parseInt(formData.quantity);
    const unitPrice = parseFloat(formData.actualSellingPrice);
    if (!selectedBatch) return;

    if (quantity <= 0 || unitPrice <= 0) {
      addNotification({ type: 'error', title: 'Invalid Item', message: 'Quantity and price must be greater than 0' });
      return;
    }

    if (quantity > batchStock) {
      addNotification({ type: 'error', title: 'Insufficient Stock', message: `Only ${batchStock} units available in selected batch` });
      return;
    }

    setCartItems(prev => [...prev, {
      medicineId: formData.medicineId,
      batchId: formData.batchId,
      quantity,
      unitPrice,
    }]);

    // Clear all item inputs for next entry, keep customer selection
    setFormData(prev => ({
      ...prev,
      medicineId: '',
      batchId: '',
      quantity: '',
      actualSellingPrice: '',
      notes: '',
    }));
  };

  const handleRemoveItem = (index: number) => {
    setCartItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerName) {
      addNotification({ type: 'error', title: 'Missing Customer', message: 'Please select a customer' });
      return;
    }

    if (cartItems.length === 0) {
      addNotification({ type: 'error', title: 'Empty Cart', message: 'Please add at least one item' });
      return;
    }

    // Record each item as a sale transaction
    cartItems.forEach(item => {
      addTransaction({
        medicineId: item.medicineId,
        batchId: item.batchId,
        type: 'sale',
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalAmount: item.quantity * item.unitPrice,
        notes: formData.notes,
        createdBy: 'current-user',
      });
    });

    const itemsForInvoice = cartItems.map(ci => {
      const med = medicines.find(m => m.id === ci.medicineId);
      const batch = batches.find(b => b.id === ci.batchId);
      return {
        batchNo: batch ? batch.batchNumber : '',
        medicine: med ? `${med.name} ${med.strength}` : 'Unknown',
        unit: med ? med.unit : '',
        quantity: ci.quantity,
        unitPrice: ci.unitPrice,
      };
    });

    const invoice: InvoiceData = {
      invoiceNo: `INV-${Date.now()}`,
      customerName,
      date: formatDate(new Date()),
      items: itemsForInvoice,
      status: 'Paid',
    };

    setInvoiceData(invoice);
    setInvoiceOpen(true);

    addNotification({
      type: 'success',
      title: 'Sale Recorded',
      message: `Successfully recorded ${cartItems.length} item(s) for ${customerName}`,
    });

    // Reset item fields and cart
    setFormData({
      medicineId: '',
      batchId: '',
      quantity: '',
      actualSellingPrice: '',
      notes: '',
    });
    setCartItems([]);
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
                <Label htmlFor="customer">Customer</Label>
                <Select value={customerName} onValueChange={(value) => setCustomerName(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((c) => (
                      <SelectItem key={c.name} value={c.name}>
                        <div className="flex items-center justify-between w-full">
                          <span>{c.name}</span>
                          <span className="text-sm text-gray-500 ml-2">{c.city}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="medicine">Medicine Name</Label>
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
                <div className="pt-2">
                  <Button type="button" variant="outline" onClick={handleAddItem} disabled={!formData.medicineId || !formData.batchId || !formData.quantity || !formData.actualSellingPrice}>Add Item</Button>
                </div>
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

          {cartItems.length > 0 && (
            <div className="space-y-3">
              <div className="text-sm font-medium">Cart Items</div>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-200 px-3 py-2 text-left text-sm">Batch</th>
                      <th className="border border-gray-200 px-3 py-2 text-left text-sm">Medicine</th>
                      <th className="border border-gray-200 px-3 py-2 text-center text-sm">Qty</th>
                      <th className="border border-gray-200 px-3 py-2 text-right text-sm">Unit Price</th>
                      <th className="border border-gray-200 px-3 py-2 text-right text-sm">Total</th>
                      <th className="border border-gray-200 px-3 py-2 text-right text-sm">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map((ci, idx) => {
                      const med = medicines.find(m => m.id === ci.medicineId);
                      const batch = batches.find(b => b.id === ci.batchId);
                      return (
                        <tr key={`cart-${idx}`}>
                          <td className="border border-gray-200 px-3 py-2 text-sm">{batch?.batchNumber}</td>
                          <td className="border border-gray-200 px-3 py-2 text-sm">{med ? `${med.name} ${med.strength}` : ''}</td>
                          <td className="border border-gray-200 px-3 py-2 text-center text-sm">{ci.quantity}</td>
                          <td className="border border-gray-200 px-3 py-2 text-right text-sm">PKR {ci.unitPrice.toFixed(2)}</td>
                          <td className="border border-gray-200 px-3 py-2 text-right text-sm">PKR {(ci.quantity * ci.unitPrice).toFixed(2)}</td>
                          <td className="border border-gray-200 px-3 py-2 text-right text-sm">
                            <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveItem(idx)}>Remove</Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
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
          <Button type="submit" disabled={!customerName || cartItems.length === 0}>
            Record Sale
          </Button>
        </div>
      </form>
      <InvoicePreviewDialog open={invoiceOpen} onOpenChange={setInvoiceOpen} invoice={invoiceData} />
    </div>
  );
}