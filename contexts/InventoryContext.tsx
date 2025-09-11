'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

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
  createdBy: string | null;
}

interface InventoryContextType {
  medicines: Medicine[];
  batches: Batch[];
  transactions: StockTransaction[];
  addMedicine: (medicine: Omit<Medicine, 'id' | 'createdAt' | 'currentStock'>) => Promise<Medicine | null>;
  updateMedicine: (id: string, medicine: Partial<Medicine>) => Promise<void>;
  deleteMedicine: (id: string) => Promise<void>;
  addBatch: (batch: Omit<Batch, 'id' | 'createdAt'>) => Promise<Batch | null>;
  addTransaction: (transaction: Omit<StockTransaction, 'id' | 'createdAt'>) => Promise<void>;
  getLowStockMedicines: () => Medicine[];
  getExpiringBatches: (days?: number) => (Batch & { medicineName: string })[];
  getMedicineStock: (medicineId: string) => number;
  reloadAll: () => Promise<void>;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);

  const mapMedicine = (row: any): Medicine => ({
    id: row.id,
    name: row.name,
    category: row.category,
    manufacturer: row.manufacturer,
    strength: row.strength,
    unit: row.unit,
    description: row.description ?? undefined,
    minStockLevel: row.min_stock_level ?? 0,
    currentStock: row.current_stock ?? 0,
    price: Number(row.price ?? 0),
    createdAt: row.created_at ? new Date(row.created_at) : new Date(),
  });

  const mapBatch = (row: any): Batch => ({
    id: row.id,
    medicineId: row.medicine_id,
    batchNumber: row.batch_number,
    expiryDate: row.expiry_date ? new Date(row.expiry_date) : new Date(),
    quantity: row.quantity ?? 0,
    costPrice: Number(row.cost_price ?? 0),
    sellingPrice: Number(row.selling_price ?? 0),
    createdAt: row.created_at ? new Date(row.created_at) : new Date(),
  });

  const mapTransaction = (row: any): StockTransaction => ({
    id: row.id,
    medicineId: row.medicine_id,
    batchId: row.batch_id,
    type: row.type,
    quantity: row.quantity,
    unitPrice: Number(row.unit_price ?? 0),
    totalAmount: Number(row.total_amount ?? 0),
    notes: row.notes ?? undefined,
    createdAt: row.created_at ? new Date(row.created_at) : new Date(),
    createdBy: row.created_by ?? null,
  });

  const reloadMedicines = async () => {
    const { data, error } = await supabase.from('medicines').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error('Failed to load medicines:', error.message);
      return;
    }
    setMedicines((data || []).map(mapMedicine));
  };

  const reloadBatches = async () => {
    const { data, error } = await supabase.from('batches').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error('Failed to load batches:', error.message);
      return;
    }
    setBatches((data || []).map(mapBatch));
  };

  const reloadTransactions = async () => {
    const { data, error } = await supabase
      .from('stock_transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);
    if (error) {
      console.error('Failed to load transactions:', error.message);
      return;
    }
    setTransactions((data || []).map(mapTransaction));
  };

  const reloadAll = async () => {
    await Promise.all([reloadMedicines(), reloadBatches(), reloadTransactions()]);
  };

  useEffect(() => {
    reloadAll();
  }, []);

  const addMedicine = async (medicine: Omit<Medicine, 'id' | 'createdAt' | 'currentStock'>): Promise<Medicine | null> => {
    const payload = {
      name: medicine.name,
      category: medicine.category,
      manufacturer: medicine.manufacturer,
      strength: medicine.strength,
      unit: medicine.unit,
      description: medicine.description ?? null,
      min_stock_level: medicine.minStockLevel,
      current_stock: 0,
      price: medicine.price,
    };
    const { data, error } = await supabase.from('medicines').insert([payload]).select('*').single();
    if (error) {
      console.error('Failed to add medicine:', error.message);
      return null;
    }
    const mapped = mapMedicine(data);
    setMedicines(prev => [mapped, ...prev]);
    return mapped;
  };

  const updateMedicine = async (id: string, updates: Partial<Medicine>) => {
    const payload: any = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.category !== undefined) payload.category = updates.category;
    if (updates.manufacturer !== undefined) payload.manufacturer = updates.manufacturer;
    if (updates.strength !== undefined) payload.strength = updates.strength;
    if (updates.unit !== undefined) payload.unit = updates.unit;
    if (updates.description !== undefined) payload.description = updates.description ?? null;
    if (updates.minStockLevel !== undefined) payload.min_stock_level = updates.minStockLevel;
    if (updates.price !== undefined) payload.price = updates.price;
    const { error } = await supabase.from('medicines').update(payload).eq('id', id);
    if (error) {
      console.error('Failed to update medicine:', error.message);
      return;
    }
    await reloadMedicines();
  };

  const deleteMedicine = async (id: string) => {
    const { error } = await supabase.from('medicines').delete().eq('id', id);
    if (error) {
      console.error('Failed to delete medicine:', error.message);
      return;
    }
    setMedicines(prev => prev.filter(m => m.id !== id));
    setBatches(prev => prev.filter(b => b.medicineId !== id));
  };

  const addBatch = async (batch: Omit<Batch, 'id' | 'createdAt'>): Promise<Batch | null> => {
    const payload = {
      medicine_id: batch.medicineId,
      batch_number: batch.batchNumber,
      expiry_date: batch.expiryDate instanceof Date ? batch.expiryDate.toISOString().slice(0, 10) : batch.expiryDate,
      quantity: batch.quantity,
      cost_price: batch.costPrice,
      selling_price: batch.sellingPrice,
    };
    const { data, error } = await supabase.from('batches').insert([payload]).select('*').single();
    if (error) {
      console.error('Failed to add batch:', error.message);
      return null;
    }
    const mapped = mapBatch(data);
    setBatches(prev => [mapped, ...prev]);
    await reloadMedicines(); // current_stock updated by DB trigger
    return mapped;
  };

  const addTransaction = async (transaction: Omit<StockTransaction, 'id' | 'createdAt'>) => {
    const payload = {
      medicine_id: transaction.medicineId,
      batch_id: transaction.batchId,
      type: transaction.type,
      quantity: transaction.quantity,
      unit_price: transaction.unitPrice,
      total_amount: transaction.totalAmount,
      notes: transaction.notes ?? null,
      created_by: transaction.createdBy ?? null,
    };
    const { data, error } = await supabase.from('stock_transactions').insert([payload]).select('*').single();
    if (error) {
      console.error('Failed to add transaction:', error.message);
      return;
    }
    const mapped = mapTransaction(data);
    setTransactions(prev => [mapped, ...prev]);
    await Promise.all([reloadBatches(), reloadMedicines()]);
  };

  const getLowStockMedicines = (): Medicine[] => {
    return medicines.filter(med => (med.currentStock ?? 0) <= (med.minStockLevel ?? 0));
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
    return medicines.find(m => m.id === medicineId)?.currentStock ?? 0;
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
      reloadAll,
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