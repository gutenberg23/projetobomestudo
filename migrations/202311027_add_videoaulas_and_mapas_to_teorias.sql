-- Add videoaulas and mapas_mentais columns to teorias table
ALTER TABLE public.teorias 
ADD COLUMN IF NOT EXISTS videoaulas TEXT[],
ADD COLUMN IF NOT EXISTS mapas_mentais TEXT[];

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_teorias_videoaulas ON public.teorias USING GIN (videoaulas);
CREATE INDEX IF NOT EXISTS idx_teorias_mapas_mentais ON public.teorias USING GIN (mapas_mentais);