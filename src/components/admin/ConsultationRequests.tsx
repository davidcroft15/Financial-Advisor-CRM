import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { 
  Calendar, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  Eye,
  Filter,
  Search
} from 'lucide-react';
import { ConsultationService, ConsultationRequestRecord } from '../../lib/consultationService';

export const ConsultationRequests: React.FC = () => {
  const [requests, setRequests] = useState<ConsultationRequestRecord[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<ConsultationRequestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<ConsultationRequestRecord | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [requests, searchTerm, statusFilter]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await ConsultationService.getAllRequests();
      setRequests(data);
    } catch (error) {
      console.error('Error loading consultation requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterRequests = () => {
    let filtered = requests;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(request =>
        request.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(request => request.status === statusFilter);
    }

    setFilteredRequests(filtered);
  };

  const handleApproveRequest = async (request: ConsultationRequestRecord) => {
    try {
      setIsProcessing(true);
      await ConsultationService.updateRequestStatus(
        request.id,
        'approved',
        adminNotes,
        'default-advisor-id' // In real app, this would be selected from a dropdown
      );
      setAdminNotes('');
      setSelectedRequest(null);
      await loadRequests();
    } catch (error) {
      console.error('Error approving request:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeclineRequest = async (request: ConsultationRequestRecord) => {
    try {
      setIsProcessing(true);
      await ConsultationService.updateRequestStatus(
        request.id,
        'declined',
        adminNotes
      );
      setAdminNotes('');
      setSelectedRequest(null);
      await loadRequests();
    } catch (error) {
      console.error('Error declining request:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      declined: { color: 'bg-red-100 text-red-800', icon: XCircle },
      completed: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getRequestTypeLabel = (type: string) => {
    const typeLabels: { [key: string]: string } = {
      initial: 'Initial Consultation',
      'follow-up': 'Follow-up Meeting',
      pension: 'Pension Planning',
      business: 'Business Owner Planning'
    };
    return typeLabels[type] || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading consultation requests...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Consultation Requests</h2>
          <p className="text-gray-600">Manage incoming consultation requests from potential clients</p>
        </div>
        <Button onClick={loadRequests} variant="outline">
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="declined">Declined</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Requests List */}
      <div className="grid gap-4">
        {filteredRequests.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">No consultation requests found</p>
            </CardContent>
          </Card>
        ) : (
          filteredRequests.map((request) => (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {request.first_name} {request.last_name}
                      </h3>
                      {getStatusBadge(request.status)}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span>{request.email}</span>
                      </div>
                      {request.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          <span>{request.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(request.preferred_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{request.preferred_time}</span>
                      </div>
                    </div>

                    <div className="mt-3">
                      <span className="inline-block bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        {getRequestTypeLabel(request.request_type)}
                      </span>
                    </div>

                    {request.message && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-md">
                        <div className="flex items-start gap-2">
                          <MessageSquare className="h-4 w-4 text-gray-400 mt-0.5" />
                          <p className="text-sm text-gray-700">{request.message}</p>
                        </div>
                      </div>
                    )}

                    {request.admin_notes && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-md">
                        <p className="text-sm text-blue-800">
                          <strong>Admin Notes:</strong> {request.admin_notes}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    {request.status === 'pending' && (
                      <>
                        <Button
                          onClick={() => setSelectedRequest(request)}
                          variant="outline"
                          size="sm"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Review
                        </Button>
                        <Button
                          onClick={() => handleApproveRequest(request)}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          disabled={isProcessing}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleDeclineRequest(request)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-300 hover:bg-red-50"
                          disabled={isProcessing}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Decline
                        </Button>
                      </>
                    )}
                    {request.status === 'approved' && (
                      <span className="text-sm text-green-600 font-medium">
                        Approved
                      </span>
                    )}
                    {request.status === 'declined' && (
                      <span className="text-sm text-red-600 font-medium">
                        Declined
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Review Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Review Consultation Request</CardTitle>
              <CardDescription>
                Review details and add notes before approving or declining
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <p className="text-gray-900">
                    {selectedRequest.first_name} {selectedRequest.last_name}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <p className="text-gray-900">{selectedRequest.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Date
                  </label>
                  <p className="text-gray-900">
                    {new Date(selectedRequest.preferred_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Time
                  </label>
                  <p className="text-gray-900">{selectedRequest.preferred_time}</p>
                </div>
              </div>

              {selectedRequest.message && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-md">
                    {selectedRequest.message}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admin Notes
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Add any notes about this request..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => handleApproveRequest(selectedRequest)}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={isProcessing}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approve Request
                </Button>
                <Button
                  onClick={() => handleDeclineRequest(selectedRequest)}
                  variant="outline"
                  className="flex-1 text-red-600 border-red-300 hover:bg-red-50"
                  disabled={isProcessing}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Decline Request
                </Button>
                <Button
                  onClick={() => {
                    setSelectedRequest(null);
                    setAdminNotes('');
                  }}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
