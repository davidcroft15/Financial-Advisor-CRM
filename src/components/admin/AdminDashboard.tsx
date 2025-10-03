import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ConsultationRequests } from './ConsultationRequests';
import { 
  Users, 
  Shield, 
  Settings, 
  BarChart3, 
  UserPlus, 
  UserMinus, 
  Edit, 
  Trash2, 
  Search,
  LogOut,
  Eye,
  EyeOff,
  Calendar,
  MessageSquare
} from 'lucide-react';

interface Advisor {
  id: string;
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'advisor';
  is_active: boolean;
  created_at: string;
  last_login?: string;
}

export const AdminDashboard: React.FC = () => {
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAdvisor, setEditingAdvisor] = useState<Advisor | null>(null);
  const [currentView, setCurrentView] = useState<'advisors' | 'consultations'>('advisors');
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    role: 'advisor' as 'admin' | 'advisor',
    password: ''
  });

  useEffect(() => {
    fetchAdvisors();
  }, []);

  const fetchAdvisors = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('advisors')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAdvisors(data || []);
    } catch (error) {
      console.error('Error fetching advisors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdvisor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      const { error: insertError } = await supabase
        .from('advisors')
        .insert([
          {
            user_id: authData.user?.id,
            email: formData.email,
            first_name: formData.first_name,
            last_name: formData.last_name,
            role: formData.role,
            is_active: true
          }
        ]);

      if (insertError) throw insertError;

      setFormData({ email: '', first_name: '', last_name: '', role: 'advisor', password: '' });
      setShowAddForm(false);
      fetchAdvisors();
    } catch (error) {
      console.error('Error adding advisor:', error);
    }
  };

  const handleUpdateAdvisor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAdvisor) return;

    try {
      const { error } = await supabase
        .from('advisors')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          role: formData.role
        })
        .eq('id', editingAdvisor.id);

      if (error) throw error;

      setEditingAdvisor(null);
      setFormData({ email: '', first_name: '', last_name: '', role: 'advisor', password: '' });
      fetchAdvisors();
    } catch (error) {
      console.error('Error updating advisor:', error);
    }
  };

  const handleToggleActive = async (advisorId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('advisors')
        .update({ is_active: isActive })
        .eq('id', advisorId);

      if (error) throw error;
      fetchAdvisors();
    } catch (error) {
      console.error('Error toggling advisor status:', error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const filteredAdvisors = advisors.filter(advisor =>
    advisor.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    advisor.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    advisor.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">
            Manage users and system settings
          </p>
        </div>
        <Button onClick={handleLogout} variant="outline">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{advisors.length}</div>
            <p className="text-xs text-muted-foreground">
              {advisors.filter(a => a.is_active).length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {advisors.filter(a => a.role === 'admin').length}
            </div>
            <p className="text-xs text-muted-foreground">
              System administrators
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Advisors</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {advisors.filter(a => a.role === 'advisor').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Financial advisors
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        <Button
          variant={currentView === 'advisors' ? 'default' : 'ghost'}
          onClick={() => setCurrentView('advisors')}
          className="flex items-center"
        >
          <Users className="mr-2 h-4 w-4" />
          User Management
        </Button>
        <Button
          variant={currentView === 'consultations' ? 'default' : 'ghost'}
          onClick={() => setCurrentView('consultations')}
          className="flex items-center"
        >
          <MessageSquare className="mr-2 h-4 w-4" />
          Consultation Requests
        </Button>
      </div>

      {/* Content based on current view */}
      {currentView === 'advisors' ? (
        <div>
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>Manage system users and permissions</CardDescription>
                </div>
                <Button onClick={() => setShowAddForm(true)}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add User
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Users List */}
              <div className="space-y-2">
                {filteredAdvisors.map((advisor) => (
                  <div key={advisor.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        advisor.role === 'admin' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                      }`}>
                        {advisor.role === 'admin' ? <Shield className="h-5 w-5" /> : <Users className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="font-medium">
                          {advisor.first_name} {advisor.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">{advisor.email}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            advisor.role === 'admin' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {advisor.role}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            advisor.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {advisor.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingAdvisor(advisor);
                          setFormData({
                            email: advisor.email,
                            first_name: advisor.first_name,
                            last_name: advisor.last_name,
                            role: advisor.role,
                            password: ''
                          });
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(advisor.id, !advisor.is_active)}
                        className={advisor.is_active ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
                      >
                        {advisor.is_active ? <UserMinus className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Add/Edit User Form */}
          {(showAddForm || editingAdvisor) && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {editingAdvisor ? 'Edit User' : 'Add New User'}
                </CardTitle>
                <CardDescription>
                  {editingAdvisor ? 'Update user information' : 'Create a new system user'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={editingAdvisor ? handleUpdateAdvisor : handleAddAdvisor} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">First Name</label>
                      <Input
                        value={formData.first_name}
                        onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Last Name</label>
                      <Input
                        value={formData.last_name}
                        onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                      disabled={!!editingAdvisor}
                    />
                  </div>

                  {!editingAdvisor && (
                    <div>
                      <label className="text-sm font-medium">Password</label>
                      <Input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        required
                        minLength={6}
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium">Role</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value as 'admin' | 'advisor'})}
                      className="w-full p-2 border border-input rounded-md bg-background"
                    >
                      <option value="advisor">Advisor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowAddForm(false);
                        setEditingAdvisor(null);
                        setFormData({ email: '', first_name: '', last_name: '', role: 'advisor', password: '' });
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingAdvisor ? 'Update User' : 'Add User'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <ConsultationRequests />
      )}
    </div>
  );
};