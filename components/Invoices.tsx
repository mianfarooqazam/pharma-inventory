"use client";

import { useEffect, useMemo, useState } from "react";
import type { InvoiceData } from "./InvoicePreview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Receipt, Eye, CheckCircle, XCircle } from "lucide-react";
import { InvoicePreviewDialog } from "./InvoicePreviewDialog";
import { useToast } from "@/hooks/use-toast";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useSettings } from "@/contexts/SettingsContext";
import { supabase } from "@/lib/supabase";

interface InvoiceItemRow {
  id: string;
  invoice_no: string;
  date_str: string;
  customer: string;
  city: string;
  address: string;
  amount: number;
  status: "Paid" | "Unpaid";
}

export function Invoices() {
  const { settings } = useSettings();
  const [searchTerm, setSearchTerm] = useState("");
  const [customerFilter, setCustomerFilter] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | 'today' | 'week' | 'month' | 'year'>('month');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceData | null>(null);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [confirmationData, setConfirmationData] = useState<{
    invoiceId: string;
    newStatus: "Paid" | "Unpaid";
    invoiceNo: string;
  } | null>(null);
  const { toast } = useToast();
  
  const [invoices, setInvoices] = useState<InvoiceItemRow[]>([]);

  const customerOptions = useMemo(() => Array.from(new Set(invoices.map(i => i.customer))), [invoices]);

  const loadInvoices = async () => {
    const { data, error } = await supabase.from('v_invoices_list').select('*').order('invoice_no', { ascending: false });
    if (error) {
      console.error('Failed to load invoices:', error.message);
      return;
    }
    setInvoices((data || []) as any);
  };

  useEffect(() => {
    const applyHashFilter = () => {
      const hash = window.location.hash.replace('#', '');
      const [, query] = hash.split('?');
      if (!query) {
        setCustomerFilter(null);
        return;
      }
      const params = new URLSearchParams(query);
      const c = params.get('customer');
      setCustomerFilter(c);
      if (c) setSearchTerm(c);
    };
    applyHashFilter();
    window.addEventListener('hashchange', applyHashFilter);
    return () => window.removeEventListener('hashchange', applyHashFilter);
  }, []);

  useEffect(() => {
    loadInvoices();
  }, []);

  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setHours(0, 0, 0, 0);
  startOfWeek.setDate(now.getDate() - now.getDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  const isInSelectedPeriod = (dateStr: string) => {
    if (selectedPeriod === 'all') return true;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const cd = new Date(d);
    cd.setHours(0, 0, 0, 0);
    switch (selectedPeriod) {
      case 'today':
        return cd.getTime() === today.getTime();
      case 'week':
        return cd.getTime() >= startOfWeek.getTime() && cd.getTime() <= endOfWeek.getTime();
      case 'month':
        return cd.getFullYear() === now.getFullYear() && cd.getMonth() === now.getMonth();
      case 'year':
        return cd.getFullYear() === now.getFullYear();
      default:
        return true;
    }
  };

  const filtered = invoices.filter((i) => {
    const matchesText =
      i.invoice_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.date_str.includes(searchTerm);
    const matchesCustomer = customerFilter
      ? i.customer.toLowerCase() === customerFilter.toLowerCase()
      : true;
    const matchesPeriod = isInSelectedPeriod(i.date_str);
    return matchesText && matchesCustomer && matchesPeriod;
  });

  const handleStatusChange = (invoiceId: string, newStatus: "Paid" | "Unpaid") => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (!invoice) return;

    setConfirmationData({
      invoiceId,
      newStatus,
      invoiceNo: invoice.invoice_no
    });
    setConfirmationOpen(true);
  };

  const confirmStatusChange = async () => {
    if (!confirmationData) return;

    // Fetch invoice row to get amount and customer_id
    const { data: invoiceRow, error: invErr } = await supabase
      .from('invoices')
      .select('id, total, customer_id, status')
      .eq('id', confirmationData.invoiceId)
      .maybeSingle();
    if (invErr || !invoiceRow) {
      console.error('Failed to load invoice before update:', invErr?.message);
      return;
    }

    const prevStatus = invoiceRow.status as 'Paid' | 'Unpaid';

    const { error } = await supabase.from('invoices').update({ status: confirmationData.newStatus }).eq('id', confirmationData.invoiceId);
    if (error) {
      console.error('Failed to update status:', error.message);
      return;
    }

    // Adjust dues only if status changed across Paid/Unpaid boundary and customer exists
    if (invoiceRow.customer_id && confirmationData.newStatus !== prevStatus) {
      const delta = confirmationData.newStatus === 'Unpaid' ? +invoiceRow.total : -invoiceRow.total;
      const { data: cust } = await supabase
        .from('customers')
        .select('outstanding_dues')
        .eq('id', invoiceRow.customer_id)
        .maybeSingle();
      const currentDues = Number(cust?.outstanding_dues || 0);
      await supabase
        .from('customers')
        .update({ outstanding_dues: currentDues + delta })
        .eq('id', invoiceRow.customer_id);
    }

    setConfirmationOpen(false);
    setConfirmationData(null);
    await loadInvoices();
  };

  const previewInvoice = async (row: InvoiceItemRow) => {
    const { data: items, error } = await supabase
      .from('invoice_items')
      .select('quantity, unit_price, batches(batch_number), medicines(name, strength, unit)')
      .eq('invoice_id', row.id);
    if (error) {
      console.error('Failed to load invoice items:', error.message);
      return;
    }
    const parsedItems = (items || []).map((it: any) => ({
      batchNo: it.batches?.batch_number || '',
      medicine: it.medicines ? `${it.medicines.name} ${it.medicines.strength}` : '',
      unit: it.medicines?.unit || '',
      quantity: it.quantity,
      unitPrice: Number(it.unit_price || 0),
    }));
    const invoice: InvoiceData = {
      invoiceNo: row.invoice_no,
      customerName: row.customer,
      customerAddress: row.address,
      customerCity: row.city,
      customerPhone: '',
      date: row.date_str,
      items: parsedItems,
      status: row.status,
    };
    setSelectedInvoice(invoice);
    setPreviewOpen(true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Receipt className="h-5 w-5" />
              <span>Invoices{customerFilter ? ` — ${customerFilter}` : ''}</span>
            </CardTitle>
            
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by invoice no, customer, or date..."
                value={searchTerm}
                onChange={(e) => {
                  const value = e.target.value;
                  setSearchTerm(value);
                  if (value === "") {
                    setCustomerFilter(null);
                    if (window.location.hash.startsWith('#invoices')) {
                      window.location.hash = '#invoices';
                    }
                  }
                }}
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Select value={selectedPeriod} onValueChange={(v) => setSelectedPeriod(v as any)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sr No</TableHead>
                  <TableHead>Invoice No</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((inv, idx) => (
                  <TableRow key={inv.id}>
                    <TableCell className="text-center font-medium">{idx + 1}</TableCell>
                    <TableCell className="font-medium">{inv.invoice_no}</TableCell>
                    <TableCell>{inv.date_str}</TableCell>
                    <TableCell>{inv.customer}</TableCell>
                    <TableCell>{inv.city}</TableCell>
                    <TableCell>Rs. {inv.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm font-medium ${inv.status === 'Paid' ? 'text-green-600' : 'text-red-600'}`}>
                          {inv.status}
                        </span>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStatusChange(inv.id, "Paid")}
                            className={`p-1 h-6 w-6 ${inv.status === 'Paid' ? 'bg-green-100 text-green-600' : 'text-gray-400 hover:text-green-600'}`}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStatusChange(inv.id, "Unpaid")}
                            className={`p-1 h-6 w-6 ${inv.status === 'Unpaid' ? 'bg-red-100 text-red-600' : 'text-gray-400 hover:text-red-600'}`}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => previewInvoice(inv)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <InvoicePreviewDialog
            open={previewOpen}
            onOpenChange={setPreviewOpen}
            invoice={selectedInvoice}
          />
          <ConfirmationDialog
            open={confirmationOpen}
            onOpenChange={setConfirmationOpen}
            title="Confirm Status Change"
            description={`Are you sure you want to mark invoice ${confirmationData?.invoiceNo} as ${confirmationData?.newStatus}?`}
            confirmText={confirmationData?.newStatus === "Paid" ? "Mark as Paid" : "Mark as Unpaid"}
            onConfirm={confirmStatusChange}
            variant={confirmationData?.newStatus === "Paid" ? "default" : "warning"}
          />
        </CardContent>
      </Card>
    </div>
  );
}


