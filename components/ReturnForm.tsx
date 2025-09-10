'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search } from 'lucide-react';
import { useInventory } from '@/contexts/InventoryContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { formatDate } from '@/lib/utils';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { useSettings } from '@/contexts/SettingsContext';

export function ReturnForm() {
  const { medicines, batches, transactions, addTransaction } = useInventory();
  const { addNotification } = useNotifications();
  const { settings } = useSettings();
  const [formData, setFormData] = useState({
    invoiceId: '',
    itemId: '',
    quantity: '',
    reason: '',
    notes: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmationOpen, setConfirmationOpen] = useState(false);

  // Mock invoice data with items - in a real app this would come from a context or API
  const [invoices] = useState([
    { 
      id: "1", 
      invoiceNo: `${settings.invoicePrefix}-1001`, 
      customer: "Ali Khan", 
      date: "12-Jan-25", 
      amount: 4500, 
      status: "Paid",
      items: [
        { id: "1-1", medicineName: "Paracetamol", strength: "500mg", quantity: 10, unitPrice: 5.00, totalPrice: 50.00 },
        { id: "1-2", medicineName: "Amoxicillin", strength: "250mg", quantity: 20, unitPrice: 12.50, totalPrice: 250.00 },
        { id: "1-3", medicineName: "Ibuprofen", strength: "400mg", quantity: 15, unitPrice: 8.00, totalPrice: 120.00 }
      ]
    },
    { 
      id: "2", 
      invoiceNo: `${settings.invoicePrefix}-1002`, 
      customer: "Sara Ahmed", 
      date: "12-Jan-25", 
      amount: 1250.5, 
      status: "Unpaid",
      items: [
        { id: "2-1", medicineName: "Aspirin", strength: "100mg", quantity: 30, unitPrice: 2.50, totalPrice: 75.00 },
        { id: "2-2", medicineName: "Vitamin C", strength: "1000mg", quantity: 5, unitPrice: 15.00, totalPrice: 75.00 }
      ]
    },
    { 
      id: "3", 
      invoiceNo: `${settings.invoicePrefix}-1003`, 
      customer: "Usman Iqbal", 
      date: "13-Jan-25", 
      amount: 300, 
      status: "Paid",
      items: [
        { id: "3-1", medicineName: "Cetirizine", strength: "10mg", quantity: 20, unitPrice: 3.00, totalPrice: 60.00 }
      ]
    },
    { 
      id: "4", 
      invoiceNo: `${settings.invoicePrefix}-1004`, 
      customer: "Ayesha Noor", 
      date: "13-Jan-25", 
      amount: 980, 
      status: "Paid",
      items: [
        { id: "4-1", medicineName: "Metformin", strength: "500mg", quantity: 10, unitPrice: 8.50, totalPrice: 85.00 },
        { id: "4-2", medicineName: "Omeprazole", strength: "20mg", quantity: 15, unitPrice: 6.00, totalPrice: 90.00 }
      ]
    },
    { 
      id: "5", 
      invoiceNo: `${settings.invoicePrefix}-1005`, 
      customer: "Bilal Hussain", 
      date: "14-Jan-25", 
      amount: 950, 
      status: "Unpaid",
      items: [
        { id: "5-1", medicineName: "Lisinopril", strength: "10mg", quantity: 12, unitPrice: 7.50, totalPrice: 90.00 }
      ]
    }
  ]);

  const reasons = [
    'Near Expiry',
    'Expired',
    'Damaged',
    'Quality Issue',
    'Wrong Medicine',
    'Other'
  ];

  // Filter invoices based on search term - only show when user has searched
  const filteredInvoices = searchTerm ? invoices.filter(invoice => {
    const searchLower = searchTerm.toLowerCase();
    return (
      invoice.invoiceNo.toLowerCase().includes(searchLower) ||
      invoice.customer.toLowerCase().includes(searchLower) ||
      invoice.date.toLowerCase().includes(searchLower)
    );
  }) : [];

  const selectedInvoice = invoices.find(inv => inv.id === formData.invoiceId);
  const selectedItem = selectedInvoice?.items.find(item => item.id === formData.itemId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedInvoice || !selectedItem) {
      addNotification({
        type: 'error',
        title: 'No Item Selected',
        message: 'Please select an invoice and medicine item to process the return',
      });
      return;
    }

    const returnQuantity = parseInt(formData.quantity);
    
    if (returnQuantity <= 0) {
      addNotification({
        type: 'error',
        title: 'Invalid Return Quantity',
        message: 'Please enter a valid quantity to return',
      });
      return;
    }

    if (returnQuantity > selectedItem.quantity) {
      addNotification({
        type: 'error',
        title: 'Invalid Return Quantity',
        message: `Cannot return more than ${selectedItem.quantity} units (available in invoice)`,
      });
      return;
    }

    // Show confirmation dialog instead of directly processing
    setConfirmationOpen(true);
  };

  const confirmReturn = () => {
    if (!selectedInvoice || !selectedItem) return;

    const returnQuantity = parseInt(formData.quantity);
    const refundAmount = returnQuantity * selectedItem.unitPrice;

    // Record return transaction
    addTransaction({
      medicineId: '', // No specific medicine ID for invoice-based returns
      batchId: '', // No specific batch ID for invoice-based returns
      type: 'return',
      quantity: returnQuantity,
      unitPrice: selectedItem.unitPrice,
      totalAmount: refundAmount,
      notes: `Invoice ${selectedInvoice.invoiceNo} - ${selectedItem.medicineName} ${selectedItem.strength} - ${formData.reason}: ${formData.notes}`,
      createdBy: 'current-user',
    });

    addNotification({
      type: 'success',
      title: 'Return Processed',
      message: `Successfully recorded return for invoice ${selectedInvoice.invoiceNo} - ${returnQuantity} units of ${selectedItem.medicineName} ${selectedItem.strength}`,
    });

    // Reset form
    setFormData({
      invoiceId: '',
      itemId: '',
      quantity: '',
      reason: '',
      notes: '',
    });

    // Close confirmation dialog
    setConfirmationOpen(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search invoices for return..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Available Invoices for Return */}
          <div className="space-y-4">
            {!searchTerm ? (
              <div className="text-center py-8 text-gray-500">
                <p>Search for an invoice number to view available invoices for return</p>
              </div>
            ) : filteredInvoices.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No invoices found matching "{searchTerm}"</p>
              </div>
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>S.No</TableHead>
                      <TableHead>Invoice No</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.map((invoice, index) => (
                      <TableRow key={invoice.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">{invoice.invoiceNo}</TableCell>
                        <TableCell>{invoice.date}</TableCell>
                        <TableCell>{invoice.customer}</TableCell>
                        <TableCell>PKR {invoice.amount.toFixed(2)}</TableCell>
                        <TableCell>
                          <span className={`text-sm font-medium ${invoice.status === 'Paid' ? 'text-green-600' : 'text-red-600'}`}>
                            {invoice.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant={selectedInvoice?.id === invoice.id ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              handleInputChange('invoiceId', invoice.id);
                              handleInputChange('itemId', ''); // Reset item selection when changing invoice
                            }}
                          >
                            {selectedInvoice?.id === invoice.id ? 'Selected' : 'Select'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          {/* Invoice Items Selection */}
          {selectedInvoice && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Select Medicine to Return from Invoice {selectedInvoice.invoiceNo}</h3>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>S.No</TableHead>
                      <TableHead>Medicine Name</TableHead>
                      <TableHead>Strength</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Total Price</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedInvoice.items.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">{item.medicineName}</TableCell>
                        <TableCell>{item.strength}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>PKR {item.unitPrice.toFixed(2)}</TableCell>
                        <TableCell>PKR {item.totalPrice.toFixed(2)}</TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant={selectedItem?.id === item.id ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleInputChange('itemId', item.id)}
                          >
                            {selectedItem?.id === item.id ? 'Selected' : 'Select'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Return Form */}
          {selectedItem && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Return Details for {selectedItem.medicineName} {selectedItem.strength}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Return Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => handleInputChange('quantity', e.target.value)}
                    placeholder="Enter quantity to return"
                    max={selectedItem.quantity}
                    required
                    className={formData.quantity && parseInt(formData.quantity) > selectedItem.quantity ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                  />
                  <p className={`text-sm ${formData.quantity && parseInt(formData.quantity) > selectedItem.quantity ? 'text-red-500' : 'text-gray-500'}`}>
                    Maximum: {selectedItem.quantity} units available
                    {formData.quantity && parseInt(formData.quantity) > selectedItem.quantity && (
                      <span className="block text-red-500 font-medium">
                        Cannot return more than {selectedItem.quantity} units
                      </span>
                    )}
                  </p>
                </div>

                <div className="space-y-2">
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

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="notes">Description</Label>
                  <Input
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Optional description"
                  />
                </div>
              </div>

              {formData.quantity && (
                <div className="bg-blue-600 border-blue-600 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-medium">Refund Amount:</span>
                    <span className="font-bold text-lg text-white">
                      PKR {(parseInt(formData.quantity) * selectedItem.unitPrice).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2">
          <Button 
            type="submit" 
            disabled={
              !formData.invoiceId || 
              !formData.itemId || 
              !formData.quantity || 
              !formData.reason ||
              (formData.quantity ? parseInt(formData.quantity) > (selectedItem?.quantity || 0) : false)
            }
          >
            Process Return
          </Button>
        </div>
      </form>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={confirmationOpen}
        onOpenChange={setConfirmationOpen}
        title="Confirm Return"
        description={
          selectedItem ? 
            `Are you sure you want to return ${formData.quantity} units of ${selectedItem.medicineName} ${selectedItem.strength} from invoice ${selectedInvoice?.invoiceNo}?` :
            'Please select an item to return.'
        }
        confirmText="Process Return"
        onConfirm={confirmReturn}
        variant="default"
      />
    </div>
  );
}