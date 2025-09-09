"use client";

import { useEffect, useState } from "react";
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
import { Search, Receipt, Eye } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { InvoicePreviewDialog } from "./InvoicePreviewDialog";

interface InvoiceItem {
  id: string;
  invoiceNo: string;
  customer: string;
  city: string;
  address: string;
  date: string;
  amount: number;
  status: "Paid" | "Unpaid";
}

export function Invoices() {
  const [searchTerm, setSearchTerm] = useState("");
  const [customerFilter, setCustomerFilter] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | 'today' | 'week' | 'month' | 'year'>('all');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceData | null>(null);
  const { toast } = useToast();
  const [invoices] = useState<InvoiceItem[]>([
    { id: "1", invoiceNo: "INV-1001", customer: "Ali Khan", city: "Lahore", address: "12 Mall Road, Lahore", date: "2025-01-12", amount: 4500, status: "Paid" },
    { id: "2", invoiceNo: "INV-1002", customer: "Sara Ahmed", city: "Karachi", address: "45 Clifton Block 5, Karachi", date: "2025-01-12", amount: 1250.5, status: "Unpaid" },
    { id: "3", invoiceNo: "INV-1003", customer: "Usman Iqbal", city: "Rawalpindi", address: "88 Satellite Town, Rawalpindi", date: "2025-01-13", amount: 300, status: "Paid" },
    { id: "4", invoiceNo: "INV-1004", customer: "Ayesha Noor", city: "Peshawar", address: "7 University Rd, Peshawar", date: "2025-01-13", amount: 980, status: "Paid" },
    { id: "5", invoiceNo: "INV-1005", customer: "Bilal Hussain", city: "Lahore", address: "19 Jail Road, Lahore", date: "2025-01-14", amount: 950, status: "Unpaid" },
    { id: "6", invoiceNo: "INV-1006", customer: "Ali Khan", city: "Lahore", address: "12 Mall Road, Lahore", date: "2025-01-15", amount: 2100, status: "Paid" },
    { id: "7", invoiceNo: "INV-1007", customer: "Ali Khan", city: "Lahore", address: "12 Mall Road, Lahore", date: "2025-01-20", amount: 760, status: "Unpaid" },
    { id: "8", invoiceNo: "INV-1008", customer: "Sara Ahmed", city: "Karachi", address: "45 Clifton Block 5, Karachi", date: "2025-01-22", amount: 845, status: "Paid" },
    { id: "9", invoiceNo: "INV-1009", customer: "Hina Malik", city: "Islamabad", address: "2 Jinnah Avenue, Islamabad", date: "2025-01-23", amount: 1200, status: "Paid" },
    { id: "10", invoiceNo: "INV-1010", customer: "Faisal Raza", city: "Karachi", address: "55 Shahrah-e-Faisal, Karachi", date: "2025-01-24", amount: 4200.75, status: "Unpaid" },
  ]);

  const customerOptions = Array.from(new Set(invoices.map(i => i.customer)));

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
      i.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.date.includes(searchTerm);
    const matchesCustomer = customerFilter
      ? i.customer.toLowerCase() === customerFilter.toLowerCase()
      : true;
    const matchesPeriod = isInSelectedPeriod(i.date);
    return matchesText && matchesCustomer && matchesPeriod;
  });

  const [paymentStatus, setPaymentStatus] = useState<{ [key: string]: boolean }>(() =>
    invoices.reduce((acc, inv) => {
      acc[inv.id] = inv.status === "Paid";
      return acc;
    }, {} as { [key: string]: boolean })
  );

  const handlePaymentStatusChange = (invoice: InvoiceItem, nextChecked: boolean) => {
    const confirmation = toast({
      title: "Confirm Payment Status Change",
      description: (
        <div className="space-y-1">
          <div>
            <span className="font-semibold">Invoice #</span>
            <span className="font-semibold">{invoice.invoiceNo}</span>
          </div>
          <div>Customer: {invoice.customer}</div>
          <div>Address: {invoice.address}</div>
          <div className="mt-2">Mark as {nextChecked ? "Paid" : "Unpaid"}?</div>
        </div>
      ),
      action: (
        <div className="flex gap-2">
          <ToastAction
            altText="Confirm"
            onClick={() => {
              confirmation.dismiss();
              setPaymentStatus((prev) => ({ ...prev, [invoice.id]: nextChecked }));
            }}
            className="bg-green-600 text-white hover:bg-green-700"
          >
            Confirm
          </ToastAction>
          <ToastAction
            altText="Cancel"
            onClick={() => confirmation.dismiss()}
            className="bg-gray-600 text-white hover:bg-gray-700"
          >
            Cancel
          </ToastAction>
        </div>
      ),
    });
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
                    <TableCell className="font-medium">{inv.invoiceNo}</TableCell>
                    <TableCell>{inv.date}</TableCell>
                    <TableCell>{inv.customer}</TableCell>
                    <TableCell>{inv.city}</TableCell>
                    <TableCell>PKR {inv.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`inv-paid-${inv.id}`}
                          checked={paymentStatus[inv.id] || false}
                          onCheckedChange={(checked) => handlePaymentStatusChange(inv, checked as boolean)}
                          className={`${paymentStatus[inv.id] ? 'data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600' : 'data-[state=unchecked]:border-red-300'}`}
                        />
                        <label
                          htmlFor={`inv-paid-${inv.id}`}
                          className={`text-sm font-medium leading-none ${paymentStatus[inv.id] ? 'text-green-600' : 'text-red-600'}`}
                        >
                          {paymentStatus[inv.id] ? 'Paid' : 'Unpaid'}
                        </label>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedInvoice({
                              invoiceNo: inv.invoiceNo,
                              customerName: inv.customer,
                              customerAddress: inv.address,
                              customerCity: inv.city,
                              customerPhone: "", // phone not available in mock, keep empty
                              date: inv.date,
                              items: [],
                              status: (paymentStatus[inv.id] ? "Paid" : "Unpaid") as "Paid" | "Unpaid",
                            });
                            setPreviewOpen(true);
                          }}
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
        </CardContent>
      </Card>
    </div>
  );
}


