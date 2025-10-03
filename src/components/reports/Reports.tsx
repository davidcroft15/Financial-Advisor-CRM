import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { Client, Task, Appointment } from '../../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Download, TrendingUp, Users, Calendar, CheckSquare, DollarSign, Filter, X, Printer, FileText, Search } from 'lucide-react';

export const Reports: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showClientFilter, setShowClientFilter] = useState(false);
  const [reportType, setReportType] = useState<'all' | 'individual' | 'group'>('all');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      // Fetch clients
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .eq('advisor_id', user.id);

      if (clientsError) throw clientsError;

      // Fetch tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('advisor_id', user.id)
        .gte('created_at', dateRange.start)
        .lte('created_at', dateRange.end + 'T23:59:59');

      if (tasksError) throw tasksError;

      // Fetch appointments
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select('*')
        .eq('advisor_id', user.id)
        .gte('start_time', dateRange.start)
        .lte('start_time', dateRange.end + 'T23:59:59');

      if (appointmentsError) throw appointmentsError;

      setClients(clientsData || []);
      setTasks(tasksData || []);
      setAppointments(appointmentsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter data based on selected clients
  const getFilteredData = () => {
    if (reportType === 'all' || selectedClients.length === 0) {
      return { clients, tasks, appointments };
    }

    const filteredClients = clients.filter(client => selectedClients.includes(client.id));
    const filteredTasks = tasks.filter(task => 
      !task.client_id || selectedClients.includes(task.client_id)
    );
    const filteredAppointments = appointments.filter(appointment => 
      selectedClients.includes(appointment.client_id)
    );

    return { 
      clients: filteredClients, 
      tasks: filteredTasks, 
      appointments: filteredAppointments 
    };
  };

  const { clients: filteredClients, tasks: filteredTasks, appointments: filteredAppointments } = getFilteredData();

  const calculateTotalAUM = () => {
    return filteredClients.reduce((total, client) => total + (client.financial_details.assets || 0), 0);
  };

  const calculateNetWorth = () => {
    return filteredClients.reduce((total, client) => {
      const assets = client.financial_details.assets || 0;
      const liabilities = client.financial_details.liabilities || 0;
      return total + (assets - liabilities);
    }, 0);
  };

  const getClientStatusData = () => {
    const statusCounts = filteredClients.reduce((acc, client) => {
      acc[client.status] = (acc[client.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(statusCounts).map(([status, count]) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1),
      count
    }));
  };

  const getTaskStatusData = () => {
    const statusCounts = filteredTasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(statusCounts).map(([status, count]) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1),
      count
    }));
  };

  const getMonthlyAppointments = () => {
    const monthlyData: Record<string, number> = {};
    
    filteredAppointments.forEach(appointment => {
      const month = new Date(appointment.start_time).toLocaleDateString('en-US', { month: 'short' });
      monthlyData[month] = (monthlyData[month] || 0) + 1;
    });

    return Object.entries(monthlyData).map(([month, count]) => ({
      month,
      appointments: count
    }));
  };

  const getTopClientsByAUM = () => {
    return filteredClients
      .filter(client => client.financial_details.assets > 0)
      .sort((a, b) => b.financial_details.assets - a.financial_details.assets)
      .slice(0, 5)
      .map(client => ({
        name: `${client.personal_details.first_name} ${client.personal_details.last_name}`,
        aum: client.financial_details.assets
      }));
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const exportToCSV = () => {
    const csvData = filteredClients.map(client => ({
      'First Name': client.personal_details.first_name,
      'Last Name': client.personal_details.last_name,
      'Email': client.personal_details.email,
      'Phone': client.personal_details.phone,
      'Status': client.status,
      'Assets': client.financial_details.assets,
      'Liabilities': client.financial_details.liabilities,
      'Net Worth': client.financial_details.assets - client.financial_details.liabilities,
      'Created': new Date(client.created_at).toLocaleDateString()
    }));

    const headers = Object.keys(csvData[0] || {});
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => `"${row[header as keyof typeof row]}"`).join(','))
    ].join('\n');

    const reportTypeText = reportType === 'all' ? 'all-clients' : 
                          reportType === 'individual' ? 'individual-client' : 'group-clients';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportTypeText}-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const printReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const reportTitle = reportType === 'all' ? 'All Clients Report' : 
                       reportType === 'individual' ? 'Individual Client Report' : 'Group Clients Report';
    
    const selectedClientsText = selectedClients.length > 0 ? 
      `Selected Clients: ${selectedClients.map(id => {
        const client = clients.find(c => c.id === id);
        return client ? `${client.personal_details.first_name} ${client.personal_details.last_name}` : '';
      }).filter(Boolean).join(', ')}` : '';

    printWindow.document.write(`
      <html>
        <head>
          <title>${reportTitle}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .section { margin-bottom: 25px; }
            .metric { display: inline-block; margin: 10px 20px; text-align: center; }
            .metric-value { font-size: 24px; font-weight: bold; }
            .metric-label { font-size: 14px; color: #666; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .date-range { margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${reportTitle}</h1>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
            <div class="date-range">
              <strong>Date Range:</strong> ${new Date(dateRange.start).toLocaleDateString()} - ${new Date(dateRange.end).toLocaleDateString()}
            </div>
            ${selectedClientsText ? `<p><strong>${selectedClientsText}</strong></p>` : ''}
          </div>

          <div class="section">
            <h2>Key Metrics</h2>
            <div class="metric">
              <div class="metric-value">${filteredClients.length}</div>
              <div class="metric-label">Total Clients</div>
            </div>
            <div class="metric">
              <div class="metric-value">$${calculateTotalAUM().toLocaleString()}</div>
              <div class="metric-label">Total AUM</div>
            </div>
            <div class="metric">
              <div class="metric-value">$${calculateNetWorth().toLocaleString()}</div>
              <div class="metric-label">Net Worth</div>
            </div>
            <div class="metric">
              <div class="metric-value">${filteredAppointments.length}</div>
              <div class="metric-label">Appointments</div>
            </div>
          </div>

          <div class="section">
            <h2>Client Details</h2>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Assets</th>
                  <th>Liabilities</th>
                  <th>Net Worth</th>
                </tr>
              </thead>
              <tbody>
                ${filteredClients.map(client => `
                  <tr>
                    <td>${client.personal_details.first_name} ${client.personal_details.last_name}</td>
                    <td>${client.personal_details.email}</td>
                    <td>${client.personal_details.phone}</td>
                    <td>${client.status}</td>
                    <td>$${client.financial_details.assets.toLocaleString()}</td>
                    <td>$${client.financial_details.liabilities.toLocaleString()}</td>
                    <td>$${(client.financial_details.assets - client.financial_details.liabilities).toLocaleString()}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="section">
            <h2>Appointments Summary</h2>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Title</th>
                  <th>Client</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${filteredAppointments.map(appointment => {
                  const client = clients.find(c => c.id === appointment.client_id);
                  return `
                    <tr>
                      <td>${new Date(appointment.start_time).toLocaleDateString()}</td>
                      <td>${new Date(appointment.start_time).toLocaleTimeString()}</td>
                      <td>${appointment.title}</td>
                      <td>${client ? `${client.personal_details.first_name} ${client.personal_details.last_name}` : 'N/A'}</td>
                      <td>${appointment.status}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
  };

  const handleClientSelection = (clientId: string) => {
    setSelectedClients(prev => 
      prev.includes(clientId) 
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  };

  const clearClientSelection = () => {
    setSelectedClients([]);
    setReportType('all');
  };

  const getFilteredClients = () => {
    return clients.filter(client => 
      client.personal_details.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.personal_details.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.personal_details.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">
            Analytics and insights for your practice
          </p>
        </div>
        <div className="flex space-x-2">
          <div className="flex space-x-2">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
              className="px-3 py-2 border border-input rounded-md bg-background"
            />
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
              className="px-3 py-2 border border-input rounded-md bg-background"
            />
          </div>
          <Button 
            variant="outline" 
            onClick={() => setShowClientFilter(!showClientFilter)}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filter Clients
          </Button>
          <Button onClick={exportToCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button onClick={printReport}>
            <Printer className="mr-2 h-4 w-4" />
            Print Report
          </Button>
        </div>
      </div>

      {/* Report Type Selection */}
      <div className="flex space-x-4">
        <Button
          variant={reportType === 'all' ? 'default' : 'outline'}
          onClick={() => setReportType('all')}
        >
          All Clients
        </Button>
        <Button
          variant={reportType === 'individual' ? 'default' : 'outline'}
          onClick={() => setReportType('individual')}
        >
          Individual Client
        </Button>
        <Button
          variant={reportType === 'group' ? 'default' : 'outline'}
          onClick={() => setReportType('group')}
        >
          Group of Clients
        </Button>
        {selectedClients.length > 0 && (
          <Button variant="outline" onClick={clearClientSelection}>
            <X className="mr-2 h-4 w-4" />
            Clear Selection ({selectedClients.length})
          </Button>
        )}
      </div>

      {/* Client Filter Panel */}
      {showClientFilter && (
        <Card>
          <CardHeader>
            <CardTitle>Select Clients for Report</CardTitle>
            <CardDescription>
              Choose specific clients to include in your report
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search clients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="max-h-60 overflow-y-auto space-y-2">
                {getFilteredClients().map(client => (
                  <div
                    key={client.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedClients.includes(client.id)
                        ? 'bg-primary/10 border-primary'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => handleClientSelection(client.id)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedClients.includes(client.id)}
                      onChange={() => handleClientSelection(client.id)}
                      className="rounded"
                    />
                    <div className="flex-1">
                      <div className="font-medium">
                        {client.personal_details.first_name} {client.personal_details.last_name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {client.personal_details.email} • {client.status}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        ${client.financial_details.assets.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">AUM</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredClients.length}</div>
            <p className="text-xs text-muted-foreground">
              {filteredClients.filter(c => c.status === 'active').length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total AUM</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${calculateTotalAUM().toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Assets under management
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Worth</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${calculateNetWorth().toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Total client net worth
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredAppointments.length}</div>
            <p className="text-xs text-muted-foreground">
              In selected period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Client Status Distribution</CardTitle>
            <CardDescription>Breakdown of clients by status</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={getClientStatusData()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, count }) => `${status}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {getClientStatusData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Task Status Distribution</CardTitle>
            <CardDescription>Breakdown of tasks by status</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getTaskStatusData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Appointments</CardTitle>
            <CardDescription>Appointments scheduled by month</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={getMonthlyAppointments()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="appointments" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Clients by AUM</CardTitle>
            <CardDescription>Your highest value clients</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getTopClientsByAUM()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'AUM']} />
                <Bar dataKey="aum" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Practice Summary</CardTitle>
          <CardDescription>Key insights about your practice</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {filteredTasks.filter(t => t.status === 'completed').length}
              </div>
              <div className="text-sm text-muted-foreground">Completed Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {filteredAppointments.filter(a => a.status === 'completed').length}
              </div>
              <div className="text-sm text-muted-foreground">Completed Meetings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {filteredClients.length > 0 ? (calculateTotalAUM() / filteredClients.length).toLocaleString() : 0}
              </div>
              <div className="text-sm text-muted-foreground">Average AUM per Client</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
