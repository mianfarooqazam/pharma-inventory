"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InvoicePreview, InvoiceData } from "./InvoicePreview";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useRef } from "react";

interface InvoicePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: InvoiceData | null;
}

export function InvoicePreviewDialog({ open, onOpenChange, invoice }: InvoicePreviewDialogProps) {
  const contentRef = useRef<HTMLDivElement | null>(null);

  const handleDownload = () => {
    if (!contentRef.current) return;
    const printContents = contentRef.current.innerHTML;
    const printWindow = window.open("", "_blank", "width=1000,height=800");
    if (!printWindow) return;
    const styles = `
      <style>
        body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial, "Apple Color Emoji", "Segoe UI Emoji"; padding: 24px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #e5e7eb; padding: 0.75rem; font-size: 0.875rem; color: #374151; }
        th { background: #f9fafb; font-weight: 600; color: #374151; }
      </style>
    `;
    printWindow.document.write(`<!doctype html><html><head><meta charset='utf-8'/>${styles}</head><body>${printContents}</body></html>`);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[900px]">
        <DialogHeader>
          <div className="flex items-center justify-between w-full">
            <DialogTitle>Invoice Preview</DialogTitle>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" /> Download / Print
            </Button>
          </div>
        </DialogHeader>
        <div ref={contentRef}>
          <InvoicePreview invoice={invoice} />
        </div>
      </DialogContent>
    </Dialog>
  );
}


