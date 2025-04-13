-- Criar tabela para rastrear atividades do usuário
CREATE TABLE IF NOT EXISTS public.user_activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  page TEXT,
  description TEXT,
  resource_id TEXT,
  resource_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Adicionar índices para melhorar a performance
CREATE INDEX idx_user_activity_logs_user_id ON public.user_activity_logs(user_id);
CREATE INDEX idx_user_activity_logs_event_type ON public.user_activity_logs(event_type);
CREATE INDEX idx_user_activity_logs_created_at ON public.user_activity_logs(created_at);

-- Habilitar Row Level Security
ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS
-- Permitir administradores verem todos os logs
CREATE POLICY "Admins podem ver todos os logs" ON public.user_activity_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND nivel = 'admin'
    )
  );

-- Permitir usuários verem seus próprios logs
CREATE POLICY "Usuários podem ver seus próprios logs" ON public.user_activity_logs
  FOR SELECT USING (user_id = auth.uid());

-- Permitir inserção para usuários autenticados
CREATE POLICY "Usuários autenticados podem inserir logs" ON public.user_activity_logs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND user_id = auth.uid());

-- Função para registrar evento de login
CREATE OR REPLACE FUNCTION log_user_login()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.created_at > (NOW() - INTERVAL '5 seconds') THEN
    -- Registrar login no user_activity_logs
    INSERT INTO public.user_activity_logs (
      user_id,
      event_type,
      description,
      metadata
    )
    VALUES (
      NEW.user_id,
      'login',
      'Login no sistema',
      jsonb_build_object(
        'provider', NEW.provider,
        'ip_address', NEW.ip::TEXT
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger para login
CREATE TRIGGER on_auth_session_created_activity_log
  AFTER INSERT ON auth.sessions
  FOR EACH ROW EXECUTE FUNCTION log_user_login();

-- Função para registrar evento de logout
CREATE OR REPLACE FUNCTION log_user_logout()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    -- Registrar logout no user_activity_logs
    INSERT INTO public.user_activity_logs (
      user_id,
      event_type,
      description,
      metadata
    )
    VALUES (
      OLD.user_id,
      'logout',
      'Logout do sistema',
      jsonb_build_object('timestamp', now())
    );
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger para logout
CREATE TRIGGER on_auth_session_deleted_activity_log
  AFTER DELETE ON auth.sessions
  FOR EACH ROW EXECUTE FUNCTION log_user_logout(); 