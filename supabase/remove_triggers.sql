-- Script para remover todos os triggers que podem estar interferindo na autenticação
-- Executar este script no SQL Editor do Supabase

-- Remover triggers relacionados à autenticação
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_session_created ON auth.sessions;
DROP TRIGGER IF EXISTS trigger_update_user_question_attempts_updated_at ON public.user_question_attempts;

-- Remover funções associadas aos triggers
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.log_auth_event();
DROP FUNCTION IF EXISTS public.update_user_question_attempts_updated_at();

-- Resetar políticas RLS relacionadas a profiles que podem estar causando problemas
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;

-- Se necessário, reabilitar o RLS com políticas mais permissivas
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;

-- Política simplificada para permitir autenticação
DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Administradores e equipe podem ver todos os perfis" ON public.profiles;
DROP POLICY IF EXISTS "Administradores podem atualizar qualquer perfil" ON public.profiles;

-- Adicionar políticas mais permissivas
CREATE POLICY "Usuários autenticados podem ver perfis"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem inserir perfis"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar perfis"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (true);

-- Criar uma função mais simples para lidar com novos usuários (opcional)
CREATE OR REPLACE FUNCTION public.simple_user_handler()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nome)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentado: Não adicione esse trigger agora, apenas se necessário depois
-- CREATE TRIGGER simple_on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION public.simple_user_handler(); 