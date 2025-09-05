"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Receipt, Eye } from "lucide-react";
import { InvoicePreviewDialog } from "./InvoicePreviewDialog";

interface InvoiceItem {
  id: string;
  invoiceNo: string;
  customer: string;
  date: string;
  amount: number;
  status: "Paid" | "Unpaid";
}

export function Invoices() {
  const [searchTerm, setSearchTerm] = useState("");
  const [customerFilter, setCustomerFilter] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceItem | null>(null);
  const [invoices] = useState<InvoiceItem[]>([
    { id: "1", invoiceNo: "INV-1001", customer: "Ali Khan", date: "2025-01-12", amount: 4500, status: "Paid" },
    { id: "2", invoiceNo: "INV-1002", customer: "Sara Ahmed", date: "2025-01-12", amount: 1250.5, status: "Unpaid" },
    { id: "3", invoiceNo: "INV-1003", customer: "Usman Iqbal", date: "2025-01-13", amount: 300, status: "Paid" },
    { id: "4", invoiceNo: "INV-1004", customer: "Ayesha Noor", date: "2025-01-13", amount: 980, status: "Paid" },
    { id: "5", invoiceNo: "INV-1005", customer: "Bilal Hussain", date: "2025-01-14", amount: 950, status: "Unpaid" },
    { id: "6", invoiceNo: "INV-1006", customer: "Ali Khan", date: "2025-01-15", amount: 2100, status: "Paid" },
    { id: "7", invoiceNo: "INV-1007", customer: "Ali Khan", date: "2025-01-20", amount: 760, status: "Unpaid" },
    { id: "8", invoiceNo: "INV-1008", customer: "Sara Ahmed", date: "2025-01-22", amount: 845, status: "Paid" },
    { id: "9", invoiceNo: "INV-1009", customer: "Hina Malik", date: "2025-01-23", amount: 1200, status: "Paid" },
    { id: "10", invoiceNo: "INV-1010", customer: "Faisal Raza", date: "2025-01-24", amount: 4200.75, status: "Unpaid" },
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

  const filtered = invoices.filter((i) => {
    const matchesText =
      i.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.date.includes(searchTerm);
    const matchesCustomer = customerFilter
      ? i.customer.toLowerCase() === customerFilter.toLowerCase()
      : true;
    return matchesText && matchesCustomer;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Receipt className="h-5 w-5" />
              <span>Invoices{customerFilter ? ` — ${customerFilter}` : ''}</span>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select
                value={customerFilter || "all"}
                onValueChange={(val) => {
                  const v = val === "all" ? null : val;
                  setCustomerFilter(v);
                  setSearchTerm(v || "");
                  const base = "#invoices";
                  window.location.hash = v ? `${base}?customer=${encodeURIComponent(v)}` : base;
                }}
              >
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="Filter by customer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Customers</SelectItem>
                  {customerOptions.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by invoice no, customer, or date..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sr No</TableHead>
                  <TableHead>Invoice No</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
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
                    <TableCell>{inv.customer}</TableCell>
                    <TableCell>{inv.date}</TableCell>
                    <TableCell>PKR {inv.amount.toFixed(2)}</TableCell>
                    <TableCell>{inv.status}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedInvoice(inv);
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


