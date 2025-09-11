"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search, Users, FileText, Trash2 } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { AddCustomerDialog, NewCustomer } from "./AddCustomerDialog";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

interface Customer extends NewCustomer {
  id: string;
  created_at: string;
}

export function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<{ id: string; name: string } | null>(null);
  const { toast } = useToast();

  const loadCustomers = async () => {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Failed to fetch customers:', error.message);
      return;
    }
    const mapped = (data || []).map((c: any) => ({
      id: c.id,
      name: c.name,
      address: c.address || '',
      city: c.city || '',
      phone: c.phone || '',
      outstandingDues: Number(c.outstanding_dues || 0),
      created_at: c.created_at,
    }));
    setCustomers(mapped);
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleAddCustomer = async (customer: NewCustomer) => {
    const payload = {
      name: customer.name,
      address: customer.address,
      city: customer.city,
      phone: customer.phone,
      outstanding_dues: customer.outstandingDues || 0,
    };
    const { data, error } = await supabase.from('customers').insert([payload]).select('*').single();
    if (error) {
      console.error('Failed to add customer:', error.message);
      toast({ title: 'Failed to add customer' });
      return;
    }
    setShowAddDialog(false);
    await loadCustomers();
  };

  const handleDeleteClick = (id: string, name: string) => {
    setCustomerToDelete({ id, name });
    setConfirmationOpen(true);
  };

  const confirmDelete = async () => {
    if (!customerToDelete) return;

    // Delete all invoices for this customer (invoice_items cascade automatically)
    await supabase.from('invoices').delete().eq('customer_id', customerToDelete.id);

    const { error } = await supabase.from('customers').delete().eq('id', customerToDelete.id);
    if (error) {
      console.error('Failed to delete customer:', error.message);
      toast({ title: 'Failed to delete customer' });
      return;
    }
    setConfirmationOpen(false);
    setCustomerToDelete(null);
    await loadCustomers();
  };

  const filteredCustomers = customers.filter((c) => {
    const query = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(query) ||
      (c.city || '').toLowerCase().includes(query) ||
      (c.phone || '').toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Customers List</span>
              </CardTitle>
            </div>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Customer
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search customers by name, city, or phone..."
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
                  <TableHead>Customer Name</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Phone Number</TableHead>
                  <TableHead>Outstanding Dues</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((c, idx) => (
                  <TableRow key={c.id}>
                    <TableCell className="text-center font-medium">{idx + 1}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{c.name}</p>
                      </div>
                    </TableCell>
                    <TableCell>{c.address}</TableCell>
                    <TableCell>{c.city}</TableCell>
                    <TableCell>{c.phone}</TableCell>
                    <TableCell>PKR {c.outstandingDues.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const hash = `#invoices?customer=${encodeURIComponent(c.name)}`;
                            window.location.hash = hash;
                          }}
                        >
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span><FileText className="h-4 w-4" /></span>
                              </TooltipTrigger>
                              <TooltipContent>
                                view invoices
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteClick(c.id, c.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredCustomers.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm ? "No customers found matching your search." : "No customers added yet."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <AddCustomerDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAdd={handleAddCustomer}
      />
      <ConfirmationDialog
        open={confirmationOpen}
        onOpenChange={setConfirmationOpen}
        title="Delete Customer"
        description={`Deleting ${customerToDelete?.name} will permanently delete all invoices associated with this customer. This action cannot be undone.`}
        confirmText="Delete Customer"
        onConfirm={confirmDelete}
        variant="destructive"
      />
    </div>
  );
}


