-- Add missing columns to event_tickets table for benefit tracking
ALTER TABLE public.event_tickets 
ADD COLUMN used_benefits text[] DEFAULT '{}',
ADD COLUMN total_benefits_used integer DEFAULT 0;