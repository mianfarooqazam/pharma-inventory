'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { Search, Package, Activity } from 'lucide-react';
import { useInventory } from '@/contexts/InventoryContext';

export function Inventory() {
  const { medicines, getMedicineStock, batches } = useInventory();
  const [searchTerm, setSearchTerm] = useState('');

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

  const totalStock = medicines.reduce((sum, med) => sum + getMedicineStock(med.id), 0);
  const lowStockCount = medicines.filter(med => getMedicineStock(med.id) <= med.minStockLevel).length;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Medicines</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{medicines.length}</div>
            <p className="text-xs text-muted-foreground">Active medicines</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStock.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Units in inventory</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{lowStockCount}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Inventory Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>Inventory Overview</span>
              </CardTitle>
              <CardDescription>
                Complete view of all medicines and their current stock levels
              </CardDescription>
            </div>
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

          {/* Inventory Table */}
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
                  <TableHead>Current Stock</TableHead>
                  <TableHead>Min Stock Level</TableHead>
                  <TableHead>Stock Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMedicines.map((medicine, index) => {
                  const stockStatus = getStockStatus(medicine);
                  const actualStock = getMedicineStock(medicine.id);
                  const medicineBatches = batches.filter(batch => batch.medicineId === medicine.id);
                  const latestBatch = medicineBatches.length > 0 ? medicineBatches[0] : null;
                  
                  return (
                    <TableRow key={medicine.id}>
                      <TableCell className="text-center font-medium">
                        {index + 1}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{medicine.name}</p>
                          <p className="text-sm text-gray-500">{medicine.unit}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{medicine.category}</Badge>
                      </TableCell>
                      <TableCell>{medicine.manufacturer}</TableCell>
                      <TableCell>{medicine.strength}</TableCell>
                      <TableCell>
                        {latestBatch ? latestBatch.batchNumber : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <span className={`font-medium ${
                          actualStock <= medicine.minStockLevel ? 'text-red-600' : 
                          actualStock <= medicine.minStockLevel * 1.5 ? 'text-orange-600' : 
                          'text-green-600'
                        }`}>
                          {actualStock.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-gray-600">{medicine.minStockLevel}</span>
                      </TableCell>
                                             <TableCell>
                         <Badge variant={stockStatus.variant}>
                           {stockStatus.label}
                         </Badge>
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
    </div>
  );
}
