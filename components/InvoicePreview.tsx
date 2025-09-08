"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface InvoiceItemData {
  batchNo: string;
  medicine: string;
  unit: string;
  quantity: number;
  unitPrice: number;
}

export interface InvoiceData {
  invoiceNo: string;
  customerName: string;
  date: string;
  items: InvoiceItemData[];
  status: "Paid" | "Unpaid";
}

interface InvoicePreviewProps {
  invoice: InvoiceData | null;
  company?: {
    name: string;
    phone: string;
    address: string;
    logo?: string | null;
  };
  taxRate?: number; // e.g. 0.17 for 17%
  discountRate?: number; // e.g. 0.05 for 5%
}

export function InvoicePreview({ invoice, company, taxRate = 0.17, discountRate = 0.05 }: InvoicePreviewProps) {
  const fallbackCompany = {
    name: "MediStock Pharmacy",
    phone: "+92-300-1234567",
    address: "123 Medical Street, Health City, Karachi, Pakistan",
    logo: null as string | null,
  };
  const c = company || fallbackCompany;
  const initials = c.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const subtotal = invoice ? invoice.items.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0) : 0;
  const tax = Math.round(subtotal * taxRate * 100) / 100;
  const discount = Math.round(subtotal * discountRate * 100) / 100;
  const total = Math.round((subtotal + tax - discount) * 100) / 100;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="max-h-[70vh] overflow-y-auto pr-2">
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 bg-white">
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={c.logo || undefined} alt="Company Logo" />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{c.name}</h3>
                  <p className="text-sm text-gray-600">{c.phone}</p>
                  <p className="text-sm text-gray-600">{c.address}</p>
                </div>
              </div>
              <div className="text-right">
                <h2 className="text-2xl font-bold text-gray-900">INVOICE</h2>
                <p className="text-sm text-gray-600">Invoice #: {invoice?.invoiceNo}</p>
                <p className="text-sm text-gray-600">Date: {invoice?.date}</p>
              </div>
            </div>

            {/* Bill To */}
            <div className="mb-8">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Bill To:</h4>
              <div className="text-sm text-gray-600">
                <p className="font-medium">{invoice?.customerName}</p>
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-8">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">Batch No</th>
                    <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">Medicine</th>
                    <th className="border border-gray-200 px-4 py-3 text-center text-sm font-semibold text-gray-700">Unit</th>
                    <th className="border border-gray-200 px-4 py-3 text-center text-sm font-semibold text-gray-700">Qty</th>
                    <th className="border border-gray-200 px-4 py-3 text-right text-sm font-semibold text-gray-700">Unit Price</th>
                    <th className="border border-gray-200 px-4 py-3 text-right text-sm font-semibold text-gray-700">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice?.items.map((item, idx) => (
                    <tr key={`${item.batchNo}-${idx}`}>
                      <td className="border border-gray-200 px-4 py-3 text-sm text-gray-600">{item.batchNo}</td>
                      <td className="border border-gray-200 px-4 py-3 text-sm text-gray-600">{item.medicine}</td>
                      <td className="border border-gray-200 px-4 py-3 text-center text-sm text-gray-600">{item.unit}</td>
                      <td className="border border-gray-200 px-4 py-3 text-center text-sm text-gray-600">{item.quantity}</td>
                      <td className="border border-gray-200 px-4 py-3 text-right text-sm text-gray-600">Rs. {item.unitPrice.toFixed(2)}</td>
                      <td className="border border-gray-200 px-4 py-3 text-right text-sm text-gray-600">Rs. {(item.quantity * item.unitPrice).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end mb-8">
              <div className="w-64">
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Subtotal:</span>
                  <span className="text-sm text-gray-900">Rs. {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Tax ({Math.round(taxRate * 100)}%):</span>
                  <span className="text-sm text-gray-900">Rs. {tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Discount ({Math.round(discountRate * 100)}%):</span>
                  <span className="text-sm text-gray-900">-Rs. {discount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-3 bg-gray-50 px-3 rounded">
                  <span className="text-base font-semibold text-gray-900">Total:</span>
                  <span className="text-base font-semibold text-gray-900">Rs. {total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-sm text-gray-500 border-top border-gray-200 pt-4">
              This is a computer generated slip and does not require signature
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


