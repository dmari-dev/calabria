-- Add personal and professional information columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN first_name TEXT,
ADD COLUMN last_name TEXT,
ADD COLUMN birth_date DATE,
ADD COLUMN phone TEXT,
ADD COLUMN address TEXT,
ADD COLUMN city TEXT,
ADD COLUMN country TEXT,
ADD COLUMN profession TEXT,
ADD COLUMN company TEXT,
ADD COLUMN bio TEXT;