-- Adicionar coluna para múltiplos cursos em leis secas
ALTER TABLE public.leis_secas 
ADD COLUMN IF NOT EXISTS cursos_ids UUID[];

-- Remover coluna ordem que não é mais necessária
ALTER TABLE public.leis_secas 
DROP COLUMN IF EXISTS ordem;

-- Atualizar políticas RLS para incluir a nova coluna
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