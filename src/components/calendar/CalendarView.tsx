import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Appointment, Client } from '../../types';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ChevronLeft, ChevronRight, Plus, Clock, MapPin, Video } from 'lucide-react';

interface CalendarViewProps {
  onAddAppointment: () => void;
  onEditAppointment: (appointment: Appointment) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ onAddAppointment, onEditAppointment }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
    fetchClients();
  }, [currentDate]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59);

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          clients:client_id (
            personal_details
          )
        `)
        .eq('advisor_id', user.id)
        .gte('start_time', startOfMonth.toISOString())
        .lte('start_time', endOfMonth.toISOString())
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

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getAppointmentsForDay = (date: Date) => {
    if (!date) return [];
    
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);
    
    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.start_time);
      return appointmentDate >= dayStart && appointmentDate <= dayEnd;
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const formatTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'rescheduled': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const days = getDaysInMonth(currentDate);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigateMonth('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigateMonth('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Button onClick={onAddAppointment}>
          <Plus className="mr-2 h-4 w-4" />
          Add Appointment
        </Button>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-0">
          <div className="grid grid-cols-7 border-b">
            {dayNames.map(day => (
              <div key={day} className="p-3 text-center font-semibold text-muted-foreground border-r last:border-r-0">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7">
            {days.map((day, index) => {
              const dayAppointments = day ? getAppointmentsForDay(day) : [];
              const isCurrentDay = day && isToday(day);
              
              return (
                <div
                  key={index}
                  className={`min-h-[120px] border-r border-b last:border-r-0 p-2 ${
                    day ? 'bg-background hover:bg-muted/50' : 'bg-muted/20'
                  } ${isCurrentDay ? 'bg-primary/10' : ''}`}
                >
                  {day && (
                    <>
                      <div className={`text-sm font-medium mb-1 ${
                        isCurrentDay ? 'text-primary font-bold' : 'text-foreground'
                      }`}>
                        {day.getDate()}
                      </div>
                      
                      <div className="space-y-1">
                        {dayAppointments.slice(0, 3).map((appointment) => {
                          const client = appointment.clients as any;
                          return (
                            <div
                              key={appointment.id}
                              className={`text-xs p-1 rounded cursor-pointer hover:opacity-80 ${getStatusColor(appointment.status)}`}
                              onClick={() => onEditAppointment(appointment)}
                              title={`${appointment.title} - ${formatTime(appointment.start_time)}`}
                            >
                              <div className="font-medium truncate">
                                {appointment.title}
                              </div>
                              <div className="flex items-center space-x-1 text-xs opacity-75">
                                <Clock className="h-3 w-3" />
                                <span>{formatTime(appointment.start_time)}</span>
                              </div>
                              {client && (
                                <div className="truncate">
                                  {client.personal_details.first_name} {client.personal_details.last_name}
                                </div>
                              )}
                            </div>
                          );
                        })}
                        
                        {dayAppointments.length > 3 && (
                          <div className="text-xs text-muted-foreground text-center">
                            +{dayAppointments.length - 3} more
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded bg-blue-100 border border-blue-200"></div>
          <span>Scheduled</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded bg-green-100 border border-green-200"></div>
          <span>Completed</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded bg-red-100 border border-red-200"></div>
          <span>Cancelled</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded bg-yellow-100 border border-yellow-200"></div>
          <span>Rescheduled</span>
        </div>
      </div>
    </div>
  );
};
