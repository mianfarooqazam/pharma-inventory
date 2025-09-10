'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface SettingsData {
  companyName: string;
  phone: string;
  address: string;
  logo: string | null;
  invoicePrefix: string;
}

interface SettingsContextType {
  settings: SettingsData;
  updateSettings: (newSettings: Partial<SettingsData>) => void;
  saveSettings: () => void;
}

const defaultSettings: SettingsData = {
  companyName: '',
  phone: '',
  address: '',
  logo: null,
  invoicePrefix: 'INV',
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SettingsData>(defaultSettings);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('pharma-settings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsedSettings });
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
  }, []);

  const updateSettings = (newSettings: Partial<SettingsData>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const saveSettings = () => {
    localStorage.setItem('pharma-settings', JSON.stringify(settings));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, saveSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
