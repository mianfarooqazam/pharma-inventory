'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Package, ShoppingCart, RotateCcw, Search, QrCode } from 'lucide-react';
import { useInventory } from '@/contexts/InventoryContext';

interface QuickActionsProps {
  onNavigate?: (tab: string) => void;
  onSearchResults?: (results: any[]) => void;
}

export function QuickActions({ onNavigate, onSearchResults }: QuickActionsProps) {
  const { medicines } = useInventory();
  const [searchTerm, setSearchTerm] = useState('');

  const handleRecordPurchase = () => {
    if (onNavigate) {
      onNavigate('purchase-and-sell');
    }
  };

  const handleRecordSale = () => {
    if (onNavigate) {
      onNavigate('purchase-and-sell');
    }
  };

  const handleProcessReturn = () => {
    if (onNavigate) {
      onNavigate('purchase-and-sell');
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    
    if (value.trim() === '') {
      if (onSearchResults) {
        onSearchResults([]);
      }
      return;
    }

    const filteredMedicines = medicines.filter(
      (medicine) =>
        medicine.name.toLowerCase().includes(value.toLowerCase()) ||
        medicine.category.toLowerCase().includes(value.toLowerCase()) ||
        medicine.manufacturer.toLowerCase().includes(value.toLowerCase())
    );

    if (onSearchResults) {
      onSearchResults(filteredMedicines);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="outline" 
            className="flex items-center space-x-2 h-12"
            onClick={handleRecordPurchase}
          >
            <Package className="h-4 w-4" />
            <span className="text-sm">Record Purchase</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="flex items-center space-x-2 h-12"
            onClick={handleRecordSale}
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="text-sm">Record Sale</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="flex items-center space-x-2 h-12"
            onClick={handleProcessReturn}
          >
            <RotateCcw className="h-4 w-4" />
            <span className="text-sm">Process Return</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="flex items-center space-x-2 h-12 opacity-50 cursor-not-allowed"
            disabled
          >
            <QrCode className="h-4 w-4" />
            <span className="text-sm">Scan Barcode</span>
          </Button>
        </div>
        
        <div className="mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Quick search medicines..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}