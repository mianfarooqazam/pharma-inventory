'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Settings as SettingsIcon, 
  Building2, 
  Phone, 
  MapPin, 
  Upload, 
  Save,
  Camera
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useSettings } from '@/contexts/SettingsContext';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';

export function Settings() {
  const { settings, updateSettings, saveSettings } = useSettings();
  const [logoPreview, setLogoPreview] = useState<string | null>(settings.logo);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  
  // Local form state - only updates when Save is pressed
  const [formData, setFormData] = useState({
    companyName: settings.companyName,
    phone: settings.phone,
    address: settings.address,
    invoicePrefix: settings.invoicePrefix,
    logo: settings.logo
  });

  // Update local state when settings change externally
  useEffect(() => {
    setFormData({
      companyName: settings.companyName,
      phone: settings.phone,
      address: settings.address,
      invoicePrefix: settings.invoicePrefix,
      logo: settings.logo
    });
    setLogoPreview(settings.logo);
  }, [settings]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB');
        return;
      }

      const logoUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, logo: logoUrl }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    setConfirmationOpen(true);
  };

  const confirmSave = () => {
    // Apply all form data to settings
    updateSettings(formData);
    saveSettings();
    setConfirmationOpen(false);
    alert('Settings saved successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building2 className="h-5 w-5" />
              <span>Company Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Company Name */}
            <div className="space-y-2">
              <Label htmlFor="company-name" className="flex items-center space-x-2">
                <Building2 className="h-4 w-4" />
                <span>Company Name</span>
              </Label>
              <Input
                id="company-name"
                value={formData.companyName}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
                placeholder="Enter company name"
                className="w-full"
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>Phone Number</span>
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Enter phone number"
                className="w-full"
              />
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address" className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>Address</span>
              </Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Enter complete address"
                className="w-full min-h-[100px]"
              />
            </div>

            {/* Invoice Prefix */}
            <div className="space-y-2">
              <Label htmlFor="invoice-prefix" className="flex items-center space-x-2">
                <SettingsIcon className="h-4 w-4" />
                <span>Invoice Prefix</span>
              </Label>
              <Input
                id="invoice-prefix"
                value={formData.invoicePrefix}
                onChange={(e) => handleInputChange('invoicePrefix', e.target.value.toUpperCase())}
                placeholder="Enter 3-letter prefix (e.g., MDP, ABC)"
                className="w-full"
                maxLength={3}
              />
              <p className="text-xs text-gray-500">
                This will be used for all invoice numbers (e.g., {formData.invoicePrefix}-0000-0001)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Logo Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Camera className="h-5 w-5" />
              <span>Company Logo</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Logo Preview */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={logoPreview || formData.logo || undefined} alt="Company Logo" />
                  <AvatarFallback className="text-2xl">
                    {formData.companyName.split(' ').map(word => word[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">
                  Upload your company logo for invoices
                </p>
                <p className="text-xs text-gray-500">
                  Recommended: 200x200px, PNG or JPG, Max 5MB
                </p>
              </div>
            </div>

            {/* Upload Button */}
            <div className="space-y-4">
              <div className="flex flex-col items-center">
                <input
                  type="file"
                  id="logo-upload"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('logo-upload')?.click()}
                  className="flex items-center space-x-2"
                >
                  <Upload className="h-4 w-4" />
                  <span>Upload Logo</span>
                </Button>
              </div>

              {formData.logo && (
                <div className="text-center">
                  <p className="text-sm text-green-600">
                    ✓ Logo uploaded successfully
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview Card */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 bg-white">
            {/* Header Section */}
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={logoPreview || formData.logo || undefined} alt="Company Logo" />
                  <AvatarFallback>
                    {formData.companyName.split(' ').map(word => word[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{formData.companyName}</h3>
                  <p className="text-sm text-gray-600">{formData.phone}</p>
                  <p className="text-sm text-gray-600">{formData.address}</p>
                </div>
              </div>
              <div className="text-right">
                <h2 className="text-2xl font-bold text-gray-900">INVOICE</h2>
                <p className="text-sm text-gray-600">Invoice #: {formData.invoicePrefix}-0000-0001</p>
                <p className="text-sm text-gray-600">Date: {formatDate(new Date())}</p>
                <p className="text-sm text-gray-600">Due Date: {formatDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))}</p>
              </div>
            </div>

            {/* Customer Information */}
            <div className="mb-8">
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Bill To:</h4>
                <div className="text-sm text-gray-600">
                  <p className="font-medium">Customer Name</p>
                  <p>Customer Address</p>
                  <p>City, Postal Code</p>
                  <p>Phone: Customer Phone</p>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-8">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">Batch No</th>
                    <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">Medicine</th>
                    <th className="border border-gray-200 px-4 py-3 text-center text-sm font-semibold text-gray-700">Unit</th>
                    <th className="border border-gray-200 px-4 py-3 text-center text-sm font-semibold text-gray-700">Qty</th>
                    <th className="border border-gray-200 px-4 py-3 text-right text-sm font-semibold text-gray-700">Unit Price</th>
                    <th className="border border-gray-200 px-4 py-3 text-right text-sm font-semibold text-gray-700">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-200 px-4 py-3 text-sm text-gray-600">BCH-001</td>
                    <td className="border border-gray-200 px-4 py-3 text-sm text-gray-600">Medicine Name</td>
                    <td className="border border-gray-200 px-4 py-3 text-center text-sm text-gray-600">Unit</td>
                    <td className="border border-gray-200 px-4 py-3 text-center text-sm text-gray-600">Qty</td>
                    <td className="border border-gray-200 px-4 py-3 text-right text-sm text-gray-600">Rs. 0.00</td>
                    <td className="border border-gray-200 px-4 py-3 text-right text-sm text-gray-600">Rs. 0.00</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Totals Section */}
            <div className="flex justify-end mb-8">
              <div className="w-64">
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Subtotal:</span>
                  <span className="text-sm text-gray-900">Rs. 0.00</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Tax (17%):</span>
                  <span className="text-sm text-gray-900">Rs. 0.00</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Discount (5%):</span>
                  <span className="text-sm text-gray-900">-Rs. 0.00</span>
                </div>
                <div className="flex justify-between py-3 bg-gray-50 px-3 rounded">
                  <span className="text-base font-semibold text-gray-900">Total:</span>
                  <span className="text-base font-semibold text-gray-900">Rs. 0.00</span>
                </div>
              </div>
            </div>


            {/* Footer */}
            <div className="text-center text-sm text-gray-500 border-t border-gray-200 pt-4">
              This is a computer generated slip and does not require signature
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="flex items-center space-x-2">
          <Save className="h-4 w-4" />
          <span>Save Settings</span>
        </Button>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={confirmationOpen}
        onOpenChange={setConfirmationOpen}
        title="Save Settings"
        description="Are you sure you want to save these settings? This will update your company information, logo, and invoice prefix throughout the application."
        confirmText="Save Settings"
        onConfirm={confirmSave}
        variant="default"
      />
    </div>
  );
}
