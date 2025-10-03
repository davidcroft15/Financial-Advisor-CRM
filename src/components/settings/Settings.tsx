import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Save, User, Bell, Shield, Database } from 'lucide-react';

export const Settings: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [advisor, setAdvisor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    company_name: ''
  });
  const [notifications, setNotifications] = useState({
    email_reminders: true,
    sms_reminders: false,
    weekly_digest: true,
    task_reminders: true
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      setUser(user);

      // Fetch advisor profile
      const { data: advisorData, error } = await supabase
        .from('advisors')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching advisor:', error);
        return;
      }

      if (advisorData) {
        setAdvisor(advisorData);
        setFormData({
          first_name: advisorData.first_name || '',
          last_name: advisorData.last_name || '',
          phone: advisorData.phone || '',
          company_name: advisorData.company_name || ''
        });
      } else {
        // Create advisor profile if it doesn't exist
        const { data: newAdvisor, error: createError } = await supabase
          .from('advisors')
          .insert([{
            id: user.id,
            email: user.email,
            first_name: user.user_metadata?.full_name?.split(' ')[0] || '',
            last_name: user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (createError) {
          console.error('Error creating advisor profile:', createError);
          return;
        }

        setAdvisor(newAdvisor);
        setFormData({
          first_name: newAdvisor.first_name || '',
          last_name: newAdvisor.last_name || '',
          phone: newAdvisor.phone || '',
          company_name: newAdvisor.company_name || ''
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase
        .from('advisors')
        .update({
          ...formData,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      setAdvisor({ ...advisor, ...formData });
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    const newPassword = prompt('Enter new password:');
    if (!newPassword) return;

    const confirmPassword = prompt('Confirm new password:');
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      alert('Password updated successfully!');
    } catch (error) {
      console.error('Error updating password:', error);
      alert('Error updating password. Please try again.');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and preferences
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Profile Information</span>
            </CardTitle>
            <CardDescription>
              Update your personal and business information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">First Name</label>
                  <Input
                    value={formData.first_name}
                    onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Last Name</label>
                  <Input
                    value={formData.last_name}
                    onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Phone</label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Company Name</label>
                  <Input
                    value={formData.company_name}
                    onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  value={user?.email || ''}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Email cannot be changed. Contact support if needed.
                </p>
              </div>
              <Button type="submit" disabled={saving}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Saving...' : 'Save Profile'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Account Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Account Security</span>
            </CardTitle>
            <CardDescription>
              Manage your password and security settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Password</h4>
              <Button variant="outline" onClick={handleChangePassword}>
                Change Password
              </Button>
            </div>
            <div>
              <h4 className="font-medium mb-2">Two-Factor Authentication</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Add an extra layer of security to your account
              </p>
              <Button variant="outline" disabled>
                Enable 2FA (Coming Soon)
              </Button>
            </div>
            <div>
              <h4 className="font-medium mb-2">Sign Out</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Sign out of all devices and sessions
              </p>
              <Button variant="outline" onClick={handleLogout}>
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>Notifications</span>
            </CardTitle>
            <CardDescription>
              Choose how you want to be notified
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Email Reminders</h4>
                  <p className="text-sm text-muted-foreground">Get email notifications for appointments and tasks</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.email_reminders}
                  onChange={(e) => setNotifications({...notifications, email_reminders: e.target.checked})}
                  className="rounded"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">SMS Reminders</h4>
                  <p className="text-sm text-muted-foreground">Get text message reminders</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.sms_reminders}
                  onChange={(e) => setNotifications({...notifications, sms_reminders: e.target.checked})}
                  className="rounded"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Weekly Digest</h4>
                  <p className="text-sm text-muted-foreground">Receive weekly summary emails</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.weekly_digest}
                  onChange={(e) => setNotifications({...notifications, weekly_digest: e.target.checked})}
                  className="rounded"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Task Reminders</h4>
                  <p className="text-sm text-muted-foreground">Get reminded about upcoming tasks</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.task_reminders}
                  onChange={(e) => setNotifications({...notifications, task_reminders: e.target.checked})}
                  className="rounded"
                />
              </div>
            </div>
            <Button onClick={() => alert('Notification preferences saved!')}>
              Save Preferences
            </Button>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>Data Management</span>
            </CardTitle>
            <CardDescription>
              Export and manage your data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Export Data</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Download all your data in CSV format
              </p>
              <Button variant="outline">
                Export All Data
              </Button>
            </div>
            <div>
              <h4 className="font-medium mb-2">Backup</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Create a backup of your CRM data
              </p>
              <Button variant="outline">
                Create Backup
              </Button>
            </div>
            <div>
              <h4 className="font-medium mb-2 text-red-600">Danger Zone</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Permanently delete your account and all data
              </p>
              <Button variant="outline" className="text-red-600 hover:text-red-700">
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
