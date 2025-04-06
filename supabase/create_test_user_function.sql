-- Função para criar um usuário de teste diretamente
-- Esta função ignora os triggers e cria o usuário diretamente nas tabelas relevantes

CREATE OR REPLACE FUNCTION public.admin_create_test_user(
  test_email TEXT,
  test_password TEXT,
  test_name TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_now TIMESTAMP WITH TIME ZONE := now();
BEGIN
  -- Verificar se já existe um usuário com este email
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = test_email) THEN
    -- Deletar usuário existente com este email
    DELETE FROM auth.users WHERE email = test_email;
  END IF;
  
  -- Inserir o usuário diretamente na tabela auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    (SELECT instance_id FROM auth.instances LIMIT 1),  -- Pegar instance_id existente
    gen_random_uuid(),  -- Gerar novo UUID
    'authenticated',
    'authenticated',
    test_email,
    crypt(test_password, gen_salt('bf')),  -- Criptografar senha
    v_now,  -- Email confirmado
    NULL,
    v_now,
    '{"provider": "email", "providers": ["email"]}',
    json_build_object('name', test_name),
    v_now,
    v_now,
    '',
    '',
    '',
    ''
  )
  RETURNING id INTO v_user_id;
  
  -- Inserir registro na tabela profiles manualmente
  INSERT INTO public.profiles (
    id,
    email,
    nome,
    sobrenome,
    nivel,
    status,
    data_cadastro,
    created_at,
    updated_at
  ) VALUES (
    v_user_id,
    test_email,
    test_name,
    NULL,
    'usuario',
    'ativo',
    v_now,
    v_now,
    v_now
  );
  
  RETURN TRUE;
END;
$$;

-- Conceder permissão para usuários anônimos executarem a função (apenas para teste)
GRANT EXECUTE ON FUNCTION public.admin_create_test_user(TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.admin_create_test_user(TEXT, TEXT, TEXT) TO authenticated; 