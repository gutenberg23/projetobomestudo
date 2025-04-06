-- Script para corrigir problemas de autenticação no Supabase
-- ATENÇÃO: Este script deve ser executado com privilégios de administrador!

-- Primeiro, remover todas as políticas RLS existentes para o perfil
DROP POLICY IF EXISTS ON public.profiles;

-- Desabilitar RLS temporariamente para a tabela profiles
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;

-- Verificar e corrigir permissões na tabela auth.users
GRANT SELECT, INSERT, UPDATE ON auth.users TO service_role;
GRANT SELECT, INSERT, UPDATE ON auth.users TO postgres;

-- Verificar e corrigir permissões na tabela auth.sessions
GRANT SELECT, INSERT, UPDATE, DELETE ON auth.sessions TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON auth.sessions TO postgres;

-- Verificar e corrigir permissões na tabela auth.refresh_tokens
GRANT SELECT, INSERT, UPDATE, DELETE ON auth.refresh_tokens TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON auth.refresh_tokens TO postgres;

-- Se necessário, habilitar acesso anônimo para debug
-- GRANT SELECT ON auth.users TO anon;
-- GRANT SELECT ON auth.sessions TO anon;

-- Verificar se há problemas com o esquema ou restrições nas tabelas
ALTER TABLE IF EXISTS public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE IF EXISTS public.profiles ADD CONSTRAINT profiles_id_fkey
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Limpar qualquer bloqueio de sessão
DELETE FROM pg_locks WHERE relation = 'auth.sessions'::regclass;

-- Adicionar uma política RLS simplificada (depois de verificar a funcionalidade)
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acesso total temporário"
  ON public.profiles
  USING (true)
  WITH CHECK (true);

-- Criar uma tabela temporária para registrar logins bem-sucedidos/falhos para debug
CREATE TABLE IF NOT EXISTS public.login_attempts (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  status TEXT NOT NULL,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conceder permissões anônimas à tabela de debug
GRANT SELECT, INSERT ON public.login_attempts TO anon, authenticated;
GRANT USAGE ON SEQUENCE public.login_attempts_id_seq TO anon, authenticated;

-- Criar uma função para registrar tentativas de login (uso opcional)
CREATE OR REPLACE FUNCTION log_login_attempt(p_email TEXT, p_status TEXT, p_error TEXT DEFAULT NULL)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.login_attempts (email, status, error_message)
  VALUES (p_email, p_status, p_error);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION log_login_attempt TO anon, authenticated; 