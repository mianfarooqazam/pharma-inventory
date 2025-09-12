'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Package, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Lottie from 'lottie-react';
import loadingAnimation from '@/assets/loading.json';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (!success) {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex relative">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 flex flex-col items-center space-y-4">
            <Lottie 
              animationData={loadingAnimation} 
              style={{ width: 120, height: 120 }}
              loop={true}
            />
            <p className="text-lg font-medium text-gray-700">Signing you in...</p>
          </div>
        </div>
      )}

      {/* Left side - Login Form (50%) */}
      <div className="w-1/2 bg-white flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Card className="border-0 shadow-none">
            <CardHeader className="text-center px-0">
              <div className="flex justify-center mb-6">
                <Package className="h-16 w-16 text-blue-600" />
              </div>
              <CardTitle className="text-3xl font-bold text-gray-900">MediStock</CardTitle>
              <CardDescription className="text-lg text-gray-600 mt-2">
                Medicine Inventory Management System
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="h-12 text-base"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="h-12 text-base"
                    required
                  />
                </div>

                {error && (
                  <div className="flex items-center space-x-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                    <AlertCircle className="h-4 w-4" />
                    <span>{error}</span>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full h-12 text-base bg-blue-600 hover:bg-blue-700" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right side - Blue Background (50%) */}
      <div className="w-1/2 bg-blue-600">
      </div>
    </div>
  );
}