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
import { PurchaseAndSell } from '@/components/PurchaseAndSell';

import { RevenueProfit } from '@/components/RevenueProfit';
import { Navigation } from '@/components/Navigation';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { InventoryProvider } from '@/contexts/InventoryContext';
import { LoginForm } from '@/components/LoginForm';
import { NotificationProvider } from '@/contexts/NotificationContext';


function AppContent() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
      
      <main className="container mx-auto px-4 py-6 pt-24">
      

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="dashboard">
            <Dashboard onNavigate={setActiveTab} />
          </TabsContent>
          
          <TabsContent value="medicines">
            <MedicineList />
          </TabsContent>
          
          <TabsContent value="inventory">
            <Inventory />
          </TabsContent>
          
          <TabsContent value="purchase-and-sell">
            <PurchaseAndSell />
          </TabsContent>
          

          
          <TabsContent value="users">
            <RevenueProfit />
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