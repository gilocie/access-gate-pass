-- Create events table
CREATE TABLE public.events (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    organizer_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    event_date timestamp with time zone NOT NULL,
    event_end_date timestamp with time zone,
    location text,
    max_attendees integer,
    ticket_price numeric(10,2) DEFAULT 0,
    company_name text,
    available_benefits text[] DEFAULT '{}',
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create event_tickets table
CREATE TABLE public.event_tickets (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    ticket_holder_name text NOT NULL,
    ticket_holder_email text NOT NULL,
    qr_code text NOT NULL UNIQUE,
    pin_code text NOT NULL,
    selected_benefits text[] DEFAULT '{}',
    is_used boolean DEFAULT false,
    used_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create event_benefits table for available benefits
CREATE TABLE public.event_benefits (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL UNIQUE,
    category text NOT NULL,
    description text,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Insert default benefits
INSERT INTO public.event_benefits (name, category, description) VALUES
('Training', 'Session', 'Professional training session'),
('Accommodation', 'Lodging', 'Hotel accommodation'),
('Meal', 'Catering', 'Event meals and refreshments'),
('Certificate', 'Award', 'Completion certificate'),
('Watch', 'Gift', 'Event commemorative watch'),
('Artist Performance', 'Entertainment', 'Live artist performance'),
('Presenter Session', 'Session', 'Expert presenter session'),
('Speaker Session', 'Session', 'Keynote speaker session'),
('Panelist Discussion', 'Session', 'Panel discussion'),
('Actor Performance', 'Entertainment', 'Live actor performance'),
('Musician Performance', 'Entertainment', 'Live music performance'),
('Comedian Show', 'Entertainment', 'Comedy performance'),
('Morning Session', 'Schedule', 'Morning session access'),
('Afternoon Session', 'Schedule', 'Afternoon session access');

-- Enable Row Level Security
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_benefits ENABLE ROW LEVEL SECURITY;

-- Create policies for events
CREATE POLICY "Organizers can view their own events" 
ON public.events 
FOR SELECT 
USING (auth.uid() = organizer_id);

CREATE POLICY "Organizers can create events" 
ON public.events 
FOR INSERT 
WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Organizers can update their own events" 
ON public.events 
FOR UPDATE 
USING (auth.uid() = organizer_id);

CREATE POLICY "Organizers can delete their own events" 
ON public.events 
FOR DELETE 
USING (auth.uid() = organizer_id);

-- Create policies for event_tickets
CREATE POLICY "Event organizers can view tickets for their events" 
ON public.event_tickets 
FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM public.events 
    WHERE events.id = event_tickets.event_id 
    AND events.organizer_id = auth.uid()
));

CREATE POLICY "Event organizers can create tickets for their events" 
ON public.event_tickets 
FOR INSERT 
WITH CHECK (EXISTS (
    SELECT 1 FROM public.events 
    WHERE events.id = event_tickets.event_id 
    AND events.organizer_id = auth.uid()
));

CREATE POLICY "Event organizers can update tickets for their events" 
ON public.event_tickets 
FOR UPDATE 
USING (EXISTS (
    SELECT 1 FROM public.events 
    WHERE events.id = event_tickets.event_id 
    AND events.organizer_id = auth.uid()
));

-- Create policies for event_benefits (read-only for everyone)
CREATE POLICY "Anyone can view event benefits" 
ON public.event_benefits 
FOR SELECT 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_event_tickets_updated_at
BEFORE UPDATE ON public.event_tickets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add company_name column to profiles table for event organizers
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_name text;