import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Users, Calendar, CheckSquare, DollarSign, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import { Client, Appointment, Task } from '../../types';

interface DashboardProps {
  onNavigate?: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleQuickAction = (action: string) => {
    if (onNavigate) {
      onNavigate(action);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      // Fetch clients
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .eq('advisor_id', user.id);

      if (clientsError) throw clientsError;

      // Fetch appointments for next 7 days
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select(`
          *,
          clients:client_id (
            personal_details
          )
        `)
        .eq('advisor_id', user.id)
        .gte('start_time', new Date().toISOString())
        .lte('start_time', nextWeek.toISOString())
        .order('start_time', { ascending: true });

      if (appointmentsError) throw appointmentsError;

      // Fetch tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select(`
          *,
          clients:client_id (
            personal_details
          )
        `)
        .eq('advisor_id', user.id)
        .in('status', ['pending', 'in_progress'])
        .order('due_date', { ascending: true });

      if (tasksError) throw tasksError;

      // Fetch recent activities (last 10 appointments and tasks)
      const { data: recentAppointments, error: recentAppointmentsError } = await supabase
        .from('appointments')
        .select(`
          *,
          clients:client_id (
            personal_details
          )
        `)
        .eq('advisor_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      const { data: recentTasks, error: recentTasksError } = await supabase
        .from('tasks')
        .select(`
          *,
          clients:client_id (
            personal_details
          )
        `)
        .eq('advisor_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentAppointmentsError || recentTasksError) {
        console.error('Error fetching recent activities:', recentAppointmentsError || recentTasksError);
      }

      setClients(clientsData || []);
      setAppointments(appointmentsData || []);
      setTasks(tasksData || []);

      // Combine and sort recent activities
      const activities = [
        ...(recentAppointments || []).map(apt => ({
          id: apt.id,
          type: 'meeting',
          client: apt.clients ? `${apt.clients.personal_details.first_name} ${apt.clients.personal_details.last_name}` : 'Unknown Client',
          description: apt.title,
          time: apt.created_at,
          status: apt.status
        })),
        ...(recentTasks || []).map(task => ({
          id: task.id,
          type: 'task',
          client: task.clients ? `${task.clients.personal_details.first_name} ${task.clients.personal_details.last_name}` : 'General Task',
          description: task.title,
          time: task.created_at,
          status: task.status
        }))
      ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);

      setRecentActivities(activities);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalAUM = () => {
    return clients.reduce((total, client) => total + (client.financial_details.assets_under_management || 0), 0);
  };

  const calculateNetWorth = () => {
    return clients.reduce((total, client) => {
      const assets = client.financial_details.total_assets || 0;
      const liabilities = client.financial_details.liabilities || 0;
      return total + (assets - liabilities);
    }, 0);
  };

  const getUpcomingAppointments = () => {
    return appointments.filter(apt => apt.status === 'scheduled').length;
  };

  const getPendingTasks = () => {
    return tasks.filter(task => task.status === 'pending').length;
  };

  const getOverdueTasks = () => {
    const today = new Date();
    return tasks.filter(task => 
      task.status === 'pending' && 
      new Date(task.due_date) < today
    ).length;
  };

  const getActiveClients = () => {
    return clients.filter(client => client.status === 'active').length;
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = [
    { 
      title: 'Total Clients', 
      value: clients.length.toString(), 
      icon: Users, 
      change: `${getActiveClients()} active` 
    },
    { 
      title: 'Upcoming Meetings', 
      value: getUpcomingAppointments().toString(), 
      icon: Calendar, 
      change: 'Next 7 days' 
    },
    { 
      title: 'Pending Tasks', 
      value: getPendingTasks().toString(), 
      icon: CheckSquare, 
      change: `${getOverdueTasks()} overdue` 
    },
    { 
      title: 'Total AUM', 
      value: `$${calculateTotalAUM().toLocaleString()}`, 
      icon: DollarSign, 
      change: `$${calculateNetWorth().toLocaleString()} net worth` 
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening with your practice.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Activities */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>
              Latest updates from your practice
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-4">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.type === 'meeting' ? 'bg-blue-500' : 'bg-green-500'
                    }`} />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {activity.client}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {activity.description}
                      </p>
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          activity.status === 'completed' ? 'bg-green-100 text-green-800' :
                          activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          activity.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {activity.status}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {activity.type === 'meeting' ? 'Meeting' : 'Task'}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatTimeAgo(activity.time)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-8 w-8 mx-auto mb-2" />
                  <p>No recent activities</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <button 
              className="w-full text-left p-3 rounded-md border hover:bg-accent transition-colors"
              onClick={() => handleQuickAction('clients')}
            >
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Add New Client</span>
              </div>
            </button>
            <button 
              className="w-full text-left p-3 rounded-md border hover:bg-accent transition-colors"
              onClick={() => handleQuickAction('calendar')}
            >
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Schedule Meeting</span>
              </div>
            </button>
            <button 
              className="w-full text-left p-3 rounded-md border hover:bg-accent transition-colors"
              onClick={() => handleQuickAction('tasks')}
            >
              <div className="flex items-center space-x-2">
                <CheckSquare className="h-4 w-4" />
                <span>Create Task</span>
              </div>
            </button>
            <button 
              className="w-full text-left p-3 rounded-md border hover:bg-accent transition-colors"
              onClick={() => handleQuickAction('reports')}
            >
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4" />
                <span>Generate Report</span>
              </div>
            </button>
          </CardContent>
        </Card>
      </div>

      {/* Additional Dashboard Sections */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Upcoming Appointments */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Appointments</CardTitle>
            <CardDescription>
              Your next scheduled meetings
            </CardDescription>
          </CardHeader>
          <CardContent>
            {appointments.length > 0 ? (
              <div className="space-y-3">
                {appointments.slice(0, 5).map((appointment) => {
                  const client = appointment.clients as any;
                  return (
                    <div key={appointment.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        <div>
                          <p className="font-medium">{appointment.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {client ? `${client.personal_details.first_name} ${client.personal_details.last_name}` : 'Unknown Client'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {new Date(appointment.start_time).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(appointment.start_time).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-8 w-8 mx-auto mb-2" />
                <p>No upcoming appointments</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Overdue Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>Overdue Tasks</CardTitle>
            <CardDescription>
              Tasks that need immediate attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            {getOverdueTasks() > 0 ? (
              <div className="space-y-3">
                {tasks.filter(task => {
                  const today = new Date();
                  return task.status === 'pending' && new Date(task.due_date) < today;
                }).slice(0, 5).map((task) => {
                  const client = task.clients as any;
                  return (
                    <div key={task.id} className="flex items-center justify-between p-3 rounded-lg border border-red-200 bg-red-50">
                      <div className="flex items-center space-x-3">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <div>
                          <p className="font-medium">{task.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {client ? `${client.personal_details.first_name} ${client.personal_details.last_name}` : 'General Task'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-red-600">
                          Due {new Date(task.due_date).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {task.priority} priority
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CheckSquare className="h-8 w-8 mx-auto mb-2" />
                <p>No overdue tasks</p>
                <p className="text-sm">Great job staying on top of things!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
