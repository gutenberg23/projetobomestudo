-- ATENÇÃO: Este script cria um usuário administrador diretamente no banco de dados
-- Use apenas para recuperação de emergência quando não conseguir fazer login
-- ALTERE a senha criptografada antes de usar!!!

DO $$
DECLARE
  v_user_id UUID;
  v_now TIMESTAMP WITH TIME ZONE := now();
  v_email TEXT := 'admin@bomestudo.com.br';
BEGIN
  -- Verificar se já existe usuário com este email
  SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;
  
  IF v_user_id IS NULL THEN
    -- Criar novo usuário na tabela auth.users com senha pré-definida
    INSERT INTO auth.users (
      id,
      aud,
      role,
      email,
      encrypted_password,   -- Esta é uma senha criptografada para 'Admin@123'
      email_confirmed_at,   -- Marcamos como confirmado para pular verificação por email
      created_at,
      updated_at,
      last_sign_in_at      -- Adicionando última data de login
    ) VALUES (
      uuid_generate_v4(),
      'authenticated',
      'authenticated',
      v_email,
      '$2a$10$5JeJJaR6KQ2HhmQnfQVuROaCR.zuYfUKAOjaER.AxJOrTNnWThcv6',  -- 'Admin@123'
      v_now,
      v_now,
      v_now,
      v_now
    )
    RETURNING id INTO v_user_id;
    
    -- Inserir perfil de admin
    INSERT INTO public.profiles (
      id,
      email,
      nome,
      sobrenome,
      nivel,
      status,
      data_cadastro,
      created_at,
      updated_at,
      role
    ) VALUES (
      v_user_id,
      v_email,
      'Administrador',
      'Sistema',
      'admin',
      'ativo',
      v_now,
      v_now,
      v_now,
      'admin'
    );
    
    RAISE NOTICE 'Usuário admin criado com sucesso! ID: %', v_user_id;
  ELSE
    RAISE NOTICE 'Usuário admin já existe com ID: %', v_user_id;
    
    -- Atualizar senha do usuário existente
    UPDATE auth.users
    SET 
      encrypted_password = '$2a$10$5JeJJaR6KQ2HhmQnfQVuROaCR.zuYfUKAOjaER.AxJOrTNnWThcv6',  -- 'Admin@123'
      email_confirmed_at = v_now,
      updated_at = v_now,
      last_sign_in_at = v_now
    WHERE id = v_user_id;
    
    -- Garantir que o perfil tem nível admin
    UPDATE public.profiles
    SET 
      nivel = 'admin',
      status = 'ativo',
      role = 'admin',
      updated_at = v_now
    WHERE id = v_user_id;
    
    RAISE NOTICE 'Senha do usuário admin resetada para Admin@123';
  END IF;
  
  -- Criar uma sessão manualmente (opcional, geralmente não é necessário)
  -- DELETE FROM auth.sessions WHERE user_id = v_user_id;
  
  RAISE NOTICE 'Login: admin@bomestudo.com.br / Senha: Admin@123';
END $$; 