-- First update existing data to use new status values
-- 'completed' becomes 'approved', 'generating' stays as 'generating', 'draft' stays as 'draft'
UPDATE public.itineraries
SET status = 'approved'
WHERE status NOT IN ('draft', 'generating', 'approved', 'in_progress', 'completed', 'archived');

-- Update 'completed' to 'approved' if any exist
UPDATE public.itineraries
SET status = 'approved'
WHERE status = 'completed';

-- Drop old constraint if exists
ALTER TABLE public.itineraries 
DROP CONSTRAINT IF EXISTS itineraries_status_check;

-- Add new constraint with all status values
ALTER TABLE public.itineraries
ADD CONSTRAINT itineraries_status_check 
CHECK (status IN ('draft', 'generating', 'approved', 'in_progress', 'completed', 'archived'));

-- Update default status to draft
ALTER TABLE public.itineraries 
ALTER COLUMN status SET DEFAULT 'draft';

-- Add archived_at column to track when an itinerary was archived
ALTER TABLE public.itineraries
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE;