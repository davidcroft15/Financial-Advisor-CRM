import React, { useState } from 'react';
import { Client } from '../../types';
import { ClientList } from './ClientList';
import { ClientForm } from './ClientForm';

export const Clients: React.FC = () => {
  const [currentView, setCurrentView] = useState<'list' | 'form' | 'view'>('list');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const handleEditClient = (client: Client | null) => {
    setSelectedClient(client);
    setCurrentView('form');
  };

  const handleViewClient = (client: Client) => {
    setSelectedClient(client);
    setCurrentView('view');
  };

  const handleSaveClient = () => {
    setCurrentView('list');
    setSelectedClient(null);
  };

  const handleCancel = () => {
    setCurrentView('list');
    setSelectedClient(null);
  };

  if (currentView === 'form') {
    return (
      <ClientForm
        client={selectedClient}
        onSave={handleSaveClient}
        onCancel={handleCancel}
      />
    );
  }

  if (currentView === 'view') {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {selectedClient?.personal_details.first_name} {selectedClient?.personal_details.last_name}
            </h1>
            <p className="text-muted-foreground">
              Client Details
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handleEditClient(selectedClient!)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Edit Client
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 border border-input rounded-md hover:bg-accent"
            >
              Back to List
            </button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Personal Information</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span>{selectedClient?.personal_details.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phone:</span>
                <span>{selectedClient?.personal_details.phone || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date of Birth:</span>
                <span>{selectedClient?.personal_details.date_of_birth || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Occupation:</span>
                <span>{selectedClient?.personal_details.occupation || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Financial Information</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Annual Income:</span>
                <span>${selectedClient?.financial_details.income?.toLocaleString() || '0'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Annual Expenses:</span>
                <span>${selectedClient?.financial_details.expenses?.toLocaleString() || '0'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Assets:</span>
                <span>${selectedClient?.financial_details.total_assets?.toLocaleString() || '0'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Assets Under Management:</span>
                <span>${selectedClient?.financial_details.assets_under_management?.toLocaleString() || '0'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Liabilities:</span>
                <span>${selectedClient?.financial_details.liabilities?.toLocaleString() || '0'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Net Worth:</span>
                <span className="font-semibold">
                  ${((selectedClient?.financial_details.total_assets || 0) - (selectedClient?.financial_details.liabilities || 0)).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {selectedClient?.notes && (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Notes</h3>
            <p className="text-muted-foreground">{selectedClient.notes}</p>
          </div>
        )}

        {selectedClient?.tags && selectedClient.tags.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {selectedClient.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-secondary text-secondary-foreground text-sm rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <ClientList
      onEditClient={handleEditClient}
      onViewClient={handleViewClient}
    />
  );
};
