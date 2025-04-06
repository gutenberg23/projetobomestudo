-- Add type column to likes_gabaritos
ALTER TABLE public.likes_gabaritos ADD COLUMN IF NOT EXISTS type VARCHAR(10) DEFAULT 'teacher';

-- Update existing records to set type='teacher' for consistency
UPDATE public.likes_gabaritos SET type = 'teacher' WHERE type IS NULL;

-- Add a unique constraint to prevent duplicate likes
ALTER TABLE public.likes_gabaritos 
DROP CONSTRAINT IF EXISTS likes_gabaritos_questao_id_usuario_id_key;

ALTER TABLE public.likes_gabaritos 
ADD CONSTRAINT likes_gabaritos_questao_id_usuario_id_type_key 
UNIQUE (questao_id, usuario_id, type); 