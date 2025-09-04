'use client';

import { useState } from 'react';
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

export function Settings() {
  const [companyInfo, setCompanyInfo] = useState({
    name: 'MediStock Pharmacy',
    phone: '+92-300-1234567',
    address: '123 Medical Street, Health City, Karachi, Pakistan',
    logo: null as File | null
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setCompanyInfo(prev => ({
      ...prev,
      [field]: value
    }));
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

      setCompanyInfo(prev => ({
        ...prev,
        logo: file
      }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    // Here you would typically save to a backend or local storage
    console.log('Saving company info:', companyInfo);
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
                value={companyInfo.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
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
                value={companyInfo.phone}
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
                value={companyInfo.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Enter complete address"
                className="w-full min-h-[100px]"
              />
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
                  <AvatarImage src={logoPreview || undefined} alt="Company Logo" />
                  <AvatarFallback className="text-2xl">
                    {companyInfo.name.split(' ').map(word => word[0]).join('').toUpperCase()}
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

              {companyInfo.logo && (
                <div className="text-center">
                  <p className="text-sm text-green-600">
                    ✓ Logo uploaded: {companyInfo.logo.name}
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
                  <AvatarImage src={logoPreview || undefined} alt="Company Logo" />
                  <AvatarFallback>
                    {companyInfo.name.split(' ').map(word => word[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{companyInfo.name}</h3>
                  <p className="text-sm text-gray-600">{companyInfo.phone}</p>
                  <p className="text-sm text-gray-600">{companyInfo.address}</p>
                </div>
              </div>
              <div className="text-right">
                <h2 className="text-2xl font-bold text-gray-900">INVOICE</h2>
                <p className="text-sm text-gray-600">Invoice #: INV-2024-001</p>
                <p className="text-sm text-gray-600">Date: {new Date().toLocaleDateString('en-GB', { 
                  day: '2-digit', 
                  month: 'short', 
                  year: 'numeric' 
                }).replace(/ /g, '-').toLowerCase()}</p>
                <p className="text-sm text-gray-600">Due Date: {(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)).toLocaleDateString('en-GB', { 
                  day: '2-digit', 
                  month: 'short', 
                  year: 'numeric' 
                }).replace(/ /g, '-').toLowerCase()}</p>
              </div>
            </div>

            {/* Customer Information */}
            <div className="mb-8">
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Bill To:</h4>
                <div className="text-sm text-gray-600">
                  <p className="font-medium">Dr. Ahmed Hassan</p>
                  <p>Karachi Medical Center</p>
                  <p>Block 6, PECHS</p>
                  <p>Karachi, 75400</p>
                  <p>Phone: +92-21-1234567</p>
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
                    <td className="border border-gray-200 px-4 py-3 text-sm text-gray-600">BCH-2024-001</td>
                    <td className="border border-gray-200 px-4 py-3 text-sm text-gray-600">Pantoprazole 40mg</td>
                    <td className="border border-gray-200 px-4 py-3 text-center text-sm text-gray-600">Tablet</td>
                    <td className="border border-gray-200 px-4 py-3 text-center text-sm text-gray-600">30</td>
                    <td className="border border-gray-200 px-4 py-3 text-right text-sm text-gray-600">Rs. 2.50</td>
                    <td className="border border-gray-200 px-4 py-3 text-right text-sm text-gray-600">Rs. 75.00</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 px-4 py-3 text-sm text-gray-600">BCH-2024-002</td>
                    <td className="border border-gray-200 px-4 py-3 text-sm text-gray-600">Amoxicillin 500mg</td>
                    <td className="border border-gray-200 px-4 py-3 text-center text-sm text-gray-600">Capsule</td>
                    <td className="border border-gray-200 px-4 py-3 text-center text-sm text-gray-600">21</td>
                    <td className="border border-gray-200 px-4 py-3 text-right text-sm text-gray-600">Rs. 3.20</td>
                    <td className="border border-gray-200 px-4 py-3 text-right text-sm text-gray-600">Rs. 67.20</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 px-4 py-3 text-sm text-gray-600">BCH-2024-003</td>
                    <td className="border border-gray-200 px-4 py-3 text-sm text-gray-600">Paracetamol 500mg</td>
                    <td className="border border-gray-200 px-4 py-3 text-center text-sm text-gray-600">Tablet</td>
                    <td className="border border-gray-200 px-4 py-3 text-center text-sm text-gray-600">100</td>
                    <td className="border border-gray-200 px-4 py-3 text-right text-sm text-gray-600">Rs. 0.80</td>
                    <td className="border border-gray-200 px-4 py-3 text-right text-sm text-gray-600">Rs. 80.00</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 px-4 py-3 text-sm text-gray-600">BCH-2024-004</td>
                    <td className="border border-gray-200 px-4 py-3 text-sm text-gray-600">Metformin 500mg</td>
                    <td className="border border-gray-200 px-4 py-3 text-center text-sm text-gray-600">Tablet</td>
                    <td className="border border-gray-200 px-4 py-3 text-center text-sm text-gray-600">60</td>
                    <td className="border border-gray-200 px-4 py-3 text-right text-sm text-gray-600">Rs. 1.50</td>
                    <td className="border border-gray-200 px-4 py-3 text-right text-sm text-gray-600">Rs. 90.00</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Totals Section */}
            <div className="flex justify-end mb-8">
              <div className="w-64">
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Subtotal:</span>
                  <span className="text-sm text-gray-900">Rs. 312.20</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Tax (17%):</span>
                  <span className="text-sm text-gray-900">Rs. 53.07</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Discount (5%):</span>
                  <span className="text-sm text-gray-900">-Rs. 15.61</span>
                </div>
                <div className="flex justify-between py-3 bg-gray-50 px-3 rounded">
                  <span className="text-base font-semibold text-gray-900">Total:</span>
                  <span className="text-base font-semibold text-gray-900">Rs. 349.66</span>
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
    </div>
  );
}
