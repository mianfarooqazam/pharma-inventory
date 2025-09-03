'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingCart, Package, RotateCcw, History, Activity } from 'lucide-react';
import { PurchaseForm } from './PurchaseForm';
import { SaleForm } from './SaleForm';
import { ReturnForm } from './ReturnForm';
import { TransactionHistory } from './TransactionHistory';

export function PurchaseAndSell() {
  const [activeOperation, setActiveOperation] = useState('purchase');

  const getTabTitle = (tab: string) => {
    switch (tab) {
      case 'purchase':
        return 'Record Purchase';
      case 'sale':
        return 'Record Sale';
      case 'return':
        return 'Record Return';
      case 'history':
        return 'Transaction History';
      default:
        return 'Purchase & Sell';
    }
  };

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'purchase':
        return <Package className="h-5 w-5" />;
      case 'sale':
        return <ShoppingCart className="h-5 w-5" />;
      case 'return':
        return <RotateCcw className="h-5 w-5" />;
      case 'history':
        return <History className="h-5 w-5" />;
      default:
        return <Activity className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {getTabIcon(activeOperation)}
            <span>{getTabTitle(activeOperation)}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeOperation} onValueChange={setActiveOperation}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger 
                value="purchase" 
                className="flex items-center space-x-2 data-[state=active]:bg-black data-[state=active]:text-white"
              >
                <Package className="h-4 w-4" />
                <span>Purchase</span>
              </TabsTrigger>
              <TabsTrigger 
                value="sale" 
                className="flex items-center space-x-2 data-[state=active]:bg-black data-[state=active]:text-white"
              >
                <ShoppingCart className="h-4 w-4" />
                <span>Sale</span>
              </TabsTrigger>
              <TabsTrigger 
                value="return" 
                className="flex items-center space-x-2 data-[state=active]:bg-black data-[state=active]:text-white"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Return</span>
              </TabsTrigger>
              <TabsTrigger 
                value="history" 
                className="flex items-center space-x-2 data-[state=active]:bg-black data-[state=active]:text-white"
              >
                <History className="h-4 w-4" />
                <span>History</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="purchase" className="mt-6">
              <PurchaseForm />
            </TabsContent>

            <TabsContent value="sale" className="mt-6">
              <SaleForm />
            </TabsContent>

            <TabsContent value="return" className="mt-6">
              <ReturnForm />
            </TabsContent>

            <TabsContent value="history" className="mt-6">
              <TransactionHistory />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
