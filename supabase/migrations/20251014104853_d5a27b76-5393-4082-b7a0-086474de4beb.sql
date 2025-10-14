-- =====================================================
-- CLEAN DATABASE SETUP FOR CULTUREXPERIENCE
-- =====================================================

-- Drop existing tables if they exist (in correct order due to dependencies)
DROP TABLE IF EXISTS public.activity_statuses CASCADE;
DROP TABLE IF EXISTS public.itinerary_shares CASCADE;
DROP TABLE IF EXISTS public.platform_itineraries CASCADE;
DROP TABLE IF EXISTS public.itineraries CASCADE;
DROP TABLE IF EXISTS public.user_preferences CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop existing types
DROP TYPE IF EXISTS public.app_role CASCADE;
DROP TYPE IF EXISTS public.activity_status CASCADE;

-- Drop existing functions
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_admin_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.has_role(uuid, app_role) CASCADE;

-- =====================================================
-- CREATE CUSTOM TYPES
-- =====================================================

CREATE TYPE public.app_role AS ENUM ('admin', 'user');
CREATE TYPE public.activity_status AS ENUM ('pending', 'in_progress', 'completed');

-- =====================================================
-- CREATE TABLES
-- =====================================================

-- Profiles table - Extended user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  display_name TEXT,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  country TEXT,
  profession TEXT,
  company TEXT,
  birth_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User roles table - Separate table for security
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- User preferences table
CREATE TABLE public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  travel_style TEXT DEFAULT 'moderate',
  cultural_interests TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Itineraries table - User personal itineraries
CREATE TABLE public.itineraries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  destination TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  participants_count INTEGER DEFAULT 1,
  participants_type TEXT,
  travel_pace TEXT DEFAULT 'moderate',
  specific_interests TEXT,
  status TEXT DEFAULT 'draft',
  ai_content JSONB,
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Platform itineraries table - Admin curated itineraries
CREATE TABLE public.platform_itineraries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL,
  title TEXT NOT NULL,
  destination TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  participants_count INTEGER DEFAULT 1,
  participants_type TEXT,
  travel_pace TEXT DEFAULT 'moderate',
  specific_interests TEXT,
  ai_content JSONB,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Activity statuses table - Track activity completion
CREATE TABLE public.activity_statuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  itinerary_id UUID NOT NULL,
  user_id UUID NOT NULL,
  day_number INTEGER NOT NULL,
  activity_index INTEGER NOT NULL,
  status activity_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(itinerary_id, day_number, activity_index)
);

-- Itinerary shares table - Share itineraries with other users
CREATE TABLE public.itinerary_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  itinerary_id UUID NOT NULL,
  owner_id UUID NOT NULL,
  shared_with_user_id UUID,
  shared_with_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- CREATE INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_preferences_user_id ON public.user_preferences(user_id);
CREATE INDEX idx_itineraries_user_id ON public.itineraries(user_id);
CREATE INDEX idx_itineraries_status ON public.itineraries(status);
CREATE INDEX idx_platform_itineraries_published ON public.platform_itineraries(is_published);
CREATE INDEX idx_activity_statuses_itinerary ON public.activity_statuses(itinerary_id);
CREATE INDEX idx_activity_statuses_user ON public.activity_statuses(user_id);
CREATE INDEX idx_itinerary_shares_itinerary ON public.itinerary_shares(itinerary_id);
CREATE INDEX idx_itinerary_shares_owner ON public.itinerary_shares(owner_id);

-- =====================================================
-- CREATE FUNCTIONS
-- =====================================================

-- Function to check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create profile for new user
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;

-- Function to assign roles to new users
CREATE OR REPLACE FUNCTION public.handle_admin_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Assign admin role to specific email
  IF NEW.email = 'amministratore@culture.it' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    -- Assign user role to all other users
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

-- =====================================================
-- CREATE TRIGGERS
-- =====================================================

-- Triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_itineraries_updated_at
  BEFORE UPDATE ON public.itineraries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_platform_itineraries_updated_at
  BEFORE UPDATE ON public.platform_itineraries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_activity_statuses_updated_at
  BEFORE UPDATE ON public.activity_statuses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_itinerary_shares_updated_at
  BEFORE UPDATE ON public.itinerary_shares
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Triggers for new user handling
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_admin_user();

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itineraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_itineraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itinerary_shares ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- CREATE RLS POLICIES - PROFILES
-- =====================================================

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- =====================================================
-- CREATE RLS POLICIES - USER ROLES
-- =====================================================

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles"
  ON public.user_roles FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
  ON public.user_roles FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- =====================================================
-- CREATE RLS POLICIES - USER PREFERENCES
-- =====================================================

CREATE POLICY "Users can view their own preferences"
  ON public.user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
  ON public.user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON public.user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- =====================================================
-- CREATE RLS POLICIES - ITINERARIES
-- =====================================================

CREATE POLICY "Users can view their own itineraries"
  ON public.itineraries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view shared itineraries"
  ON public.itineraries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.itinerary_shares
      WHERE itinerary_shares.itinerary_id = itineraries.id
        AND (
          itinerary_shares.shared_with_user_id = auth.uid()
          OR itinerary_shares.shared_with_email = (auth.jwt() ->> 'email')
        )
        AND itinerary_shares.status = 'accepted'
    )
  );

CREATE POLICY "Admins can view all itineraries"
  ON public.itineraries FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create their own itineraries"
  ON public.itineraries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own itineraries"
  ON public.itineraries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own itineraries"
  ON public.itineraries FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- CREATE RLS POLICIES - PLATFORM ITINERARIES
-- =====================================================

CREATE POLICY "Everyone can view published platform itineraries"
  ON public.platform_itineraries FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admins can view all platform itineraries"
  ON public.platform_itineraries FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert platform itineraries"
  ON public.platform_itineraries FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update platform itineraries"
  ON public.platform_itineraries FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete platform itineraries"
  ON public.platform_itineraries FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- =====================================================
-- CREATE RLS POLICIES - ACTIVITY STATUSES
-- =====================================================

CREATE POLICY "Users can view activity statuses for their itineraries"
  ON public.activity_statuses FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.itineraries
      WHERE itineraries.id = activity_statuses.itinerary_id
        AND itineraries.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.itinerary_shares
      WHERE itinerary_shares.itinerary_id = activity_statuses.itinerary_id
        AND (
          itinerary_shares.shared_with_user_id = auth.uid()
          OR itinerary_shares.shared_with_email = (auth.jwt() ->> 'email')
        )
        AND itinerary_shares.status = 'accepted'
    )
  );

CREATE POLICY "Users can insert activity statuses for their itineraries"
  ON public.activity_statuses FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.itineraries
      WHERE itineraries.id = activity_statuses.itinerary_id
        AND itineraries.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update activity statuses for their itineraries"
  ON public.activity_statuses FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.itineraries
      WHERE itineraries.id = activity_statuses.itinerary_id
        AND itineraries.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete activity statuses for their itineraries"
  ON public.activity_statuses FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.itineraries
      WHERE itineraries.id = activity_statuses.itinerary_id
        AND itineraries.user_id = auth.uid()
    )
  );

-- =====================================================
-- CREATE RLS POLICIES - ITINERARY SHARES
-- =====================================================

CREATE POLICY "Owners can view their shares"
  ON public.itinerary_shares FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Shared users can view their shares"
  ON public.itinerary_shares FOR SELECT
  USING (
    auth.uid() = shared_with_user_id
    OR (auth.jwt() ->> 'email') = shared_with_email
  );

CREATE POLICY "Owners can create shares"
  ON public.itinerary_shares FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Shared users can update share status"
  ON public.itinerary_shares FOR UPDATE
  USING (
    auth.uid() = shared_with_user_id
    OR (auth.jwt() ->> 'email') = shared_with_email
  )
  WITH CHECK (
    auth.uid() = shared_with_user_id
    OR (auth.jwt() ->> 'email') = shared_with_email
  );

CREATE POLICY "Owners can delete shares"
  ON public.itinerary_shares FOR DELETE
  USING (auth.uid() = owner_id);