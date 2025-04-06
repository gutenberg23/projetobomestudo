-- Função para login direto do administrador
-- Esta função contorna o sistema normal de autenticação
-- Use apenas em caso de emergência quando a autenticação normal falhar

CREATE OR REPLACE FUNCTION public.admin_direct_login(
  admin_email TEXT,
  admin_password TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_encrypted_password TEXT;
  v_now TIMESTAMP WITH TIME ZONE := now();
BEGIN
  -- 1. Verificar se o usuário existe e é administrador
  SELECT 
    u.id, 
    u.encrypted_password
  INTO 
    v_user_id, 
    v_encrypted_password
  FROM 
    auth.users u
  WHERE 
    u.email = admin_email;
  
  -- Se não encontrar usuário, falhar
  IF v_user_id IS NULL THEN
    PERFORM log_login_attempt(admin_email, 'falha', 'Usuário não encontrado');
    RETURN FALSE;
  END IF;
  
  -- Verificar se é admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = v_user_id 
    AND (role = 'admin' OR nivel = 'admin')
  ) THEN
    PERFORM log_login_attempt(admin_email, 'falha', 'Usuário não é administrador');
    RETURN FALSE;
  END IF;
  
  -- 2. Verificar se a senha corresponde
  IF NOT (crypt(admin_password, v_encrypted_password) = v_encrypted_password) THEN
    PERFORM log_login_attempt(admin_email, 'falha', 'Senha incorreta');
    RETURN FALSE;
  END IF;
  
  -- 3. Atualizar último login
  UPDATE auth.users
  SET last_sign_in_at = v_now
  WHERE id = v_user_id;
  
  -- 4. Registrar tentativa bem-sucedida
  PERFORM log_login_attempt(admin_email, 'sucesso');
  
  RETURN TRUE;
END;
$$;

-- Conceder permissão para usuários anônimos executarem a função
GRANT EXECUTE ON FUNCTION public.admin_direct_login(TEXT, TEXT) TO anon, authenticated; 