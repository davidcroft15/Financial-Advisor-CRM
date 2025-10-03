import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Shield, Eye, EyeOff, AlertCircle } from 'lucide-react';

interface AdminLoginProps {
  onAdminLogin: (user?: any) => void;
  onBackToUserLogin: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onAdminLogin, onBackToUserLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      console.log('Attempting admin login with:', email);

      // Test admin credentials (for development/testing)
      if (email === 'admin@test.com' && password === 'admin123') {
        console.log('Using test admin credentials');
        onAdminLogin(); // No user passed for test credentials
        return;
      }

      // First, authenticate with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        console.error('Auth error:', authError);
        throw authError;
      }

      // Check if user is admin by looking up in advisors table
      // First try by user_id, then by email as fallback
      let { data: advisorData, error: advisorError } = await supabase
        .from('advisors')
        .select('*')
        .eq('user_id', authData.user.id)
        .eq('role', 'admin')
        .single();

      // If not found by user_id, try by email
      if (advisorError || !advisorData) {
        console.log('Not found by user_id, trying by email...');
        const { data: advisorByEmail, error: emailError } = await supabase
          .from('advisors')
          .select('*')
          .eq('email', authData.user.email)
          .eq('role', 'admin')
          .single();
        
        if (emailError || !advisorByEmail) {
          // Sign out the user since they're not admin
          await supabase.auth.signOut();
          throw new Error('Access denied. Admin privileges required.');
        }
        
        advisorData = advisorByEmail;
        advisorError = null;
      }

      console.log('Admin login successful:', advisorData);
      onAdminLogin(authData.user); // Pass the real Supabase user
    } catch (error: any) {
      console.error('Admin login failed:', error);
      setError(error.message || 'Admin login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Admin Access</CardTitle>
          <CardDescription>
            Enter your admin credentials to access the CRM management panel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label htmlFor="admin-email" className="block text-sm font-medium mb-2">
                Admin Email
              </label>
              <Input
                id="admin-email"
                type="email"
                placeholder="admin@yourcompany.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
              />
            </div>
            <div>
              <label htmlFor="admin-password" className="block text-sm font-medium mb-2">
                Admin Password
              </label>
              <div className="relative">
                <Input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            
            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Verifying Admin Access...' : 'Access Admin Panel'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={onBackToUserLogin}
              className="text-sm text-muted-foreground hover:text-foreground underline"
            >
              Back to User Login
            </button>
          </div>

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-xs text-blue-800">
              <strong>Note:</strong> Admin access is restricted to authorized personnel only. 
              Contact your system administrator if you need access.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
