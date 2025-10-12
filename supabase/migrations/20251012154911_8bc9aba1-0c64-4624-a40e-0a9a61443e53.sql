-- Create table for itinerary sharing
CREATE TABLE public.itinerary_shares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  itinerary_id UUID NOT NULL REFERENCES public.itineraries(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL,
  shared_with_email TEXT NOT NULL,
  shared_with_user_id UUID,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT check_status CHECK (status IN ('pending', 'accepted', 'rejected'))
);

-- Enable Row Level Security
ALTER TABLE public.itinerary_shares ENABLE ROW LEVEL SECURITY;

-- Owner can view their shares
CREATE POLICY "Owners can view their shares"
ON public.itinerary_shares
FOR SELECT
USING (auth.uid() = owner_id);

-- Owner can create shares
CREATE POLICY "Owners can create shares"
ON public.itinerary_shares
FOR INSERT
WITH CHECK (auth.uid() = owner_id);

-- Owner can delete shares
CREATE POLICY "Owners can delete shares"
ON public.itinerary_shares
FOR DELETE
USING (auth.uid() = owner_id);

-- Shared users can view shares meant for them
CREATE POLICY "Shared users can view their shares"
ON public.itinerary_shares
FOR SELECT
USING (
  auth.uid() = shared_with_user_id OR
  auth.jwt() ->> 'email' = shared_with_email
);

-- Shared users can update status
CREATE POLICY "Shared users can update share status"
ON public.itinerary_shares
FOR UPDATE
USING (
  auth.uid() = shared_with_user_id OR
  auth.jwt() ->> 'email' = shared_with_email
)
WITH CHECK (
  auth.uid() = shared_with_user_id OR
  auth.jwt() ->> 'email' = shared_with_email
);

-- Add trigger for updated_at
CREATE TRIGGER update_itinerary_shares_updated_at
BEFORE UPDATE ON public.itinerary_shares
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update RLS policy for itineraries to allow viewing shared itineraries
CREATE POLICY "Users can view shared itineraries"
ON public.itineraries
FOR SELECT
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM public.itinerary_shares
    WHERE itinerary_id = itineraries.id
    AND (shared_with_user_id = auth.uid() OR shared_with_email = auth.jwt() ->> 'email')
    AND status = 'accepted'
  )
);