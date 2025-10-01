import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Appointment, Client } from '../../types';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Plus, Calendar as CalendarIcon, Clock, MapPin, Video, Search, Grid3X3, List } from 'lucide-react';
import { CalendarView } from './CalendarView';

export const Calendar: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    location: '',
    meeting_link: '',
    client_id: '',
    status: 'scheduled' as 'scheduled' | 'completed' | 'cancelled' | 'rescheduled'
  });

  useEffect(() => {
    fetchAppointments();
    fetchClients();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          clients:client_id (
            personal_details
          )
        `)
        .eq('advisor_id', user.id)
        .order('start_time', { ascending: true });

      if (error) {
        console.error('Error fetching appointments:', error);
        return;
      }

      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { data, error } = await supabase
        .from('clients')
        .select('id, personal_details')
        .eq('advisor_id', user.id);

      if (error) {
        console.error('Error fetching clients:', error);
        return;
      }

      setClients((data as Client[]) || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const appointmentData = {
        ...formData,
        advisor_id: user.id,
        created_at: new Date().toISOString()
      };

      if (editingAppointment) {
        // Update existing appointment
        const { error } = await supabase
          .from('appointments')
          .update(appointmentData)
          .eq('id', editingAppointment.id);

        if (error) throw error;
      } else {
        // Create new appointment
        const { error } = await supabase
          .from('appointments')
          .insert([appointmentData]);

        if (error) throw error;
      }

      setFormData({
        title: '',
        description: '',
        start_time: '',
        end_time: '',
        location: '',
        meeting_link: '',
        client_id: '',
        status: 'scheduled'
      });
      setShowForm(false);
      setEditingAppointment(null);
      fetchAppointments();
    } catch (error) {
      console.error('Error saving appointment:', error);
    }
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setFormData({
      title: appointment.title,
      description: appointment.description || '',
      start_time: appointment.start_time,
      end_time: appointment.end_time,
      location: appointment.location || '',
      meeting_link: appointment.meeting_link || '',
      client_id: appointment.client_id || '',
      status: appointment.status
    });
    setShowForm(true);
  };

  const handleAddAppointment = () => {
    setEditingAppointment(null);
    setFormData({
      title: '',
      description: '',
      start_time: '',
      end_time: '',
      location: '',
      meeting_link: '',
      client_id: '',
      status: 'scheduled'
    });
    setShowForm(true);
  };

  const updateAppointmentStatus = async (appointmentId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', appointmentId);

      if (error) throw error;

      fetchAppointments();
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
  };

  const deleteAppointment = async (appointmentId: string) => {
    if (!window.confirm('Are you sure you want to delete this appointment?')) return;

    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', appointmentId);

      if (error) throw error;

      setAppointments(appointments.filter(appointment => appointment.id !== appointmentId));
    } catch (error) {
      console.error('Error deleting appointment:', error);
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         appointment.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDate = !selectedDate || appointment.start_time.startsWith(selectedDate);
    return matchesSearch && matchesDate;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'text-blue-600 bg-blue-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      case 'rescheduled': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateTime: string) => {
    return new Date(dateTime).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground">
            Manage your appointments and meetings
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('calendar')}
            >
              <Grid3X3 className="mr-2 h-4 w-4" />
              Calendar
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="mr-2 h-4 w-4" />
              List
            </Button>
          </div>
          <Button onClick={handleAddAppointment}>
            <Plus className="mr-2 h-4 w-4" />
            Schedule Meeting
          </Button>
        </div>
      </div>

      {/* Calendar View */}
      {viewMode === 'calendar' ? (
        <CalendarView
          onAddAppointment={handleAddAppointment}
          onEditAppointment={handleEditAppointment}
        />
      ) : (
        <>
          {/* Filters for List View */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search appointments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="max-w-xs"
            />
          </div>
        </>
      )}

      {/* Appointment Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingAppointment ? 'Edit Appointment' : 'Schedule New Appointment'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Title *</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Client</label>
                  <select
                    value={formData.client_id}
                    onChange={(e) => setFormData({...formData, client_id: e.target.value})}
                    className="w-full p-2 border border-input rounded-md bg-background"
                  >
                    <option value="">No client</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>
                        {client.personal_details.first_name} {client.personal_details.last_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Start Time *</label>
                  <Input
                    type="datetime-local"
                    value={formData.start_time}
                    onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">End Time *</label>
                  <Input
                    type="datetime-local"
                    value={formData.end_time}
                    onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Location</label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="Office, client location, etc."
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Meeting Link</label>
                  <Input
                    value={formData.meeting_link}
                    onChange={(e) => setFormData({...formData, meeting_link: e.target.value})}
                    placeholder="Zoom, Teams, etc."
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full p-2 border border-input rounded-md bg-background min-h-[100px]"
                  placeholder="Meeting agenda, notes, etc."
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowForm(false);
                    setEditingAppointment(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingAppointment ? 'Update Appointment' : 'Schedule Appointment'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Appointments List - Only show in list view */}
      {viewMode === 'list' && (
        <div className="space-y-4">
        {filteredAppointments.map((appointment) => {
          const client = appointment.clients as any;
          const isToday = new Date(appointment.start_time).toDateString() === new Date().toDateString();
          const isPast = new Date(appointment.start_time) < new Date();
          
          return (
            <Card key={appointment.id} className={isToday ? 'border-blue-200 bg-blue-50' : ''}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      <h3 className="font-semibold">{appointment.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                      {isToday && (
                        <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                          Today
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>
                          {formatDate(appointment.start_time)} at {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                        </span>
                      </div>
                      {appointment.location && (
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{appointment.location}</span>
                        </div>
                      )}
                      {appointment.meeting_link && (
                        <div className="flex items-center space-x-1">
                          <Video className="h-4 w-4" />
                          <a 
                            href={appointment.meeting_link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            Join Meeting
                          </a>
                        </div>
                      )}
                    </div>
                    
                    {client && (
                      <div className="text-sm text-muted-foreground mb-2">
                        Client: {client.personal_details.first_name} {client.personal_details.last_name}
                      </div>
                    )}
                    
                    {appointment.description && (
                      <p className="text-muted-foreground">{appointment.description}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {appointment.status === 'scheduled' && !isPast && (
                      <Button
                        size="sm"
                        onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Mark Complete
                      </Button>
                    )}
                    {appointment.status === 'scheduled' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                        className="text-red-600 hover:text-red-700"
                      >
                        Cancel
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteAppointment(appointment.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        
        {filteredAppointments.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchQuery || selectedDate ? 'No appointments found matching your criteria.' : 'No appointments scheduled. Schedule your first meeting to get started.'}
            </p>
          </div>
        )}
        </div>
      )}
    </div>
  );
};
