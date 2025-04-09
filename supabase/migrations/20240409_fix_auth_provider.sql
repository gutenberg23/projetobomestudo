-- Corrigir o erro "record "new" has no field "provider"" na função log_auth_event

-- Remover o trigger existente
DROP TRIGGER IF EXISTS on_auth_session_created ON auth.sessions;

-- Recriar a função log_auth_event com a correção para o campo provider
CREATE OR REPLACE FUNCTION public.log_auth_event()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.created_at > (NOW() - INTERVAL '5 seconds') THEN
    -- Registrar login bem-sucedido
    -- A tabela auth.sessions não possui campo 'provider', então usamos um valor padrão
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
      jsonb_build_object('provider', 'email')  -- Valor fixo em vez de NEW.provider
    );
    
    -- Atualizar último login na tabela profiles
    UPDATE public.profiles
    SET 
      ultimo_login = CURRENT_TIMESTAMP,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recriar o trigger
CREATE TRIGGER on_auth_session_created
  AFTER INSERT ON auth.sessions
  FOR EACH ROW EXECUTE FUNCTION public.log_auth_event();

-- Notificar sistema para recarregar configurações
NOTIFY pgrst, 'reload schema'; 