import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Client } from '../../types';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';

interface ClientListProps {
  onEditClient: (client: Client | null) => void;
  onViewClient: (client: Client) => void;
}

export const ClientList: React.FC<ClientListProps> = ({ onEditClient, onViewClient }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    const filtered = clients.filter(client => {
      const fullName = `${client.personal_details.first_name} ${client.personal_details.last_name}`.toLowerCase();
      const email = client.personal_details.email.toLowerCase();
      const query = searchQuery.toLowerCase();
      
      return fullName.includes(query) || email.includes(query) || 
             client.tags.some(tag => tag.toLowerCase().includes(query));
    });
    setFilteredClients(filtered);
  }, [clients, searchQuery]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('No user found');
        return;
      }

      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('advisor_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching clients:', error);
        return;
      }

      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteClient = async (clientId: string) => {
    if (!window.confirm('Are you sure you want to delete this client?')) return;

    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId);

      if (error) {
        console.error('Error deleting client:', error);
        return;
      }

      setClients(clients.filter(client => client.id !== clientId));
    } catch (error) {
      console.error('Error deleting client:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading clients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground">
            Manage your client relationships and financial data
          </p>
        </div>
        <Button onClick={() => onEditClient(null)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Client
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredClients.map((client) => (
          <Card key={client.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">
                    {client.personal_details.first_name} {client.personal_details.last_name}
                  </CardTitle>
                  <CardDescription>
                    {client.personal_details.email}
                  </CardDescription>
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onViewClient(client)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEditClient(client)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteClient(client.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    client.status === 'active' ? 'bg-green-100 text-green-800' :
                    client.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {client.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Phone:</span>
                  <span>{client.personal_details.phone || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">AUM:</span>
                  <span>${client.financial_details.assets?.toLocaleString() || '0'}</span>
                </div>
                {client.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {client.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-md"
                      >
                        {tag}
                      </span>
                    ))}
                    {client.tags.length > 3 && (
                      <span className="text-xs text-muted-foreground">
                        +{client.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredClients.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchQuery ? 'No clients found matching your search.' : 'No clients yet. Add your first client to get started.'}
          </p>
        </div>
      )}
    </div>
  );
};
