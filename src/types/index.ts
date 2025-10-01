export interface Client {
  id: string;
  created_at: string;
  updated_at: string;
  advisor_id: string;
  personal_details: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address: {
      street: string;
      city: string;
      state: string;
      zip: string;
      country: string;
    };
    date_of_birth: string;
    occupation: string;
  };
  financial_details: {
    income: number;
    expenses: number;
    assets: number;
    liabilities: number;
    insurance_policies: InsurancePolicy[];
    investments: Investment[];
  };
  tags: string[];
  status: 'active' | 'inactive' | 'prospect';
  notes: string;
}

export interface InsurancePolicy {
  id: string;
  type: 'life' | 'health' | 'disability' | 'long_term_care' | 'other';
  provider: string;
  policy_number: string;
  coverage_amount: number;
  premium: number;
  beneficiary: string;
  notes: string;
}

export interface Investment {
  id: string;
  type: 'stocks' | 'bonds' | 'mutual_funds' | 'etfs' | 'real_estate' | 'other';
  name: string;
  symbol?: string;
  quantity: number;
  current_value: number;
  purchase_price: number;
  purchase_date: string;
  notes: string;
}

export interface Interaction {
  id: string;
  client_id: string;
  advisor_id: string;
  type: 'call' | 'email' | 'meeting' | 'note';
  subject: string;
  content: string;
  date: string;
  duration?: number; // in minutes
  follow_up_required: boolean;
  follow_up_date?: string;
  created_at: string;
}

export interface Task {
  id: string;
  client_id?: string;
  advisor_id: string;
  title: string;
  description: string;
  due_date: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  completed_at?: string;
  clients?: {
    personal_details: {
      first_name: string;
      last_name: string;
    };
  };
}

export interface Appointment {
  id: string;
  client_id: string;
  advisor_id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  location: string;
  meeting_link?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  created_at: string;
  clients?: {
    personal_details: {
      first_name: string;
      last_name: string;
    };
  };
}

export interface Document {
  id: string;
  client_id: string;
  advisor_id: string;
  name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  category: 'agreement' | 'statement' | 'tax_document' | 'insurance' | 'other';
  uploaded_at: string;
}

export interface FinancialGoal {
  id: string;
  client_id: string;
  advisor_id: string;
  title: string;
  description: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  priority: 'low' | 'medium' | 'high';
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface Advisor {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  company_name: string;
  created_at: string;
  updated_at: string;
}
