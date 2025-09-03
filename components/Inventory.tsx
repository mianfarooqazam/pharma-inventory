"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
import {
  Search,
  Package,
  Activity,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useInventory, type Batch } from "@/contexts/InventoryContext";
import { formatDate } from "@/lib/utils";

export function Inventory() {
  const { medicines, getMedicineStock, batches } = useInventory();
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const filteredMedicines = medicines.filter(
    (medicine) =>
      medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medicine.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medicine.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStockStatus = (medicine: any) => {
    const actualStock = getMedicineStock(medicine.id);
    if (actualStock <= medicine.minStockLevel) {
      return { label: "Low Stock", variant: "destructive" as const };
    }
    return { label: "In Stock", variant: "default" as const };
  };

  const getStockBreakdown = (medicineId: string): Batch[] => {
    const medicineBatches = batches.filter(
      (batch) => batch.medicineId === medicineId
    );
    
    // Return batches directly instead of aggregating by expiry date
    return medicineBatches
      .filter(batch => batch.quantity > 0)
      .sort((a, b) => a.expiryDate.getTime() - b.expiryDate.getTime());
  };

  const toggleRow = (medicineId: string) => {
    if (expandedRows.has(medicineId)) {
      setExpandedRows(new Set());
    } else {
      setExpandedRows(new Set([medicineId]));
    }
  };

  const totalStock = medicines.reduce(
    (sum, med) => sum + getMedicineStock(med.id),
    0
  );
  const lowStockCount = medicines.filter(
    (med) => getMedicineStock(med.id) <= med.minStockLevel
  ).length;

  // Helper functions for card styling
  const getGradientClass = (title: string) => {
    switch (title) {
      case "Total Medicines":
        return "bg-blue-600";
      case "Total Stock":
        return "bg-green-600";
      case "Low Stock Items":
        return "bg-orange-600";
      default:
        return "bg-gray-600";
    }
  };

  const getIconBgClass = (title: string) => {
    switch (title) {
      case "Total Medicines":
        return "bg-blue-100";
      case "Total Stock":
        return "bg-green-100";
      case "Low Stock Items":
        return "bg-orange-100";
      default:
        return "bg-gray-100";
    }
  };

  const getIconColor = (title: string) => {
    switch (title) {
      case "Total Medicines":
        return "text-blue-600";
      case "Total Stock":
        return "text-green-600";
      case "Low Stock Items":
        return "text-orange-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            title: "Total Medicines",
            value: medicines.length.toString(),
            icon: Package,
            description: "Active medicines",
          },
          {
            title: "Total Stock",
            value: totalStock.toLocaleString(),
            icon: Activity,
            description: "Units in inventory",
          },
          {
            title: "Low Stock Items",
            value: lowStockCount.toString(),
            icon: Package,
            description: "Need attention",
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.title}
              className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden relative"
            >
              {/* Background Color */}
              <div
                className={`absolute inset-0 ${getGradientClass(
                  stat.title
                )} opacity-20 transition-all duration-300`}
              />

              {/* Icon Background */}
              <div
                className={`absolute top-4 right-4 p-3 rounded-full ${getIconBgClass(
                  stat.title
                )} opacity-30 transition-all duration-300`}
              >
                <Icon className={`h-6 w-6 ${getIconColor(stat.title)}`} />
              </div>

              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-gray-700">
                  {stat.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div
                  className={`text-3xl font-bold ${getIconColor(
                    stat.title
                  )} mb-2`}
                >
                  {stat.value}
                </div>
                <p className="text-xs text-gray-600 font-medium">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
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
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead>Min Stock Level</TableHead>
                  <TableHead>Stock Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMedicines.map((medicine, index) => {
                  const stockStatus = getStockStatus(medicine);
                  const actualStock = getMedicineStock(medicine.id);
                  const medicineBatches = batches.filter(
                    (batch) => batch.medicineId === medicine.id
                  );
                  const latestBatch =
                    medicineBatches.length > 0 ? medicineBatches[0] : null;
                  const stockBreakdown = getStockBreakdown(medicine.id);
                  const isExpanded = expandedRows.has(medicine.id);

                  return (
                    <React.Fragment key={medicine.id}>
                      <TableRow>
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
                          <div className="flex items-center space-x-2">
                            {stockBreakdown.length > 1 && (
                              <button
                                onClick={() => toggleRow(medicine.id)}
                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                              >
                                {isExpanded ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </button>
                            )}
                            <span>
                              {latestBatch
                                ? formatDate(latestBatch.expiryDate)
                                : "N/A"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`font-medium ${
                              actualStock <= medicine.minStockLevel
                                ? "text-red-600"
                                : "text-green-600"
                            }`}
                          >
                            {actualStock.toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-gray-600">
                            {medicine.minStockLevel}
                          </span>
                        </TableCell>
                                                 <TableCell>
                           <Badge 
                             variant={stockStatus.label === "In Stock" ? "secondary" : stockStatus.variant}
                             className={stockStatus.label === "In Stock" ? "bg-green-600 text-white hover:bg-green-700" : ""}
                           >
                             {stockStatus.label}
                           </Badge>
                         </TableCell>
                      </TableRow>
                      {isExpanded && (
                        <TableRow>
                          <TableCell
                            style={{ paddingBottom: 0, paddingTop: 0 }}
                            colSpan={9}
                          >
                            <div className="p-4 bg-gray-50">
                              <div>
                                                                 {stockBreakdown.map((batch) => (
                                   <div
                                     key={batch.id}
                                     className="flex items-center space-x-4"
                                   >
                                     <span className="text-sm text-blue-600">
                                       {batch.quantity} units → Expires: {formatDate(batch.expiryDate)}
                                     </span>
                                   </div>
                                 ))}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
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
    </div>
  );
}
