-- Políticas de segurança para a tabela site_visits
-- Execute este SQL no SQL Editor do Supabase

-- Habilitar RLS na tabela
ALTER TABLE public.site_visits ENABLE ROW LEVEL SECURITY;

-- Política para permitir que qualquer usuário leia os registros de visitas
CREATE POLICY "Allow admins to read site visits"
ON public.site_visits
FOR SELECT
USING (auth.jwt() ->> 'role' = 'admin');

-- Política para permitir que qualquer usuário insira visitas (mesmo não autenticado)
CREATE POLICY "Allow anyone to insert site visits"
ON public.site_visits
FOR INSERT
WITH CHECK (true);

-- Política para permitir que admins atualizem registros
CREATE POLICY "Allow admins to update site visits"
ON public.site_visits
FOR UPDATE
USING (auth.jwt() ->> 'role' = 'admin');

-- Política para permitir que admins excluam registros
CREATE POLICY "Allow admins to delete site visits"
ON public.site_visits
FOR DELETE
USING (auth.jwt() ->> 'role' = 'admin');

-- Adicionar índices para melhorar performance de consultas comuns
CREATE INDEX IF NOT EXISTS idx_site_visits_created_at ON public.site_visits(created_at);
CREATE INDEX IF NOT EXISTS idx_site_visits_user_id ON public.site_visits(user_id);
CREATE INDEX IF NOT EXISTS idx_site_visits_path ON public.site_visits(path); 