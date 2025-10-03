-- Consultation requests schema for individual advisor
-- Anyone can submit requests, single advisor manages them

-- Create consultation_requests table
CREATE TABLE IF NOT EXISTS consultation_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  preferred_date DATE NOT NULL,
  preferred_time TIME NOT NULL,
  message TEXT,
  request_type TEXT DEFAULT 'initial' CHECK (request_type IN ('initial', 'follow-up', 'pension', 'business')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined', 'completed')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_consultation_requests_status ON consultation_requests(status);
CREATE INDEX IF NOT EXISTS idx_consultation_requests_created_at ON consultation_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_consultation_requests_email ON consultation_requests(email);

-- Enable Row Level Security (RLS)
ALTER TABLE consultation_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Drop existing policies first (if they exist) to avoid conflicts
DROP POLICY IF EXISTS "Anyone can create consultation requests" ON consultation_requests;
DROP POLICY IF EXISTS "Anyone can view consultation requests" ON consultation_requests;
DROP POLICY IF EXISTS "Anyone can update consultation requests" ON consultation_requests;

-- Anyone can insert consultation requests (public form - no authentication required)
CREATE POLICY "Anyone can create consultation requests" ON consultation_requests
  FOR INSERT WITH CHECK (true);

-- Anyone can view consultation requests (for admin management)
CREATE POLICY "Anyone can view consultation requests" ON consultation_requests
  FOR SELECT USING (true);

-- Anyone can update consultation requests (for admin management)
CREATE POLICY "Anyone can update consultation requests" ON consultation_requests
  FOR UPDATE USING (true);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_consultation_requests_updated_at ON consultation_requests;
CREATE TRIGGER update_consultation_requests_updated_at 
  BEFORE UPDATE ON consultation_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
