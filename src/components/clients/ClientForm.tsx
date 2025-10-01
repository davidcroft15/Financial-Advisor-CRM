import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Client } from '../../types';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { X, Save } from 'lucide-react';

interface ClientFormProps {
  client: Client | null;
  onSave: () => void;
  onCancel: () => void;
}

export const ClientForm: React.FC<ClientFormProps> = ({ client, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    personal_details: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      address: {
        street: '',
        city: '',
        state: '',
        zip: '',
        country: 'US'
      },
      date_of_birth: '',
      occupation: ''
    },
    financial_details: {
      income: 0,
      expenses: 0,
      assets: 0,
      liabilities: 0,
      insurance_policies: [] as any[],
      investments: [] as any[]
    },
    tags: [] as string[],
    status: 'active' as 'active' | 'inactive' | 'prospect',
    notes: ''
  });
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (client && client.personal_details) {
      setFormData({
        personal_details: client.personal_details,
        financial_details: client.financial_details || {
          income: 0,
          expenses: 0,
          assets: 0,
          liabilities: 0,
          insurance_policies: [],
          investments: []
        },
        tags: client.tags || [],
        status: client.status || 'active',
        notes: client.notes || ''
      });
    }
  }, [client]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedInputChange = (parentField: string, childField: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parentField]: {
        ...(prev[parentField as keyof typeof prev] as any),
        [childField]: value
      }
    }));
  };

  const handleAddressChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      personal_details: {
        ...prev.personal_details,
        address: {
          ...prev.personal_details.address,
          [field]: value
        }
      }
    }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('No user found');
        return;
      }

      const clientData = {
        ...formData,
        advisor_id: user.id,
        updated_at: new Date().toISOString()
      };

      if (client?.id) {
        // Update existing client
        const { error } = await supabase
          .from('clients')
          .update(clientData)
          .eq('id', client.id);

        if (error) throw error;
      } else {
        // Create new client
        const { error } = await supabase
          .from('clients')
          .insert([clientData]);

        if (error) throw error;
      }

      onSave();
    } catch (error) {
      console.error('Error saving client:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>
            {client?.id ? 'Edit Client' : 'Add New Client'}
          </CardTitle>
          <CardDescription>
            {client?.id ? 'Update client information' : 'Enter client details to add them to your CRM'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">First Name *</label>
                  <Input
                    value={formData.personal_details.first_name}
                    onChange={(e) => handleNestedInputChange('personal_details', 'first_name', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Last Name *</label>
                  <Input
                    value={formData.personal_details.last_name}
                    onChange={(e) => handleNestedInputChange('personal_details', 'last_name', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Email *</label>
                  <Input
                    type="email"
                    value={formData.personal_details.email}
                    onChange={(e) => handleNestedInputChange('personal_details', 'email', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Phone</label>
                  <Input
                    value={formData.personal_details.phone}
                    onChange={(e) => handleNestedInputChange('personal_details', 'phone', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Date of Birth</label>
                  <Input
                    type="date"
                    value={formData.personal_details.date_of_birth}
                    onChange={(e) => handleNestedInputChange('personal_details', 'date_of_birth', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Occupation</label>
                  <Input
                    value={formData.personal_details.occupation}
                    onChange={(e) => handleNestedInputChange('personal_details', 'occupation', e.target.value)}
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <h4 className="text-md font-medium">Address</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium">Street Address</label>
                    <Input
                      value={formData.personal_details.address.street}
                      onChange={(e) => handleAddressChange('street', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">City</label>
                    <Input
                      value={formData.personal_details.address.city}
                      onChange={(e) => handleAddressChange('city', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">State</label>
                    <Input
                      value={formData.personal_details.address.state}
                      onChange={(e) => handleAddressChange('state', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">ZIP Code</label>
                    <Input
                      value={formData.personal_details.address.zip}
                      onChange={(e) => handleAddressChange('zip', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Country</label>
                    <Input
                      value={formData.personal_details.address.country}
                      onChange={(e) => handleAddressChange('country', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Financial Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Annual Income</label>
                  <Input
                    type="number"
                    value={formData.financial_details.income}
                    onChange={(e) => handleNestedInputChange('financial_details', 'income', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Annual Expenses</label>
                  <Input
                    type="number"
                    value={formData.financial_details.expenses}
                    onChange={(e) => handleNestedInputChange('financial_details', 'expenses', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Total Assets</label>
                  <Input
                    type="number"
                    value={formData.financial_details.assets}
                    onChange={(e) => handleNestedInputChange('financial_details', 'assets', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Total Liabilities</label>
                  <Input
                    type="number"
                    value={formData.financial_details.liabilities}
                    onChange={(e) => handleNestedInputChange('financial_details', 'liabilities', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Tags</h3>
              <div className="flex space-x-2">
                <Input
                  placeholder="Add a tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-secondary text-secondary-foreground"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Status and Notes */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full p-2 border border-input rounded-md bg-background"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="prospect">Prospect</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  className="w-full p-2 border border-input rounded-md bg-background min-h-[100px]"
                  placeholder="Additional notes about this client..."
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                <Save className="mr-2 h-4 w-4" />
                {loading ? 'Saving...' : (client?.id ? 'Update Client' : 'Add Client')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
