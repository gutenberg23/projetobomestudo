-- Criar a extensão uuid-ossp se ainda não existir
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Criação da tabela site_visits
CREATE TABLE IF NOT EXISTS public.site_visits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    path TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_agent TEXT,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    referrer TEXT,
    session_id TEXT,
    device_type TEXT,
    browser TEXT,
    os TEXT,
    country TEXT,
    region TEXT,
    city TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    utm_term TEXT,
    utm_content TEXT,
    time_on_page INTEGER
);

-- Adicionar comentários na tabela
COMMENT ON TABLE public.site_visits IS 'Tabela para armazenar dados de visitas ao site';
COMMENT ON COLUMN public.site_visits.path IS 'Caminho/URL acessado';
COMMENT ON COLUMN public.site_visits.user_id IS 'ID do usuário (se estiver logado)';
COMMENT ON COLUMN public.site_visits.user_agent IS 'User agent do navegador';
COMMENT ON COLUMN public.site_visits.ip_address IS 'Endereço IP do visitante';
COMMENT ON COLUMN public.site_visits.referrer IS 'URL de referência de onde o usuário veio';
COMMENT ON COLUMN public.site_visits.session_id IS 'ID de sessão para rastrear usuários entre páginas';
COMMENT ON COLUMN public.site_visits.time_on_page IS 'Tempo gasto na página em segundos';

-- Adicionar índices para otimizar consultas comuns
CREATE INDEX IF NOT EXISTS idx_site_visits_created_at ON public.site_visits(created_at);
CREATE INDEX IF NOT EXISTS idx_site_visits_user_id ON public.site_visits(user_id);
CREATE INDEX IF NOT EXISTS idx_site_visits_path ON public.site_visits(path);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.site_visits ENABLE ROW LEVEL SECURITY;

-- Criar políticas de segurança
-- Política para permitir que qualquer usuário insira visitas (mesmo não autenticado)
CREATE POLICY "Allow anyone to insert site visits"
ON public.site_visits
FOR INSERT
WITH CHECK (true);

-- Política para permitir que admins leiam registros
CREATE POLICY "Allow admins to read site visits"
ON public.site_visits
FOR SELECT
USING (auth.jwt() ->> 'role' = 'admin');

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