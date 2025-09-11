"use client";

import { useEffect, useMemo, useState } from 'react';
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
import { supabase } from '@/lib/supabase';

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

  const [invoices, setInvoices] = useState<any[]>([]);
  const [invoiceItems, setInvoiceItems] = useState<any[]>([]);

  useEffect(() => {
    const loadInvoices = async () => {
      const { data, error } = await supabase.from('v_invoices_list').select('*').order('invoice_no', { ascending: false }).limit(200);
      if (!error) setInvoices(data || []);
    };
    loadInvoices();
  }, []);

  useEffect(() => {
    const loadItems = async () => {
      if (!formData.invoiceId) { setInvoiceItems([]); return; }
      const { data, error } = await supabase
        .from('invoice_items')
        .select('id, quantity, unit_price, batches(batch_number, id), medicines(name, strength, unit, id)')
        .eq('invoice_id', formData.invoiceId);
      if (!error) setInvoiceItems(data || []);
    };
    loadItems();
  }, [formData.invoiceId]);

  const reasons = [
    'Near Expiry',
    'Expired',
    'Damaged',
    'Quality Issue',
    'Wrong Medicine',
    'Other'
  ];

  const filteredInvoices = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    return (invoices || []).filter((invoice: any) =>
      invoice.invoice_no.toLowerCase().includes(searchLower) ||
      (invoice.customer || '').toLowerCase().includes(searchLower) ||
      (invoice.date_str || '').toLowerCase().includes(searchLower)
    );
  }, [invoices, searchTerm]);

  const selectedInvoice = invoices.find((inv: any) => inv.id === formData.invoiceId);
  const selectedItem = invoiceItems.find((it: any) => it.id === formData.itemId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    const qty = parseInt(formData.quantity || '0');
    if (qty <= 0 || qty > selectedItem.quantity) {
      addNotification({ type: 'error', title: 'Invalid Quantity', message: `Max returnable is ${selectedItem.quantity}` });
      return;
    }

    await addTransaction({
      medicineId: selectedItem.medicines.id,
      batchId: selectedItem.batches.id,
      type: 'return',
      quantity: qty,
      unitPrice: Number(selectedItem.unit_price || 0),
      totalAmount: qty * Number(selectedItem.unit_price || 0),
      notes: formData.notes || formData.reason,
      createdBy: null,
    });

    addNotification({ type: 'success', title: 'Return Recorded', message: 'Stock updated.' });
    setFormData({ invoiceId: '', itemId: '', quantity: '', reason: '', notes: '' });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search invoice by number, customer, or date..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Invoice</Label>
          <Select value={formData.invoiceId} onValueChange={(v) => setFormData(prev => ({ ...prev, invoiceId: v, itemId: '' }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select invoice" />
            </SelectTrigger>
            <SelectContent>
              {filteredInvoices.map((inv: any) => (
                <SelectItem key={inv.id} value={inv.id}>
                  {inv.invoice_no} — {inv.customer} ({inv.date_str})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Item</Label>
          <Select value={formData.itemId} onValueChange={(v) => setFormData(prev => ({ ...prev, itemId: v }))} disabled={!formData.invoiceId}>
            <SelectTrigger>
              <SelectValue placeholder="Select item" />
            </SelectTrigger>
            <SelectContent>
              {invoiceItems.map((it: any) => (
                <SelectItem key={it.id} value={it.id}>
                  {it.batches?.batch_number} — {it.medicines?.name} {it.medicines?.strength} ({it.quantity} units)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Quantity</Label>
          <Input value={formData.quantity} onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))} type="number" />
        </div>
        <div className="space-y-2">
          <Label>Reason</Label>
          <Select value={formData.reason} onValueChange={(v) => setFormData(prev => ({ ...prev, reason: v }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select reason" />
            </SelectTrigger>
            <SelectContent>
              {reasons.map(r => (<SelectItem key={r} value={r}>{r}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 col-span-2">
          <Label>Notes</Label>
          <Input value={formData.notes} onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))} />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={!formData.itemId || !formData.quantity}>Record Return</Button>
      </div>
    </form>
  );
}