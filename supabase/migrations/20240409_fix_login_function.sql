-- Migração para corrigir as funções que estão causando erro de login após remover a tabela 'perfil'

-- 1. Corrigir a função log_auth_event
-- Remover o trigger existente
DROP TRIGGER IF EXISTS on_auth_session_created ON auth.sessions;

-- Recriar a função de log_auth_event (atualizando apenas a tabela profiles)
CREATE OR REPLACE FUNCTION log_auth_event()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.created_at > (NOW() - INTERVAL '5 seconds') THEN
    -- Registrar login bem-sucedido
    INSERT INTO public.auth_logs (
      user_id,
      event_type,
      ip_address,
      metadata
    )
    VALUES (
      NEW.user_id,
      'login',
      NEW.ip::TEXT,
      jsonb_build_object('provider', NEW.provider)
    );
    
    -- Atualizar último login na tabela profiles (apenas se a linha existir)
    UPDATE public.profiles
    SET ultimo_login = CURRENT_TIMESTAMP
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recriar o trigger
CREATE TRIGGER on_auth_session_created
  AFTER INSERT ON auth.sessions
  FOR EACH ROW EXECUTE FUNCTION log_auth_event();

-- 2. Corrigir a função handle_auth_user_update
-- Remover o trigger existente
DROP TRIGGER IF EXISTS handle_auth_user_update_trigger ON auth.users;

-- Recriar a função handle_auth_user_update para atualizar apenas a tabela profiles
CREATE OR REPLACE FUNCTION public.handle_auth_user_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Atualizar último login apenas na tabela profiles
    UPDATE public.profiles
    SET 
        ultimo_login = NEW.last_sign_in_at,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.id;
    
    RETURN NEW;
END;
$$;

-- Recriar o trigger
CREATE TRIGGER handle_auth_user_update_trigger
AFTER UPDATE OF last_sign_in_at ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_auth_user_update();

-- 3. Remover funções de sincronização que ainda podem estar ativas
DROP FUNCTION IF EXISTS public.sync_profiles_to_perfil() CASCADE;
DROP FUNCTION IF EXISTS public.sync_auth_users_to_perfil() CASCADE;

-- Verificar se há funções ou triggers que ainda podem estar referenciando a tabela 'perfil'
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN 
    SELECT pg_proc.proname, pg_proc.prosrc
    FROM pg_proc
    WHERE prosrc LIKE '%perfil%'
  LOOP
    RAISE NOTICE 'Função % ainda referencia a tabela perfil: %', r.proname, r.prosrc;
  END LOOP;
END $$;

-- Criar tabela de atualizações de questões
CREATE TABLE IF NOT EXISTS public.atualizacoes_questoes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    questao_id TEXT NOT NULL REFERENCES public.questoes(id) ON DELETE CASCADE,
    professor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Adicionar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_atualizacoes_questoes_questao_id ON public.atualizacoes_questoes(questao_id);
CREATE INDEX IF NOT EXISTS idx_atualizacoes_questoes_professor_id ON public.atualizacoes_questoes(professor_id);

-- Criar ou atualizar a política RLS para atualizacoes_questoes
ALTER TABLE public.atualizacoes_questoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura pública de atualizações de questões"
ON public.atualizacoes_questoes
FOR SELECT
TO authenticated
USING (true);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.atualizacoes_questoes
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Criar tabela de comentários de questões
CREATE TABLE IF NOT EXISTS public.comentarios_questoes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    questao_id TEXT NOT NULL REFERENCES public.questoes(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    conteudo TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Adicionar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_comentarios_questoes_questao_id ON public.comentarios_questoes(questao_id);
CREATE INDEX IF NOT EXISTS idx_comentarios_questoes_usuario_id ON public.comentarios_questoes(usuario_id);

-- Criar ou atualizar a política RLS para comentarios_questoes
ALTER TABLE public.comentarios_questoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura pública de comentários"
ON public.comentarios_questoes
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Permitir inserção de comentários por usuários autenticados"
ON public.comentarios_questoes
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Permitir atualização de comentários próprios"
ON public.comentarios_questoes
FOR UPDATE
TO authenticated
USING (auth.uid() = usuario_id)
WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Permitir exclusão de comentários próprios"
ON public.comentarios_questoes
FOR DELETE
TO authenticated
USING (auth.uid() = usuario_id);

-- Criar tabela de likes de comentários
CREATE TABLE IF NOT EXISTS public.likes_comentarios (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    comentario_id UUID NOT NULL REFERENCES public.comentarios_questoes(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(comentario_id, usuario_id)
);

-- Adicionar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_likes_comentarios_comentario_id ON public.likes_comentarios(comentario_id);
CREATE INDEX IF NOT EXISTS idx_likes_comentarios_usuario_id ON public.likes_comentarios(usuario_id);

-- Criar ou atualizar a política RLS para likes_comentarios
ALTER TABLE public.likes_comentarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura pública de likes"
ON public.likes_comentarios
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Permitir inserção de likes por usuários autenticados"
ON public.likes_comentarios
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Permitir exclusão de likes próprios"
ON public.likes_comentarios
FOR DELETE
TO authenticated
USING (auth.uid() = usuario_id);

-- Trigger para atualizar updated_at em comentarios_questoes
CREATE TRIGGER set_updated_at_comentarios
    BEFORE UPDATE ON public.comentarios_questoes
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at(); 