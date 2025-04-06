-- Script BÁSICO para criar um usuário administrador
-- Abordagem com verificação de cada coluna individual

DO $$
DECLARE
  v_user_id UUID;
  v_email TEXT := 'admin@bomestudo.com.br'; 
  v_password TEXT := 'Admin@123';
  v_now TIMESTAMP WITH TIME ZONE := now();
BEGIN
  -- 1. Criar usuário no auth.users
  INSERT INTO auth.users (
    id, 
    email, 
    encrypted_password, 
    email_confirmed_at, 
    created_at, 
    updated_at, 
    aud, 
    role
  ) VALUES (
    gen_random_uuid(), 
    v_email, 
    crypt(v_password, gen_salt('bf')), 
    v_now, 
    v_now, 
    v_now, 
    'authenticated', 
    'authenticated'
  ) 
  ON CONFLICT (email) DO 
    UPDATE SET 
      encrypted_password = crypt(v_password, gen_salt('bf')),
      updated_at = v_now
  RETURNING id INTO v_user_id;
  
  -- 2. Verificar se já existe um perfil
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = v_user_id) THEN
    -- Atualizar perfil existente
    
    -- Atualizar nome
    BEGIN
      UPDATE public.profiles SET nome = 'Administrador' WHERE id = v_user_id;
      RAISE NOTICE 'Campo nome atualizado';
    EXCEPTION WHEN undefined_column THEN
      RAISE NOTICE 'Coluna nome não existe na tabela profiles';
    END;
    
    -- Atualizar email
    BEGIN
      UPDATE public.profiles SET email = v_email WHERE id = v_user_id;
      RAISE NOTICE 'Campo email atualizado';
    EXCEPTION WHEN undefined_column THEN
      RAISE NOTICE 'Coluna email não existe na tabela profiles';
    END;
    
    -- Atualizar nivel
    BEGIN
      UPDATE public.profiles SET nivel = 'admin' WHERE id = v_user_id;
      RAISE NOTICE 'Campo nivel atualizado';
    EXCEPTION WHEN undefined_column THEN
      RAISE NOTICE 'Coluna nivel não existe na tabela profiles';
    END;
    
    -- Atualizar role
    BEGIN
      UPDATE public.profiles SET role = 'admin' WHERE id = v_user_id;
      RAISE NOTICE 'Campo role atualizado';
    EXCEPTION WHEN undefined_column THEN
      RAISE NOTICE 'Coluna role não existe na tabela profiles';
    END;
    
    -- Atualizar status
    BEGIN
      UPDATE public.profiles SET status = 'ativo' WHERE id = v_user_id;
      RAISE NOTICE 'Campo status atualizado';
    EXCEPTION WHEN undefined_column THEN
      RAISE NOTICE 'Coluna status não existe na tabela profiles';
    END;
    
    RAISE NOTICE 'Perfil de usuário atualizado: %', v_user_id;
  ELSE
    -- Criar novo perfil
    BEGIN
      -- Tentativa inicial com campos básicos
      INSERT INTO public.profiles (id, email, nome, created_at, updated_at)
      VALUES (v_user_id, v_email, 'Administrador', v_now, v_now);
      
      -- Atualizar campos adicionais individualmente para evitar erros
      BEGIN
        UPDATE public.profiles SET nivel = 'admin' WHERE id = v_user_id;
      EXCEPTION WHEN undefined_column THEN NULL; END;
      
      BEGIN
        UPDATE public.profiles SET role = 'admin' WHERE id = v_user_id;
      EXCEPTION WHEN undefined_column THEN NULL; END;
      
      BEGIN
        UPDATE public.profiles SET status = 'ativo' WHERE id = v_user_id;
      EXCEPTION WHEN undefined_column THEN NULL; END;
      
      RAISE NOTICE 'Novo perfil de usuário criado: %', v_user_id;
    EXCEPTION WHEN others THEN
      RAISE NOTICE 'Erro ao criar perfil: %', SQLERRM;
      
      -- Fallback - tentar com menos campos
      BEGIN
        INSERT INTO public.profiles (id, nome)
        VALUES (v_user_id, 'Administrador');
        RAISE NOTICE 'Perfil criado com campos mínimos';
      EXCEPTION WHEN others THEN
        RAISE NOTICE 'Erro ao criar perfil mínimo: %', SQLERRM;
        
        -- Último fallback - descobrir quais colunas existem
        RAISE NOTICE 'Existem estas colunas na tabela profiles:';
        FOR coluna IN (
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_schema = 'public' AND table_name = 'profiles'
        ) LOOP
          RAISE NOTICE '- %', coluna.column_name;
        END LOOP;
      END;
    END;
  END IF;

  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Login: admin@bomestudo.com.br / Senha: Admin@123';
  RAISE NOTICE '==============================================';
END $$; 