'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ShoppingCart, RotateCcw, Search, QrCode } from 'lucide-react';

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="flex items-center space-x-2 h-12">
            <Plus className="h-4 w-4" />
            <span className="text-sm">Add Medicine</span>
          </Button>
          
          <Button variant="outline" className="flex items-center space-x-2 h-12">
            <ShoppingCart className="h-4 w-4" />
            <span className="text-sm">Record Sale</span>
          </Button>
          
          <Button variant="outline" className="flex items-center space-x-2 h-12">
            <RotateCcw className="h-4 w-4" />
            <span className="text-sm">Process Return</span>
          </Button>
          
          <Button variant="outline" className="flex items-center space-x-2 h-12">
            <QrCode className="h-4 w-4" />
            <span className="text-sm">Scan Barcode</span>
          </Button>
        </div>
        
        <div className="mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Quick search medicines..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}