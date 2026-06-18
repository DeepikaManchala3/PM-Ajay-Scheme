-- Add implementing_agency_id column to district_proposals if it doesn't exist
-- This allows implementing agencies to create proposals directly

-- First check if column exists, then add it if not
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'district_proposals' 
        AND column_name = 'implementing_agency_id'
    ) THEN
        ALTER TABLE district_proposals 
        ADD COLUMN implementing_agency_id UUID REFERENCES implementing_agencies(id);
        
        COMMENT ON COLUMN district_proposals.implementing_agency_id IS 'References the implementing agency that created this proposal (optional - can be null for district-created proposals)';
    END IF;
END
$$;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_district_proposals_implementing_agency_id 
ON district_proposals(implementing_agency_id);

-- Add phone_number column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'district_proposals' 
        AND column_name = 'phone_number'
    ) THEN
        ALTER TABLE district_proposals 
        ADD COLUMN phone_number VARCHAR(20);
    END IF;
END
$$;
