'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Medicine {
  id: string;
  name: string;
  category: string;
  manufacturer: string;
  strength: string;
  unit: string;
  description?: string;
  minStockLevel: number;
  currentStock: number;
  price: number;
  createdAt: Date;
}

export interface Batch {
  id: string;
  medicineId: string;
  batchNumber: string;
  expiryDate: Date;
  quantity: number;
  costPrice: number;
  sellingPrice: number;
  createdAt: Date;
}

export interface StockTransaction {
  id: string;
  medicineId: string;
  batchId: string;
  type: 'purchase' | 'sale' | 'return';
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  notes?: string;
  createdAt: Date;
  createdBy: string;
}

interface InventoryContextType {
  medicines: Medicine[];
  batches: Batch[];
  transactions: StockTransaction[];
  addMedicine: (medicine: Omit<Medicine, 'id' | 'createdAt'>) => Medicine;
  updateMedicine: (id: string, medicine: Partial<Medicine>) => void;
  deleteMedicine: (id: string) => void;
  addBatch: (batch: Omit<Batch, 'id' | 'createdAt'>) => Batch;
  addTransaction: (transaction: Omit<StockTransaction, 'id' | 'createdAt'>) => void;
  getLowStockMedicines: () => Medicine[];
  getExpiringBatches: (days?: number) => (Batch & { medicineName: string })[];
  getMedicineStock: (medicineId: string) => number;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);

  // Initialize with empty arrays - data will be loaded from API or user input
  // useEffect(() => {
  //   // Load data from API or localStorage
  // }, []);

  const addMedicine = (medicine: Omit<Medicine, 'id' | 'createdAt'>) => {
    const newMedicine: Medicine = {
      ...medicine,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setMedicines(prev => [...prev, newMedicine]);
    return newMedicine; // Return the newly created medicine
  };

  const updateMedicine = (id: string, updates: Partial<Medicine>) => {
    setMedicines(prev => prev.map(med => 
      med.id === id ? { ...med, ...updates } : med
    ));
  };

  const deleteMedicine = (id: string) => {
    setMedicines(prev => prev.filter(med => med.id !== id));
    setBatches(prev => prev.filter(batch => batch.medicineId !== id));
  };

  const addBatch = (batch: Omit<Batch, 'id' | 'createdAt'>) => {
    const newBatch: Batch = {
      ...batch,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setBatches(prev => {
      const updatedBatches = [...prev, newBatch];
      
      // Calculate new stock after adding the batch
      const newStock = updatedBatches
        .filter(b => b.medicineId === batch.medicineId)
        .reduce((total, b) => total + b.quantity, 0);
      
      // Update medicine current stock
      updateMedicine(batch.medicineId, {
        currentStock: newStock
      });
      
      return updatedBatches;
    });
    
    return newBatch;
  };

  const addTransaction = (transaction: Omit<StockTransaction, 'id' | 'createdAt'>) => {
    const newTransaction: StockTransaction = {
      ...transaction,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setTransactions(prev => [...prev, newTransaction]);

    // Update batch quantities based on transaction type
    if (transaction.type === 'sale') {
      // Update the specific batch that was sold from
      setBatches(prev => {
        const updatedBatches = prev.map(batch => {
          if (batch.id === transaction.batchId) {
            return { ...batch, quantity: batch.quantity - transaction.quantity };
          }
          return batch;
        });
        
        // Calculate new stock after batch updates
        const newStock = updatedBatches
          .filter(batch => batch.medicineId === transaction.medicineId)
          .reduce((total, batch) => total + batch.quantity, 0);
        
        // Update medicine current stock
        updateMedicine(transaction.medicineId, {
          currentStock: newStock
        });
        
        return updatedBatches;
      });
    } else if (transaction.type === 'return') {
      // Restore stock for returns
      setBatches(prev => {
        const updatedBatches = prev.map(batch => {
          if (batch.id === transaction.batchId) {
            return { ...batch, quantity: batch.quantity + transaction.quantity };
          }
          return batch;
        });
        
        // Calculate new stock after batch updates
        const newStock = updatedBatches
          .filter(batch => batch.medicineId === transaction.medicineId)
          .reduce((total, batch) => total + batch.quantity, 0);
        
        // Update medicine current stock
        updateMedicine(transaction.medicineId, {
          currentStock: newStock
        });
        
        return updatedBatches;
      });
    }
  };

  const getLowStockMedicines = (): Medicine[] => {
    return medicines.filter(med => med.currentStock <= med.minStockLevel);
  };

  const getExpiringBatches = (days: number = 30): (Batch & { medicineName: string })[] => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + days);
    
    return batches
      .filter(batch => batch.expiryDate <= cutoffDate && batch.quantity > 0)
      .map(batch => ({
        ...batch,
        medicineName: medicines.find(med => med.id === batch.medicineId)?.name || 'Unknown'
      }))
      .sort((a, b) => a.expiryDate.getTime() - b.expiryDate.getTime());
  };

  const getMedicineStock = (medicineId: string): number => {
    return batches
      .filter(batch => batch.medicineId === medicineId)
      .reduce((total, batch) => total + batch.quantity, 0);
  };

  return (
    <InventoryContext.Provider value={{
      medicines,
      batches,
      transactions,
      addMedicine,
      updateMedicine,
      deleteMedicine,
      addBatch,
      addTransaction,
      getLowStockMedicines,
      getExpiringBatches,
      getMedicineStock,
    }}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
}