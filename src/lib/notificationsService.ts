import { supabase } from './supabase';

export interface Notification {
  id: string;
  type: 'consultation' | 'appointment' | 'task' | 'system';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
}

export class NotificationsService {
  static async getNotifications(userId: string): Promise<Notification[]> {
    const notifications: Notification[] = [];

    try {
      // Get recent consultation requests (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: consultations, error: consultationsError } = await supabase
        .from('consultation_requests')
        .select('id, first_name, last_name, email, created_at, status')
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(5);

      if (!consultationsError && consultations) {
        consultations.forEach(consultation => {
          const isNew = consultation.status === 'pending';
          const isRecent = new Date(consultation.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000); // Last 24 hours
          
          notifications.push({
            id: `consultation-${consultation.id}`,
            type: 'consultation',
            title: isNew ? 'New Consultation Request' : 'Consultation Request Updated',
            message: `${consultation.first_name} ${consultation.last_name} (${consultation.email}) - Status: ${consultation.status}`,
            timestamp: consultation.created_at,
            isRead: !isNew || !isRecent,
            priority: isNew && isRecent ? 'high' : 'medium',
            actionUrl: '/consultations'
          });
        });
      }

      // Get upcoming appointments (next 7 days)
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);

      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select(`
          id, title, start_time, status,
          clients:client_id (personal_details)
        `)
        .eq('advisor_id', userId)
        .gte('start_time', new Date().toISOString())
        .lte('start_time', nextWeek.toISOString())
        .order('start_time', { ascending: true })
        .limit(5);

      if (!appointmentsError && appointments) {
        appointments.forEach(appointment => {
          const client = appointment.clients as any;
          const clientName = client ? `${client.personal_details?.first_name || ''} ${client.personal_details?.last_name || ''}`.trim() : 'Unknown Client';
          const appointmentDate = new Date(appointment.start_time);
          const isToday = appointmentDate.toDateString() === new Date().toDateString();
          const isTomorrow = appointmentDate.toDateString() === new Date(Date.now() + 24 * 60 * 60 * 1000).toDateString();
          
          notifications.push({
            id: `appointment-${appointment.id}`,
            type: 'appointment',
            title: isToday ? 'Appointment Today' : isTomorrow ? 'Appointment Tomorrow' : 'Upcoming Appointment',
            message: `${appointment.title || 'Untitled'} with ${clientName} at ${appointmentDate.toLocaleTimeString()}`,
            timestamp: appointment.start_time,
            isRead: !isToday,
            priority: isToday ? 'high' : isTomorrow ? 'medium' : 'low',
            actionUrl: '/calendar'
          });
        });
      }

      // Get overdue tasks
      const { data: overdueTasks, error: tasksError } = await supabase
        .from('tasks')
        .select('id, title, due_date, status')
        .eq('advisor_id', userId)
        .eq('status', 'pending')
        .lt('due_date', new Date().toISOString())
        .order('due_date', { ascending: true })
        .limit(3);

      if (!tasksError && overdueTasks) {
        overdueTasks.forEach(task => {
          const dueDate = new Date(task.due_date);
          const daysOverdue = Math.ceil((Date.now() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
          
          notifications.push({
            id: `task-${task.id}`,
            type: 'task',
            title: 'Overdue Task',
            message: `${task.title} - ${daysOverdue} day${daysOverdue !== 1 ? 's' : ''} overdue`,
            timestamp: task.due_date,
            isRead: false,
            priority: daysOverdue > 3 ? 'high' : 'medium',
            actionUrl: '/tasks'
          });
        });
      }

      // Get tasks due today
      const today = new Date();
      today.setHours(23, 59, 59, 999);

      const { data: todayTasks, error: todayTasksError } = await supabase
        .from('tasks')
        .select('id, title, due_date, status')
        .eq('advisor_id', userId)
        .eq('status', 'pending')
        .gte('due_date', new Date().toISOString().split('T')[0])
        .lte('due_date', today.toISOString())
        .order('due_date', { ascending: true })
        .limit(3);

      if (!todayTasksError && todayTasks) {
        todayTasks.forEach(task => {
          notifications.push({
            id: `task-today-${task.id}`,
            type: 'task',
            title: 'Task Due Today',
            message: task.title,
            timestamp: task.due_date,
            isRead: false,
            priority: 'medium',
            actionUrl: '/tasks'
          });
        });
      }

      // Sort notifications by priority and timestamp
      notifications.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });

      return notifications;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  static getNotificationIcon(type: string) {
    switch (type) {
      case 'consultation': return '💬';
      case 'appointment': return '📅';
      case 'task': return '✅';
      case 'system': return '🔔';
      default: return '📄';
    }
  }

  static getPriorityColor(priority: string) {
    switch (priority) {
      case 'high': return 'bg-red-50 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  }

  static formatTimestamp(timestamp: string): string {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return notificationTime.toLocaleDateString();
  }
}
