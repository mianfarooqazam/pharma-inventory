'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Search, Edit2, Trash2, Package } from 'lucide-react';
import { useInventory } from '@/contexts/InventoryContext';
import { AddMedicineDialog } from './AddMedicineDialog';
import { EditMedicineDialog } from './EditMedicineDialog';

export function MedicineList() {
  const { medicines, deleteMedicine, getMedicineStock } = useInventory();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<string | null>(null);

  const filteredMedicines = medicines.filter(medicine =>
    medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medicine.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medicine.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStockStatus = (medicine: any) => {
    const actualStock = getMedicineStock(medicine.id);
    if (actualStock <= medicine.minStockLevel) {
      return { label: 'Low Stock', variant: 'destructive' as const };
    } else if (actualStock <= medicine.minStockLevel * 1.5) {
      return { label: 'Medium', variant: 'secondary' as const };
    }
    return { label: 'In Stock', variant: 'default' as const };
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>Medicine Inventory</span>
              </CardTitle>
              <CardDescription>
                Manage your medicine catalog and stock levels
              </CardDescription>
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
                  <TableHead>Medicine</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Manufacturer</TableHead>
                  <TableHead>Strength</TableHead>
                  <TableHead>Stock Status</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMedicines.map((medicine) => {
                  const stockStatus = getStockStatus(medicine);
                  const actualStock = getMedicineStock(medicine.id);
                  
                  return (
                    <TableRow key={medicine.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{medicine.name}</p>
                          <p className="text-sm text-gray-500">{medicine.unit}</p>
                        </div>
                      </TableCell>
                      <TableCell>{medicine.category}</TableCell>
                      <TableCell>{medicine.manufacturer}</TableCell>
                      <TableCell>{medicine.strength}</TableCell>
                      <TableCell>
                        <Badge variant={stockStatus.variant}>
                          {stockStatus.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{actualStock}</span>
                        <span className="text-gray-500 text-sm"> / {medicine.minStockLevel} min</span>
                      </TableCell>
                      <TableCell>PKR {medicine.price.toFixed(2)}</TableCell>
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
                            onClick={() => deleteMedicine(medicine.id)}
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
                {searchTerm ? 'No medicines found matching your search.' : 'No medicines added yet.'}
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
    </div>
  );
}