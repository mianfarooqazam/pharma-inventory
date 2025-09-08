'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent,  CardHeader, CardTitle } from '@/components/ui/card';

import { Tabs, TabsContent } from '@/components/ui/tabs';
import { 
  PackagePlus,
  ShoppingCart,
  RotateCcw,
} from 'lucide-react';
import { Dashboard } from '@/components/Dashboard';
import { MedicineList } from '@/components/MedicineList';
import { Inventory } from '@/components/Inventory';
import { Customers } from '@/components/Customers';
import { Invoices } from '@/components/Invoices';
import { PurchaseForm } from '@/components/PurchaseForm';
import { SaleForm } from '@/components/SaleForm';

import { RevenueProfit } from '@/components/RevenueProfit';
import { Settings } from '@/components/Settings';
import { Navigation } from '@/components/Navigation';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { InventoryProvider } from '@/contexts/InventoryContext';
import { LoginForm } from '@/components/LoginForm';
import { NotificationProvider } from '@/contexts/NotificationContext';


function AppContent() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Sync active tab with URL hash for simple cross-tab navigation
  useEffect(() => {
    const applyHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (!hash) return;
      const [tab] = hash.split('?');
      if (tab) setActiveTab(tab);
    };
    applyHash();
    window.addEventListener('hashchange', applyHash);
    return () => window.removeEventListener('hashchange', applyHash);
  }, []);

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
      
      <main className="container mx-auto px-4 py-6 pt-24">
      

        <Tabs value={activeTab} onValueChange={(val) => { setActiveTab(val); window.location.hash = `#${val}`; }}>
          <TabsContent value="dashboard">
            <Dashboard onNavigate={setActiveTab} />
          </TabsContent>
          
          <TabsContent value="medicines">
            <MedicineList />
          </TabsContent>
          
          <TabsContent value="inventory">
            <Inventory />
          </TabsContent>

          <TabsContent value="customers">
            <Customers />
          </TabsContent>

          <TabsContent value="invoices">
            <Invoices />
          </TabsContent>
          
          <TabsContent value="transactions-purchase">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <PackagePlus className="h-5 w-5" />
                      <span>Purchase</span>
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <PurchaseForm initialType="new" hideTypeSwitcher />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="transactions-sell">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <ShoppingCart className="h-5 w-5" />
                      <span>Sell</span>
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <SaleForm />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="transactions-restock">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <RotateCcw className="h-5 w-5" />
                      <span>Restock</span>
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <PurchaseForm initialType="restock" hideTypeSwitcher />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          

          
          <TabsContent value="users">
            <RevenueProfit />
          </TabsContent>
          
          <TabsContent value="settings">
            <Settings />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <InventoryProvider>
        <NotificationProvider>
          <AppContent />
        </NotificationProvider>
      </InventoryProvider>
    </AuthProvider>
  );
}