"use client";

import { useState } from "react";
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
import { AddCustomerDialog, NewCustomer } from "./AddCustomerDialog";

interface Customer extends NewCustomer {}

export function Customers() {
  const initialCustomers: Customer[] = [
    { name: "Ali Khan", address: "12 Mall Road", city: "Lahore", phone: "03001234567", outstandingDues: 0 },
    { name: "Sara Ahmed", address: "45 Clifton Block 5", city: "Karachi", phone: "03111234567", outstandingDues: 1250.5 },
    { name: "Usman Iqbal", address: "88 Satellite Town", city: "Rawalpindi", phone: "03211234567", outstandingDues: 300 },
    { name: "Ayesha Noor", address: "7 University Rd", city: "Peshawar", phone: "03331234567", outstandingDues: 0 },
    { name: "Bilal Hussain", address: "19 Jail Road", city: "Lahore", phone: "03011239876", outstandingDues: 950 },
    { name: "Hina Malik", address: "2 Jinnah Avenue", city: "Islamabad", phone: "03451234567", outstandingDues: 0 },
    { name: "Faisal Raza", address: "55 Shahrah-e-Faisal", city: "Karachi", phone: "03021234567", outstandingDues: 4200.75 },
    { name: "Nida Shah", address: "101 MQ Road", city: "Multan", phone: "03151234567", outstandingDues: 110 },
    { name: "Hamza Tariq", address: "6 Cantt Bazaar", city: "Quetta", phone: "03301234567", outstandingDues: 0 },
    { name: "Maryam Zafar", address: "23 Civil Lines", city: "Faisalabad", phone: "03251234567", outstandingDues: 780 }
  ];
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleAddCustomer = (customer: NewCustomer) => {
    setCustomers((prev) => [...prev, customer]);
  };

  const filteredCustomers = customers.filter((c) => {
    const query = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(query) ||
      c.city.toLowerCase().includes(query) ||
      c.phone.toLowerCase().includes(query)
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
                  <TableRow key={`${c.name}-${idx}`}>
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
                        <Button variant="ghost" size="sm">
                        <FileText className="h-4 w-4" />

                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() =>
                            setCustomers((prev) => prev.filter((_, i) => i !== idx))
                          }
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
    </div>
  );
}


