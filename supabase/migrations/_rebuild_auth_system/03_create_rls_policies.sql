-- Habilitar RLS nas tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_logs ENABLE ROW LEVEL SECURITY;

-- Políticas para a tabela de perfis

-- Usuários podem ver seu próprio perfil
CREATE POLICY "Usuários podem ver seu próprio perfil"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Usuários podem atualizar seu próprio perfil (exceto o nível)
CREATE POLICY "Usuários podem atualizar seu próprio perfil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND nivel = OLD.nivel);

-- Administradores e equipe podem ver todos os perfis
CREATE POLICY "Administradores e equipe podem ver todos os perfis"
  ON public.profiles FOR SELECT
  USING (is_admin_or_staff());

-- Apenas administradores podem atualizar qualquer perfil
CREATE POLICY "Administradores podem atualizar qualquer perfil"
  ON public.profiles FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND nivel = 'admin'
  ));

-- Administradores e equipe podem ver os logs de autenticação
CREATE POLICY "Administradores e equipe podem ver logs de autenticação"
  ON public.auth_logs FOR SELECT
  USING (is_admin_or_staff());

-- Função para lidar com novos usuários (trigger)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    nome,
    nivel,
    status,
    data_cadastro
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    'usuario', -- Nível padrão para novos usuários
    'ativo',   -- Status padrão para novos usuários
    CURRENT_TIMESTAMP
  );
  
  -- Registrar evento de criação de conta
  INSERT INTO public.auth_logs (
    user_id,
    event_type,
    metadata
  )
  VALUES (
    NEW.id,
    'signup',
    jsonb_build_object(
      'provider', NEW.app_metadata->>'provider',
      'created_at', NEW.created_at
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger para novos usuários
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Função para registrar logins
CREATE OR REPLACE FUNCTION log_auth_event()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.aal = 'aal1' AND NEW.created_at > (NOW() - INTERVAL '5 seconds') THEN
    -- Registrar login bem-sucedido
    INSERT INTO public.auth_logs (
      user_id,
      event_type,
      ip_address,
      user_agent,
      metadata
    )
    VALUES (
      NEW.user_id,
      'login',
      NEW.ip::TEXT,
      NULL,
      jsonb_build_object('provider', NEW.provider)
    );
    
    -- Atualizar último login no perfil
    UPDATE public.profiles
    SET ultimo_login = CURRENT_TIMESTAMP
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger para logins
CREATE TRIGGER on_auth_session_created
  AFTER INSERT ON auth.sessions
  FOR EACH ROW EXECUTE FUNCTION log_auth_event(); 