-- Corrigir a foreign key constraint da tabela teorias
-- Mudar de REFERENCES auth.users(id) para REFERENCES professores(id)

-- Primeiro remover a constraint existente
ALTER TABLE public.teorias 
DROP CONSTRAINT IF EXISTS teorias_professor_id_fkey;

-- Adicionar a nova constraint correta
ALTER TABLE public.teorias 
ADD CONSTRAINT teorias_professor_id_fkey 
FOREIGN KEY (professor_id) REFERENCES professores(id);