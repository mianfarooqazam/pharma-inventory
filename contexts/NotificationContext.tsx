'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useInventory } from './InventoryContext';

export interface Notification {
  id: string;
  type: 'low-stock' | 'expiry' | 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'isRead' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { getLowStockMedicines, getExpiringBatches } = useInventory();

  const addNotification = (notification: Omit<Notification, 'id' | 'isRead' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      isRead: false,
      createdAt: new Date(),
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === id ? { ...notif, isRead: true } : notif
    ));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const unreadCount = notifications.filter(notif => !notif.isRead).length;

  // Check for low stock and expiring medicines periodically
  useEffect(() => {
    const checkAlerts = () => {
      const lowStockMedicines = getLowStockMedicines();
      const expiringBatches = getExpiringBatches(30);

      // Add low stock notifications
      lowStockMedicines.forEach(medicine => {
        const existingNotification = notifications.find(
          notif => notif.type === 'low-stock' && notif.message.includes(medicine.name)
        );
        
        if (!existingNotification) {
          addNotification({
            type: 'low-stock',
            title: 'Low Stock Alert',
            message: `${medicine.name} is running low (${medicine.currentStock} remaining)`,
          });
        }
      });

      // Add expiry notifications
      expiringBatches.forEach(batch => {
        const daysUntilExpiry = Math.ceil(
          (batch.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );
        
        const existingNotification = notifications.find(
          notif => notif.type === 'expiry' && notif.message.includes(batch.batchNumber)
        );
        
        if (!existingNotification && daysUntilExpiry <= 30) {
          addNotification({
            type: 'expiry',
            title: 'Expiry Alert',
            message: `${batch.medicineName} (Batch: ${batch.batchNumber}) expires in ${daysUntilExpiry} days`,
          });
        }
      });
    };

    const interval = setInterval(checkAlerts, 30000); // Check every 30 seconds
    checkAlerts(); // Initial check

    return () => clearInterval(interval);
  }, [notifications, getLowStockMedicines, getExpiringBatches]);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      removeNotification,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}