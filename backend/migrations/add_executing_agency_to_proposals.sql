-- Add executing_agency_id column to district_proposals table
-- This allows implementing agencies to assign approved projects to executing agencies

ALTER TABLE district_proposals 
ADD COLUMN IF NOT EXISTS executing_agency_id UUID REFERENCES agency_assignments(id);

-- Also add a status value for assigned proposals
-- The status flow: SUBMITTED -> APPROVED_BY_STATE -> APPROVED_BY_MINISTRY -> ASSIGNED_TO_EA

COMMENT ON COLUMN district_proposals.executing_agency_id IS 'Reference to the executing agency assigned to this project';
