'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  Search,
  Plus,
  Users,
  Calendar,
  DollarSign
} from 'lucide-react';
import { Dashboard } from '@/components/Dashboard';
import { MedicineList } from '@/components/MedicineList';
import { Inventory } from '@/components/Inventory';
import { Customers } from '@/components/Customers';
import { Invoices } from '@/components/Invoices';
import { PurchaseAndSell } from '@/components/PurchaseAndSell';
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
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Purchase</h2>
              <PurchaseForm initialType="new" hideTypeSwitcher />
            </div>
          </TabsContent>
          <TabsContent value="transactions-sell">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Sell</h2>
              <SaleForm />
            </div>
          </TabsContent>
          <TabsContent value="transactions-restock">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Restock</h2>
              <PurchaseForm initialType="restock" hideTypeSwitcher />
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