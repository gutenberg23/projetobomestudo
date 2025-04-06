-- Remover o trigger existente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Atualizar a função handle_new_user
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
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
    updated_at,
    foto_url,
    metadata
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
    NEW.updated_at,
    CASE 
      WHEN NEW.raw_app_meta_data->>'provider' = 'google' 
      THEN NEW.raw_user_meta_data->>'avatar_url'
      ELSE NULL
    END,
    jsonb_build_object(
      'provider', NEW.raw_app_meta_data->>'provider',
      'raw_user_meta_data', NEW.raw_user_meta_data
    )
  );
  
  -- O trigger sync_profiles_to_perfil irá sincronizar automaticamente com a tabela perfil
  
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
      'provider', NEW.raw_app_meta_data->>'provider',
      'created_at', NEW.created_at
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recriar o trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user(); 