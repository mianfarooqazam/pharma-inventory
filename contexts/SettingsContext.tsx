'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

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
  saveSettings: () => Promise<void>;
  reloadSettings: () => Promise<void>;
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

  const mapFromRow = (row: any): SettingsData => ({
    companyName: row?.company_name || '',
    phone: row?.phone || '',
    address: row?.address || '',
    logo: row?.logo || null,
    invoicePrefix: row?.invoice_prefix || 'INV',
  });

  const reloadSettings = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('owner_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Failed to load settings:', error.message);
      return;
    }

    if (!data) {
      const { data: inserted, error: insertError } = await supabase
        .from('settings')
        .insert([{ 
          company_name: '', 
          phone: '', 
          address: '', 
          logo: null, 
          invoice_prefix: 'INV',
          owner_id: user.id 
        }])
        .select('*')
        .single();

      if (insertError) {
        console.error('Failed to initialize settings:', insertError.message);
        return;
      }
      setSettings(mapFromRow(inserted));
      return;
    }

    setSettings(mapFromRow(data));
  };

  useEffect(() => {
    reloadSettings();
  }, []);

  const updateSettings = (newSettings: Partial<SettingsData>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const saveSettings = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: existing } = await supabase
      .from('settings')
      .select('id')
      .eq('owner_id', user.id)
      .maybeSingle();

    const payload = {
      company_name: settings.companyName,
      phone: settings.phone,
      address: settings.address,
      logo: settings.logo,
      invoice_prefix: settings.invoicePrefix,
      owner_id: user.id,
      updated_at: new Date().toISOString(),
    };

    try {
      if (existing?.id) {
        const { error } = await supabase
          .from('settings')
          .update(payload)
          .eq('id', existing.id);
        if (error) {
          console.error('Failed to update settings:', error.message);
          throw error;
        }
      } else {
        const { error } = await supabase
          .from('settings')
          .insert([payload]);
        if (error) {
          console.error('Failed to insert settings:', error.message);
          throw error;
        }
      }
      
      // Reload settings after successful save
      await reloadSettings();
      console.log('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, saveSettings, reloadSettings }}>
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
