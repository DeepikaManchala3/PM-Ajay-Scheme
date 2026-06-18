-- =====================================================
-- Agency Registrations Table Schema
-- =====================================================
-- This table stores pending agency registration requests
-- State admins will approve/reject these registrations
-- =====================================================

CREATE TABLE IF NOT EXISTS agency_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  gst_number TEXT NOT NULL,
  state TEXT NOT NULL,
  districts TEXT[] NOT NULL,
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_agency_registrations_email ON agency_registrations(email);
CREATE INDEX IF NOT EXISTS idx_agency_registrations_status ON agency_registrations(status);
CREATE INDEX IF NOT EXISTS idx_agency_registrations_state ON agency_registrations(state);

-- Add trigger to update 'updated_at' timestamp automatically
CREATE OR REPLACE FUNCTION update_agency_registrations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_agency_registrations_updated_at
  BEFORE UPDATE ON agency_registrations
  FOR EACH ROW
  EXECUTE FUNCTION update_agency_registrations_updated_at();

-- Comments for documentation
COMMENT ON TABLE agency_registrations IS 'Stores pending agency registration requests awaiting state admin approval';
COMMENT ON COLUMN agency_registrations.id IS 'Unique identifier for each registration';
COMMENT ON COLUMN agency_registrations.agency_name IS 'Name of the implementing agency';
COMMENT ON COLUMN agency_registrations.phone_number IS '10-digit phone number';
COMMENT ON COLUMN agency_registrations.email IS 'Unique email address for the agency';
COMMENT ON COLUMN agency_registrations.password IS 'Hashed password for authentication';
COMMENT ON COLUMN agency_registrations.gst_number IS 'GST registration number';
COMMENT ON COLUMN agency_registrations.state IS 'State where agency operates';
COMMENT ON COLUMN agency_registrations.districts IS 'Array of district names where agency is available for work';
COMMENT ON COLUMN agency_registrations.status IS 'Registration status: Pending, Approved, or Rejected';
