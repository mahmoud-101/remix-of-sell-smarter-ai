-- Create content_exports table to track exports
CREATE TABLE public.content_exports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content_text TEXT NOT NULL,
  export_format TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.content_exports ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own exports" 
ON public.content_exports 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own exports" 
ON public.content_exports 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own exports" 
ON public.content_exports 
FOR DELETE 
USING (auth.uid() = user_id);