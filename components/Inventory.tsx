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
      medicine.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medicine.unit.toLowerCase().includes(searchTerm.toLowerCase())
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


  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {[
          {
            title: "Total Medicines",
            value: medicines.length.toString(),
            icon: Package,
            description: "Active medicines",
            color: "text-blue-600",
            gradient: "from-blue-500 to-blue-700",
            bgGlow: "bg-blue-500/20",
            accent: "bg-blue-500"
          },
          {
            title: "Total Stock",
            value: totalStock.toLocaleString(),
            icon: Activity,
            description: "Units in inventory",
            color: "text-green-600",
            gradient: "from-green-500 to-green-700",
            bgGlow: "bg-green-500/20",
            accent: "bg-green-500"
          },
          {
            title: "Low Stock Items",
            value: lowStockCount.toString(),
            icon: Package,
            description: "Need attention",
            color: "text-orange-600",
            gradient: "from-orange-500 to-orange-700",
            bgGlow: "bg-orange-500/20",
            accent: "bg-orange-500"
          },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card 
              key={stat.title} 
              className="group relative overflow-hidden border-0 bg-white backdrop-blur-sm hover:bg-white/80 transition-all duration-500 scale-105 hover:scale-100 shadow-2xl hover:shadow-lg aspect-square h-48 w-full"
              style={{
                animationDelay: `${index * 100}ms`,
                animation: `fadeInUp 0.6s ease-out forwards ${index * 100}ms`
              }}
            >
              {/* Animated background gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-10 group-hover:opacity-5 transition-opacity duration-500`} />
              
              {/* Glow effect */}
              <div className={`absolute -inset-1 ${stat.bgGlow} rounded-lg blur-lg opacity-30 group-hover:opacity-0 transition-opacity duration-500`} />
              
              {/* Top accent bar */}
              <div className={`absolute top-0 left-0 right-0 h-1 ${stat.accent} opacity-100 group-hover:opacity-60 transition-opacity duration-300`} />
              
              {/* Content */}
              <div className="relative z-10 h-full flex flex-col justify-between p-6">
                {/* Top: Title and Icon */}
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-gray-800 group-hover:text-gray-600 transition-colors duration-300">
                    {stat.title}
                  </CardTitle>
                  <div className="p-2 rounded-lg bg-white shadow-xl group-hover:shadow-lg transition-all duration-300 scale-110 group-hover:scale-100">
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </div>
                
                {/* Center: Amount */}
                <div className="flex-1 flex items-center justify-center">
                  <div className={`text-2xl font-bold ${stat.color} scale-105 group-hover:scale-100 transition-transform duration-300 text-center`}>
                    {stat.value}
                  </div>
                </div>
                
                {/* Bottom: Description */}
                <div className="text-left">
                  <p className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors duration-300">
                    {stat.description}
                  </p>
                </div>
              </div>

              {/* Corner decoration */}
              <div className="absolute bottom-0 right-0 w-20 h-20 opacity-10 group-hover:opacity-5 transition-opacity duration-500">
                <div className={`w-full h-full rounded-tl-full ${stat.accent}`} />
              </div>
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
              placeholder="Search medicines by name, category, manufacturer, or unit..."
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
                  const latestBatch = medicineBatches.length > 0
                    ? medicineBatches.slice().sort((a, b) => a.expiryDate.getTime() - b.expiryDate.getTime())[0]
                    : null;
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
