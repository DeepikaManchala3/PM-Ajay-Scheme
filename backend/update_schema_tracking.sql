-- Add columns for Project Tracking Module

ALTER TABLE public.approved_projects 
ADD COLUMN IF NOT EXISTS latitude numeric,
ADD COLUMN IF NOT EXISTS longitude numeric,
ADD COLUMN IF NOT EXISTS financial_year text DEFAULT '2024-25';

-- If you need to backfill existing data with default coordinates (e.g. Center of India or State Capital), do it here or via script.
-- For now, we allow them to be null, but the seeding script will populate them.

COMMENT ON COLUMN public.approved_projects.financial_year IS 'Financial Year string, e.g., 2024-25, 2023-24';
