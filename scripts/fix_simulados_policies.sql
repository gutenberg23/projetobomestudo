-- Script para corrigir políticas da tabela simulados
-- Este script deve ser executado no editor SQL do Supabase

-- Habilitar RLS (já deve estar habilitado, mas vamos garantir)
ALTER TABLE public.simulados ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "Admins gerenciam simulados" ON public.simulados;
DROP POLICY IF EXISTS "Professores veem simulados" ON public.simulados;

-- Política para administradores gerenciarem simulados
CREATE POLICY "Admins gerenciam simulados"
ON public.simulados FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Política para professores visualizarem simulados
CREATE POLICY "Professores veem simulados"
ON public.simulados FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'professor') OR public.is_admin());