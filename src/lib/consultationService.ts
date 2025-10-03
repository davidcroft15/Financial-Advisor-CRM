import { supabase } from './supabase';
import { ConsultationRequest } from '../components/consultation/ConsultationRequestModal';

export interface ConsultationRequestRecord {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  preferred_date: string;
  preferred_time: string;
  message?: string;
  request_type: 'initial' | 'follow-up' | 'pension' | 'business';
  status: 'pending' | 'approved' | 'declined' | 'completed';
  advisor_id?: string;
  appointment_id?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

export class ConsultationService {
  // Submit a new consultation request
  static async submitRequest(request: ConsultationRequest): Promise<ConsultationRequestRecord> {
    const { data, error } = await supabase
      .from('consultation_requests')
      .insert([
        {
          first_name: request.firstName,
          last_name: request.lastName,
          email: request.email,
          phone: request.phone,
          preferred_date: request.preferredDate,
          preferred_time: request.preferredTime,
          message: request.message,
          request_type: request.requestType,
          status: 'pending'
        }
      ])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to submit consultation request: ${error.message}`);
    }

    // Send email notification to admin
    await this.sendAdminNotification(data);

    return data;
  }

  // Get all consultation requests (admin only)
  static async getAllRequests(): Promise<ConsultationRequestRecord[]> {
    const { data, error } = await supabase
      .from('consultation_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch consultation requests: ${error.message}`);
    }

    return data || [];
  }

  // Update consultation request status
  static async updateRequestStatus(
    requestId: string, 
    status: 'approved' | 'declined',
    adminNotes?: string,
    advisorId?: string
  ): Promise<ConsultationRequestRecord> {
    const updateData: any = {
      status,
      admin_notes: adminNotes,
      updated_at: new Date().toISOString()
    };

    if (advisorId) {
      updateData.advisor_id = advisorId;
    }

    const { data, error } = await supabase
      .from('consultation_requests')
      .update(updateData)
      .eq('id', requestId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update consultation request: ${error.message}`);
    }

    // Send email notifications
    await this.sendStatusNotification(data);

    return data;
  }

  // Create appointment from approved consultation request
  static async createAppointmentFromRequest(
    requestId: string,
    advisorId: string,
    clientId?: string
  ): Promise<any> {
    // First get the consultation request
    const { data: request, error: requestError } = await supabase
      .from('consultation_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (requestError || !request) {
      throw new Error('Consultation request not found');
    }

    // Create appointment
    const startTime = new Date(`${request.preferred_date}T${request.preferred_time}`);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour duration

    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .insert([
        {
          client_id: clientId,
          advisor_id: advisorId,
          title: `${request.request_type === 'initial' ? 'Initial' : 'Follow-up'} Consultation - ${request.first_name} ${request.last_name}`,
          description: request.message || `Consultation request from ${request.first_name} ${request.last_name}`,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          status: 'scheduled'
        }
      ])
      .select()
      .single();

    if (appointmentError) {
      throw new Error(`Failed to create appointment: ${appointmentError.message}`);
    }

    // Update consultation request with appointment ID
    const { data: updatedRequest, error: updateError } = await supabase
      .from('consultation_requests')
      .update({ 
        appointment_id: appointment.id,
        status: 'approved'
      })
      .eq('id', requestId)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Failed to link appointment to consultation request: ${updateError.message}`);
    }

    return appointment;
  }

  // Send email notification to admin about new request
  private static async sendAdminNotification(request: ConsultationRequestRecord): Promise<void> {
    // In a real implementation, you would integrate with an email service like:
    // - SendGrid
    // - AWS SES
    // - Nodemailer with SMTP
    // - Resend
    
    // For now, we'll just log the notification
    console.log('📧 Admin Notification - New Consultation Request:', {
      id: request.id,
      name: `${request.first_name} ${request.last_name}`,
      email: request.email,
      type: request.request_type,
      preferredDate: request.preferred_date,
      preferredTime: request.preferred_time,
      message: request.message
    });

    // TODO: Implement actual email sending
    // Example with a hypothetical email service:
    /*
    await emailService.send({
      to: 'admin@targetedfinancialplanning.com',
      subject: `New Consultation Request from ${request.first_name} ${request.last_name}`,
      template: 'consultation-request-notification',
      data: {
        request,
        adminDashboardUrl: `${process.env.REACT_APP_BASE_URL}/admin/consultations`
      }
    });
    */
  }

  // Send email notification about request status change
  private static async sendStatusNotification(request: ConsultationRequestRecord): Promise<void> {
    console.log('📧 Status Notification - Consultation Request Update:', {
      id: request.id,
      name: `${request.first_name} ${request.last_name}`,
      email: request.email,
      status: request.status,
      adminNotes: request.admin_notes
    });

    // TODO: Implement actual email sending
    // Example:
    /*
    await emailService.send({
      to: request.email,
      subject: `Your Consultation Request - ${request.status === 'approved' ? 'Approved' : 'Declined'}`,
      template: 'consultation-status-update',
      data: {
        request,
        status: request.status,
        adminNotes: request.admin_notes
      }
    });
    */
  }

  // Get consultation requests for a specific advisor
  static async getRequestsForAdvisor(advisorId: string): Promise<ConsultationRequestRecord[]> {
    const { data, error } = await supabase
      .from('consultation_requests')
      .select('*')
      .eq('advisor_id', advisorId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch advisor consultation requests: ${error.message}`);
    }

    return data || [];
  }
}
