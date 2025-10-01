-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create advisors table
CREATE TABLE advisors (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID UNIQUE NOT NULL, -- Links to Supabase auth.users
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  company_name TEXT,
  role TEXT DEFAULT 'advisor' CHECK (role IN ('admin', 'advisor')),
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create clients table
CREATE TABLE clients (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  advisor_id UUID REFERENCES advisors(id) ON DELETE CASCADE NOT NULL,
  personal_details JSONB NOT NULL DEFAULT '{}',
  financial_details JSONB NOT NULL DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'prospect')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create interactions table
CREATE TABLE interactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  advisor_id UUID REFERENCES advisors(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('call', 'email', 'meeting', 'note')),
  subject TEXT NOT NULL,
  content TEXT,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration INTEGER, -- in minutes
  follow_up_required BOOLEAN DEFAULT FALSE,
  follow_up_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  advisor_id UUID REFERENCES advisors(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create appointments table
CREATE TABLE appointments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  advisor_id UUID REFERENCES advisors(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  meeting_link TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create documents table
CREATE TABLE documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  advisor_id UUID REFERENCES advisors(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  category TEXT DEFAULT 'other' CHECK (category IN ('agreement', 'statement', 'tax_document', 'insurance', 'other')),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create financial_goals table
CREATE TABLE financial_goals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  advisor_id UUID REFERENCES advisors(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  target_amount DECIMAL(15,2) NOT NULL,
  current_amount DECIMAL(15,2) DEFAULT 0,
  target_date DATE NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_clients_advisor_id ON clients(advisor_id);
CREATE INDEX idx_interactions_client_id ON interactions(client_id);
CREATE INDEX idx_interactions_advisor_id ON interactions(advisor_id);
CREATE INDEX idx_tasks_advisor_id ON tasks(advisor_id);
CREATE INDEX idx_tasks_client_id ON tasks(client_id);
CREATE INDEX idx_appointments_advisor_id ON appointments(advisor_id);
CREATE INDEX idx_appointments_client_id ON appointments(client_id);
CREATE INDEX idx_documents_client_id ON documents(client_id);
CREATE INDEX idx_financial_goals_client_id ON financial_goals(client_id);

-- Enable Row Level Security (RLS)
ALTER TABLE advisors ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_goals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Admins can see all advisors, users can see their own
CREATE POLICY "Advisors can view own data" ON advisors
  FOR SELECT USING (
    user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM advisors 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can insert, update, delete advisors
CREATE POLICY "Only admins can manage advisors" ON advisors
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM advisors 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Advisors can view own clients" ON clients
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM advisors 
      WHERE id = clients.advisor_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Advisors can view own interactions" ON interactions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM advisors 
      WHERE id = interactions.advisor_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Advisors can view own tasks" ON tasks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM advisors 
      WHERE id = tasks.advisor_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Advisors can view own appointments" ON appointments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM advisors 
      WHERE id = appointments.advisor_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Advisors can view own documents" ON documents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM advisors 
      WHERE id = documents.advisor_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Advisors can view own financial goals" ON financial_goals
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM advisors 
      WHERE id = financial_goals.advisor_id AND user_id = auth.uid()
    )
  );

-- Create function to handle updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_advisors_updated_at BEFORE UPDATE ON advisors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financial_goals_updated_at BEFORE UPDATE ON financial_goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);

-- Create storage policy for documents
CREATE POLICY "Advisors can upload documents" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Advisors can view own documents" ON storage.objects
  FOR SELECT USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Advisors can update own documents" ON storage.objects
  FOR UPDATE USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Advisors can delete own documents" ON storage.objects
  FOR DELETE USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
