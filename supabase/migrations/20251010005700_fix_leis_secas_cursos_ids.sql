-- Corrigir coluna cursos_ids na tabela leis_secas
-- Esta migração garante que a coluna cursos_ids exista na tabela leis_secas

-- Adicionar coluna para múltiplos cursos em leis secas (correção)
ALTER TABLE public.leis_secas 
ADD COLUMN IF NOT EXISTS cursos_ids UUID[];

-- Atualizar políticas RLS para incluir a nova coluna (se necessário)
DROP POLICY IF EXISTS "Leitura pública de leis secas" ON public.leis_secas;
CREATE POLICY "Leitura pública de leis secas"
ON public.leis_secas
FOR SELECT
TO public
USING (ativo = true);

DROP POLICY IF EXISTS "Admins gerenciam leis secas" ON public.leis_secas;
CREATE POLICY "Admins gerenciam leis secas"
ON public.leis_secas
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Atualizar dados existentes para garantir compatibilidade
UPDATE public.leis_secas 
SET cursos_ids = ARRAY[curso_id]::UUID[]
WHERE cursos_ids IS NULL OR cursos_ids = '{}';