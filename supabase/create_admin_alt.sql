-- Versão alternativa e simplificada para criar um usuário administrador
-- Sem dependências para tabelas específicas do Supabase (como auth.instances)

BEGIN;

-- Se a função log_login_attempt não existir, criar uma versão simplificada
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'log_login_attempt'
  ) THEN
    -- Criar função simplificada
    CREATE OR REPLACE FUNCTION public.log_login_attempt(
      p_email TEXT, 
      p_status TEXT, 
      p_error TEXT DEFAULT NULL
    )
    RETURNS VOID AS $$
    BEGIN
      -- Apenas registrar em log (sem armazenar em tabela)
      RAISE NOTICE 'Login Attempt: % - Status: % - Error: %', 
        p_email, p_status, COALESCE(p_error, 'none');
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  END IF;
END
$$;

-- Definir variáveis para o usuário admin
DO $$
DECLARE
  v_user_id UUID;
  v_email TEXT := 'admin@bomestudo.com.br';
  v_password TEXT := 'Admin@123';
  v_now TIMESTAMP WITH TIME ZONE := now();
BEGIN
  -- Verificar se o usuário já existe
  SELECT id INTO v_user_id 
  FROM auth.users 
  WHERE email = v_email;

  IF v_user_id IS NULL THEN
    -- Determinar campos obrigatórios na tabela auth.users
    IF EXISTS (
      SELECT 1 
      FROM information_schema.columns 
      WHERE table_schema = 'auth' 
      AND table_name = 'users' 
      AND column_name = 'instance_id'
    ) THEN
      -- Versão antiga do Supabase que requer instance_id
      EXECUTE format('
        INSERT INTO auth.users (
          instance_id, id, email, encrypted_password, email_confirmed_at, 
          created_at, updated_at, aud, role
        ) VALUES (
          (SELECT instance_id FROM auth.instances LIMIT 1),
          gen_random_uuid(), %L, %L, %L, %L, %L, ''authenticated'', ''authenticated''
        ) RETURNING id', 
        v_email, 
        crypt(v_password, gen_salt('bf')), 
        v_now, v_now, v_now
      ) INTO v_user_id;
    ELSE
      -- Versão mais recente do Supabase sem instance_id
      INSERT INTO auth.users (
        id, email, encrypted_password, email_confirmed_at, 
        created_at, updated_at, aud, role
      ) VALUES (
        gen_random_uuid(), 
        v_email, 
        crypt(v_password, gen_salt('bf')), 
        v_now, v_now, v_now, 
        'authenticated', 'authenticated'
      ) RETURNING id INTO v_user_id;
    END IF;

    -- Inserir na tabela profiles
    INSERT INTO public.profiles (
      id, email, nome, nivel, role, created_at, updated_at
    ) VALUES (
      v_user_id, 
      v_email, 
      'Administrador', 
      'admin', 
      'admin',
      v_now, v_now
    );

    RAISE NOTICE 'Usuário admin criado com sucesso. ID: %', v_user_id;
  ELSE
    -- Atualizar usuário existente
    UPDATE auth.users 
    SET 
      encrypted_password = crypt(v_password, gen_salt('bf')),
      email_confirmed_at = v_now,
      updated_at = v_now
    WHERE id = v_user_id;

    -- Garantir que o perfil tem nível admin
    UPDATE public.profiles
    SET 
      nivel = 'admin',
      role = 'admin',
      updated_at = v_now
    WHERE id = v_user_id;

    RAISE NOTICE 'Senha do usuário admin atualizada. ID: %', v_user_id;
  END IF;

  RAISE NOTICE 'Email: % / Senha: %', v_email, v_password;
END $$;

COMMIT; 