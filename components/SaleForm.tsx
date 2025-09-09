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
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { formatDate } from '@/lib/utils';
import { Pencil, Trash2 } from 'lucide-react';

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
    { name: 'Ali Khan', address: '12 Mall Road', city: 'Lahore', phone: '03001234567' },
    { name: 'Sara Ahmed', address: '45 Clifton Block 5', city: 'Karachi', phone: '03111234567' },
    { name: 'Usman Iqbal', address: '88 Satellite Town', city: 'Rawalpindi', phone: '03211234567' },
    { name: 'Ayesha Noor', address: '7 University Rd', city: 'Peshawar', phone: '03331234567' },
    { name: 'Bilal Hussain', address: '19 Jail Road', city: 'Lahore', phone: '03011239876' },
    { name: 'Hina Malik', address: '2 Jinnah Avenue', city: 'Islamabad', phone: '03451234567' },
    { name: 'Faisal Raza', address: '55 Shahrah-e-Faisal', city: 'Karachi', phone: '03021234567' },
    { name: 'Nida Shah', address: '101 MQ Road', city: 'Multan', phone: '03151234567' },
    { name: 'Hamza Tariq', address: '6 Cantt Bazaar', city: 'Quetta', phone: '03301234567' },
    { name: 'Maryam Zafar', address: '23 Civil Lines', city: 'Faisalabad', phone: '03251234567' },
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
  const [taxPercent, setTaxPercent] = useState<string>('0');
  const [discountPercent, setDiscountPercent] = useState<string>('0');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const { toast } = useToast();

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
      .filter((ci, idx) => ci.batchId === formData.batchId && idx !== editingIndex)
      .reduce((sum, ci) => sum + ci.quantity, 0);
  }, [cartItems, formData.batchId, editingIndex]);
  const batchStock = selectedBatch ? Math.max(0, selectedBatch.quantity - reservedInCartForBatch) : 0;

  const handleAddOrUpdateItem = () => {
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

    if (editingIndex !== null) {
      setCartItems(prev => prev.map((item, idx) => idx === editingIndex ? {
        medicineId: formData.medicineId,
        batchId: formData.batchId,
        quantity,
        unitPrice,
      } : item));
    } else {
      setCartItems(prev => [...prev, {
        medicineId: formData.medicineId,
        batchId: formData.batchId,
        quantity,
        unitPrice,
      }]);
    }

    // Clear all item inputs for next entry, keep customer selection
    setFormData(prev => ({
      ...prev,
      medicineId: '',
      batchId: '',
      quantity: '',
      actualSellingPrice: '',
      notes: '',
    }));
    setEditingIndex(null);
  };

  const handleEditItem = (index: number) => {
    const item = cartItems[index];
    setEditingIndex(index);
    setFormData(prev => ({
      ...prev,
      medicineId: item.medicineId,
      batchId: item.batchId,
      quantity: String(item.quantity),
      actualSellingPrice: String(item.unitPrice),
    }));
  };

  const handleRemoveItem = (index: number) => {
    setCartItems(prev => prev.filter((_, i) => i !== index));
    if (editingIndex === index) {
      // If removing the item being edited, reset edit mode and clear inputs
      setEditingIndex(null);
      setFormData(prev => ({ ...prev, medicineId: '', batchId: '', quantity: '', actualSellingPrice: '' }));
    }
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
    const subtotal = cartItems.reduce((s, it) => s + it.quantity * it.unitPrice, 0);
    const tax = subtotal * (parseFloat(taxPercent || '0') / 100);
    const discount = subtotal * (parseFloat(discountPercent || '0') / 100);
    const total = Math.max(0, subtotal + tax - discount);

    const confirmation = toast({
      title: 'Are you sure?',
      action: (
        <div className="flex gap-2">
          <ToastAction
            altText="Confirm"
            className="bg-green-600 text-white hover:bg-green-700"
            onClick={() => {
              confirmation.dismiss();
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

              const customer = customers.find(c => c.name === customerName);
              const invoice: InvoiceData = {
                invoiceNo: `INV-${Date.now()}`,
                customerName,
                customerAddress: customer?.address || '',
                customerCity: customer?.city || '',
                customerPhone: customer?.phone || '',
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
            }}
          >
            Confirm
          </ToastAction>
          <ToastAction
            altText="Cancel"
            className="bg-gray-600 text-white hover:bg-gray-700"
            onClick={() => confirmation.dismiss()}
          >
            Cancel
          </ToastAction>
        </div>
      ),
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
                <Label htmlFor="customer">Customer Name</Label>
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
                />
                {formData.quantity && selectedBatch && parseInt(formData.quantity) > batchStock && (
                  <p className="text-sm text-red-600">Quantity exceeds available. Only {batchStock} units.</p>
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
                />
                {selectedMedicine && (
                  <div className="space-y-1">
                    {selectedBatch && (
                      <p className="text-sm text-blue-500">
                        Purchase price: PKR {selectedBatch.costPrice.toFixed(2)}
                      </p>
                    )}
                    <p className="text-sm text-blue-500">
                      Expected selling price: PKR {selectedMedicine.price.toFixed(2)}
                    </p>
                  </div>
                )}
                <div className="pt-2">
                  <Button type="button" variant="default" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleAddOrUpdateItem} disabled={!formData.medicineId || !formData.batchId || !formData.quantity || !formData.actualSellingPrice}>{editingIndex !== null ? 'Update Item' : 'Add Item'}</Button>
                </div>
              </div>
            </div>
          </div>

          {/* Per-item total preview removed; totals shown in Cart Items below */}

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
                            <div className="flex items-center justify-end gap-1">
                              <Button type="button" variant="ghost" size="icon" onClick={() => handleEditItem(idx)} title="Edit">
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveItem(idx)} title="Delete">
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-end gap-4">
                <div className="w-full sm:w-64 space-y-3">
                  <div className="flex justify-between py-2">
                    <span className="text-sm text-gray-600">Subtotal:</span>
                    <span className="text-sm font-semibold">PKR {cartItems.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <label htmlFor="taxPercent" className="text-gray-600">Tax (%)</label>
                    <Input
                      id="taxPercent"
                      type="number"
                      step="0.01"
                      min="0"
                      className="w-28 h-8 text-right"
                      value={taxPercent}
                      onChange={(e) => setTaxPercent(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <label htmlFor="discountPercent" className="text-gray-600">Discount (%)</label>
                    <Input
                      id="discountPercent"
                      type="number"
                      step="0.01"
                      min="0"
                      className="w-28 h-8 text-right"
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(e.target.value)}
                    />
                  </div>
                  {(() => {
                    const subtotal = cartItems.reduce((s, it) => s + it.quantity * it.unitPrice, 0);
                    const tax = subtotal * (parseFloat(taxPercent || '0') / 100);
                    const discount = subtotal * (parseFloat(discountPercent || '0') / 100);
                    const total = Math.max(0, subtotal + tax - discount);
                    return (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Tax</span>
                          <span className="font-medium">PKR {tax.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Discount</span>
                          <span className="font-medium">- PKR {discount.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t">
                          <span className="font-semibold">Total</span>
                          <span className="font-semibold">PKR {total.toFixed(2)}</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
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
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={!customerName || cartItems.length === 0}>
            Record Sale
          </Button>
        </div>
      </form>
      <InvoicePreviewDialog
        open={invoiceOpen}
        onOpenChange={setInvoiceOpen}
        invoice={invoiceData}
        taxRate={parseFloat(taxPercent || '0') / 100}
        discountRate={parseFloat(discountPercent || '0') / 100}
      />
    </div>
  );
}