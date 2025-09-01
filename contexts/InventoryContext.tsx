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
  addMedicine: (medicine: Omit<Medicine, 'id' | 'createdAt'>) => void;
  updateMedicine: (id: string, medicine: Partial<Medicine>) => void;
  deleteMedicine: (id: string) => void;
  addBatch: (batch: Omit<Batch, 'id' | 'createdAt'>) => void;
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

  useEffect(() => {
    // Initialize with sample data
    const sampleMedicines: Medicine[] = [
      {
        id: '1',
        name: 'Paracetamol',
        category: 'Analgesic',
        manufacturer: 'PharmaCorp',
        strength: '500mg',
        unit: 'Tablet',
        minStockLevel: 100,
        currentStock: 250,
        price: 0.50,
        createdAt: new Date(),
      },
      {
        id: '2',
        name: 'Amoxicillin',
        category: 'Antibiotic',
        manufacturer: 'MediLab',
        strength: '250mg',
        unit: 'Capsule',
        minStockLevel: 50,
        currentStock: 75,
        price: 1.20,
        createdAt: new Date(),
      },
      {
        id: '3',
        name: 'Ibuprofen',
        category: 'Anti-inflammatory',
        manufacturer: 'HealthPlus',
        strength: '400mg',
        unit: 'Tablet',
        minStockLevel: 80,
        currentStock: 30,
        price: 0.75,
        createdAt: new Date(),
      },
    ];

    const sampleBatches: Batch[] = [
      {
        id: '1',
        medicineId: '1',
        batchNumber: 'PCT001',
        expiryDate: new Date('2025-12-31'),
        quantity: 250,
        costPrice: 0.40,
        sellingPrice: 0.50,
        createdAt: new Date(),
      },
      {
        id: '2',
        medicineId: '2',
        batchNumber: 'AMX002',
        expiryDate: new Date('2025-03-15'),
        quantity: 75,
        costPrice: 1.00,
        sellingPrice: 1.20,
        createdAt: new Date(),
      },
      {
        id: '3',
        medicineId: '3',
        batchNumber: 'IBU003',
        expiryDate: new Date('2025-02-28'),
        quantity: 30,
        costPrice: 0.60,
        sellingPrice: 0.75,
        createdAt: new Date(),
      },
    ];

    setMedicines(sampleMedicines);
    setBatches(sampleBatches);
  }, []);

  const addMedicine = (medicine: Omit<Medicine, 'id' | 'createdAt'>) => {
    const newMedicine: Medicine = {
      ...medicine,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setMedicines(prev => [...prev, newMedicine]);
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
    setBatches(prev => [...prev, newBatch]);
    
    // Update medicine current stock
    updateMedicine(batch.medicineId, {
      currentStock: getMedicineStock(batch.medicineId) + batch.quantity
    });
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
      // Implement FIFO logic - use oldest batches first
      const medicineBatches = batches
        .filter(b => b.medicineId === transaction.medicineId && b.quantity > 0)
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

      let remainingQuantity = transaction.quantity;
      
      setBatches(prev => prev.map(batch => {
        if (batch.medicineId === transaction.medicineId && remainingQuantity > 0) {
          const usedQuantity = Math.min(remainingQuantity, batch.quantity);
          remainingQuantity -= usedQuantity;
          return { ...batch, quantity: batch.quantity - usedQuantity };
        }
        return batch;
      }));

      // Update medicine current stock
      const currentStock = getMedicineStock(transaction.medicineId);
      updateMedicine(transaction.medicineId, {
        currentStock: currentStock - transaction.quantity
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