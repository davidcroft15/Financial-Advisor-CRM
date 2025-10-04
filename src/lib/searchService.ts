import { supabase } from './supabase';

export interface SearchResult {
  type: 'client' | 'appointment' | 'task' | 'consultation';
  id: string;
  title: string;
  description: string;
  date?: string;
  status?: string;
}

export class SearchService {
  static async searchAll(query: string, userId: string): Promise<SearchResult[]> {
    if (!query.trim()) return [];

    const results: SearchResult[] = [];

    try {
      // Search clients
      const { data: clients, error: clientsError } = await supabase
        .from('clients')
        .select('id, personal_details, created_at')
        .eq('advisor_id', userId)
        .or(`personal_details->first_name.ilike.%${query}%,personal_details->last_name.ilike.%${query}%,personal_details->email.ilike.%${query}%`);

      if (!clientsError && clients) {
        clients.forEach(client => {
          const personalDetails = client.personal_details as any;
          results.push({
            type: 'client',
            id: client.id,
            title: `${personalDetails?.first_name || ''} ${personalDetails?.last_name || ''}`.trim(),
            description: personalDetails?.email || 'No email provided',
            date: client.created_at,
            status: 'Active'
          });
        });
      }

      // Search appointments
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select(`
          id, title, description, start_time, status,
          clients:client_id (personal_details)
        `)
        .eq('advisor_id', userId)
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`);

      if (!appointmentsError && appointments) {
        appointments.forEach(appointment => {
          const client = appointment.clients as any;
          const clientName = client ? `${client.personal_details?.first_name || ''} ${client.personal_details?.last_name || ''}`.trim() : 'Unknown Client';
          
          results.push({
            type: 'appointment',
            id: appointment.id,
            title: appointment.title || 'Untitled Appointment',
            description: `With ${clientName} - ${appointment.description || 'No description'}`,
            date: appointment.start_time,
            status: appointment.status
          });
        });
      }

      // Search tasks
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('id, title, description, due_date, status')
        .eq('advisor_id', userId)
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`);

      if (!tasksError && tasks) {
        tasks.forEach(task => {
          results.push({
            type: 'task',
            id: task.id,
            title: task.title || 'Untitled Task',
            description: task.description || 'No description',
            date: task.due_date,
            status: task.status
          });
        });
      }

      // Search consultation requests
      const { data: consultations, error: consultationsError } = await supabase
        .from('consultation_requests')
        .select('id, first_name, last_name, email, preferred_date, status, message')
        .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%`);

      if (!consultationsError && consultations) {
        consultations.forEach(consultation => {
          results.push({
            type: 'consultation',
            id: consultation.id,
            title: `${consultation.first_name} ${consultation.last_name}`,
            description: `${consultation.email} - ${consultation.message || 'No message'}`,
            date: consultation.preferred_date,
            status: consultation.status
          });
        });
      }

      // Sort results by date (most recent first)
      results.sort((a, b) => {
        if (!a.date && !b.date) return 0;
        if (!a.date) return 1;
        if (!b.date) return -1;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });

      return results;
    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  }

  static getTypeIcon(type: string) {
    switch (type) {
      case 'client': return '👤';
      case 'appointment': return '📅';
      case 'task': return '✅';
      case 'consultation': return '💬';
      default: return '📄';
    }
  }

  static getTypeColor(type: string) {
    switch (type) {
      case 'client': return 'bg-blue-50 text-blue-700';
      case 'appointment': return 'bg-green-50 text-green-700';
      case 'task': return 'bg-yellow-50 text-yellow-700';
      case 'consultation': return 'bg-purple-50 text-purple-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  }
}
