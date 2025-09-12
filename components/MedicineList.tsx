"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search, Edit2, Trash2, Package } from "lucide-react";
import { useInventory } from "@/contexts/InventoryContext";
import { AddMedicineDialog } from "./AddMedicineDialog";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useToast } from "@/hooks/use-toast";
import { EditMedicineDialog } from "./EditMedicineDialog";

export function MedicineList() {
  const { medicines, deleteMedicine, batches } = useInventory();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<string | null>(null);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [medicineToDelete, setMedicineToDelete] = useState<{ id: string; name: string } | null>(null);
  const { toast } = useToast();

  const filteredMedicines = medicines.filter(
    (medicine) =>
      medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medicine.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medicine.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteClick = (medicineId: string, medicineName: string) => {
    setMedicineToDelete({ id: medicineId, name: medicineName });
    setConfirmationOpen(true);
  };

  const confirmDelete = () => {
    if (!medicineToDelete) return;

    deleteMedicine(medicineToDelete.id);
  };


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>Medicines List</span>
              </CardTitle>
            </div>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Medicine
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search medicines by name, category, or manufacturer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Medicine Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sr No</TableHead>
                  <TableHead>Medicine</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Manufacturer</TableHead>
                  <TableHead>Strength</TableHead>
                  <TableHead>Batch Number</TableHead>
                  <TableHead>Purchase Price</TableHead>
                  <TableHead>Expected Sell Price</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMedicines.map((medicine, index) => {
                  const medicineBatches = batches.filter(
                    (batch) => batch.medicineId === medicine.id
                  );
                  const latestBatch = medicineBatches
                    .slice()
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0] || null;

                  return (
                    <TableRow key={medicine.id}>
                      <TableCell className="text-center font-medium">
                        {index + 1}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{medicine.name}</p>
                          <p className="text-sm text-gray-500">
                            {medicine.unit}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{medicine.category}</TableCell>
                      <TableCell>{medicine.manufacturer}</TableCell>
                      <TableCell>{medicine.strength}</TableCell>
                      <TableCell>
                        {latestBatch ? latestBatch.batchNumber : "N/A"}
                      </TableCell>
                      <TableCell>
                        {latestBatch
                          ? `Rs. ${latestBatch.costPrice.toFixed(2)}`
                          : "N/A"}
                      </TableCell>
                      <TableCell>Rs. {medicine.price.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingMedicine(medicine.id)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(medicine.id, medicine.name)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {filteredMedicines.length === 0 && (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm
                  ? "No medicines found matching your search."
                  : "No medicines added yet."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <AddMedicineDialog open={showAddDialog} onOpenChange={setShowAddDialog} />
      {editingMedicine && (
        <EditMedicineDialog
          medicineId={editingMedicine}
          open={!!editingMedicine}
          onOpenChange={() => setEditingMedicine(null)}
        />
      )}
      <ConfirmationDialog
        open={confirmationOpen}
        onOpenChange={setConfirmationOpen}
        title="Delete Medicine"
        description={`Are you sure you want to delete ${medicineToDelete?.name}? This action cannot be undone.`}
        confirmText="Delete Medicine"
        onConfirm={confirmDelete}
        variant="destructive"
      />
    </div>
  );
}
