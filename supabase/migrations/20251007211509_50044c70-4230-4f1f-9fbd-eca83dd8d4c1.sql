-- Corrigir a função handle_new_user que está causando erro ao criar novos usuários
-- O problema é que está tentando acessar NEW.app_metadata que não existe no contexto do trigger

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Inserir na tabela profiles
  INSERT INTO public.profiles (
    id,
    email,
    nome,
    nivel,
    status,
    data_cadastro,
    ultimo_login,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    'usuario',
    'ativo',
    NEW.created_at,
    NEW.last_sign_in_at,
    NEW.created_at,
    NEW.updated_at
  );
  
  -- Registrar evento de criação de conta (removido acesso a app_metadata que não existe)
  INSERT INTO public.auth_logs (
    user_id,
    event_type,
    metadata
  )
  VALUES (
    NEW.id,
    'signup',
    jsonb_build_object(
      'provider', 'email',
      'created_at', NEW.created_at
    )
  );
  
  RETURN NEW;
END;
$function$;