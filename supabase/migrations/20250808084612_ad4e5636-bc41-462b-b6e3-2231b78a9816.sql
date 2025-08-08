-- Update events table to remove pricing and add new fields
ALTER TABLE public.events DROP COLUMN IF EXISTS ticket_price;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS sessions TEXT[] DEFAULT '{}';
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS session_types TEXT[] DEFAULT '{}';

-- Update event_tickets table to add new fields
ALTER TABLE public.event_tickets DROP COLUMN IF EXISTS ticket_price;
ALTER TABLE public.event_tickets ADD COLUMN IF NOT EXISTS ticket_role TEXT DEFAULT 'attendee';
ALTER TABLE public.event_tickets ADD COLUMN IF NOT EXISTS meal_options TEXT[] DEFAULT '{}';
ALTER TABLE public.event_tickets ADD COLUMN IF NOT EXISTS accommodation_type TEXT;
ALTER TABLE public.event_tickets ADD COLUMN IF NOT EXISTS transport_included BOOLEAN DEFAULT false;
ALTER TABLE public.event_tickets ADD COLUMN IF NOT EXISTS ticket_design_url TEXT;
ALTER TABLE public.event_tickets ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Insert more benefit options
INSERT INTO public.event_benefits (name, description, category) VALUES
-- Role types
('Trainer', 'Event trainer/instructor', 'role'),
('Artist', 'Event artist', 'role'),
('Comedian', 'Comedy performer', 'role'),
('Speaker', 'Event speaker', 'role'),
('Guest of Honour', 'Special guest', 'role'),
('Musician', 'Musical performer', 'role'),
('Actor', 'Acting performer', 'role'),
('Player', 'Sports player/athlete', 'role'),
('Pastor', 'Religious leader', 'role'),
('Panelist', 'Panel discussion participant', 'role'),

-- Meal options
('Full Meal', 'Complete meal service', 'meal'),
('Drinks Only', 'Beverages only', 'meal'),
('Breakfast', 'Morning meal', 'meal'),
('Lunch', 'Midday meal', 'meal'),
('Dinner', 'Evening meal', 'meal'),
('Dessert', 'Sweet course', 'meal'),
('Snacks', 'Light refreshments', 'meal'),

-- Accommodation
('Hotel Stay', 'Hotel accommodation', 'accommodation'),
('Hostel', 'Budget accommodation', 'accommodation'),
('Guest House', 'Guest house stay', 'accommodation'),
('Home Stay', 'Family accommodation', 'accommodation'),

-- Transport
('Bus Transport', 'Bus transportation', 'transport'),
('Flight', 'Air transportation', 'transport'),
('Train', 'Rail transportation', 'transport'),
('Car Rental', 'Vehicle rental', 'transport'),

-- Sessions
('Morning Session', 'AM event session', 'session'),
('Afternoon Session', 'PM event session', 'session'),
('Evening Session', 'Evening event session', 'session'),
('Night Session', 'Night event session', 'session'),

-- Session Types
('Training', 'Educational training', 'session_type'),
('Watching', 'Viewing/observation', 'session_type'),
('Playing', 'Interactive participation', 'session_type'),
('Panel Discussion', 'Group discussion', 'session_type'),
('Workshop', 'Hands-on learning', 'session_type'),
('Performance', 'Entertainment show', 'session_type')

ON CONFLICT (name) DO NOTHING;