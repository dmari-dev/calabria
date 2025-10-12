-- Create enum for activity status
CREATE TYPE public.activity_status AS ENUM ('pending', 'in_progress', 'completed');

-- Create activity_statuses table to track individual activity progress
CREATE TABLE public.activity_statuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  itinerary_id UUID NOT NULL REFERENCES public.itineraries(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  day_number INTEGER NOT NULL,
  activity_index INTEGER NOT NULL,
  status activity_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(itinerary_id, day_number, activity_index)
);

-- Enable RLS
ALTER TABLE public.activity_statuses ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view activity statuses for their itineraries"
ON public.activity_statuses
FOR SELECT
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM public.itineraries
    WHERE itineraries.id = activity_statuses.itinerary_id
    AND itineraries.user_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.itinerary_shares
    WHERE itinerary_shares.itinerary_id = activity_statuses.itinerary_id
    AND (itinerary_shares.shared_with_user_id = auth.uid() OR itinerary_shares.shared_with_email = (auth.jwt() ->> 'email'))
    AND itinerary_shares.status = 'accepted'
  )
);

CREATE POLICY "Users can insert activity statuses for their itineraries"
ON public.activity_statuses
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.itineraries
    WHERE itineraries.id = activity_statuses.itinerary_id
    AND itineraries.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update activity statuses for their itineraries"
ON public.activity_statuses
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.itineraries
    WHERE itineraries.id = activity_statuses.itinerary_id
    AND itineraries.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete activity statuses for their itineraries"
ON public.activity_statuses
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.itineraries
    WHERE itineraries.id = activity_statuses.itinerary_id
    AND itineraries.user_id = auth.uid()
  )
);

-- Create trigger to update updated_at
CREATE TRIGGER update_activity_statuses_updated_at
BEFORE UPDATE ON public.activity_statuses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_activity_statuses_itinerary ON public.activity_statuses(itinerary_id);
CREATE INDEX idx_activity_statuses_user ON public.activity_statuses(user_id);