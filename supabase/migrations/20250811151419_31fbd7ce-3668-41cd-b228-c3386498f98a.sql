-- Create custom ticket templates table
CREATE TABLE public.custom_ticket_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  canvas_width INTEGER NOT NULL DEFAULT 605,
  canvas_height INTEGER NOT NULL DEFAULT 151,
  elements JSONB NOT NULL DEFAULT '[]'::jsonb,
  background_color TEXT,
  background_image_url TEXT,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.custom_ticket_templates ENABLE ROW LEVEL SECURITY;

-- Create policies for custom templates
CREATE POLICY "Users can create their own templates" 
ON public.custom_ticket_templates 
FOR INSERT 
WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can view their own templates" 
ON public.custom_ticket_templates 
FOR SELECT 
USING (auth.uid() = creator_id OR is_public = true);

CREATE POLICY "Users can update their own templates" 
ON public.custom_ticket_templates 
FOR UPDATE 
USING (auth.uid() = creator_id);

CREATE POLICY "Users can delete their own templates" 
ON public.custom_ticket_templates 
FOR DELETE 
USING (auth.uid() = creator_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_custom_ticket_templates_updated_at
BEFORE UPDATE ON public.custom_ticket_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();