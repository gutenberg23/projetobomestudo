-- Script FINAL para criar um usuário administrador
-- Definições explícitas para todas as colunas obrigatórias

DO $$
DECLARE
  v_user_id UUID;
  v_email TEXT := 'admin@bomestudo.com.br'; 
  v_password TEXT := 'Admin@123';
  v_now TIMESTAMP WITH TIME ZONE := now();
  coluna RECORD; -- Declarar a variável 'coluna' como RECORD
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
  
  RAISE NOTICE 'Usuário criado/atualizado com ID: %', v_user_id;
  
  -- 2. Verificar estrutura atual da tabela profiles
  RAISE NOTICE 'Estrutura da tabela profiles:';
  FOR coluna IN 
    SELECT column_name, is_nullable 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles'
    ORDER BY ordinal_position
  LOOP
    RAISE NOTICE '- % (Nullable: %)', coluna.column_name, coluna.is_nullable;
  END LOOP;
  
  -- 3. Inserir ou atualizar perfil
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = v_user_id) THEN
    -- Atualizar perfil existente
    UPDATE public.profiles 
    SET 
      email = v_email,
      nome = 'Administrador',
      nivel = 'admin',
      updated_at = v_now
    WHERE id = v_user_id;
    
    RAISE NOTICE 'Perfil atualizado para o usuário: %', v_user_id;
  ELSE
    -- Criar novo perfil - Versão explícita com todos os campos obrigatórios
    BEGIN
      INSERT INTO public.profiles (
        id, 
        email, 
        nome, 
        nivel,       -- Campo obrigatório identificado
        created_at, 
        updated_at
      ) VALUES (
        v_user_id, 
        v_email, 
        'Administrador', 
        'admin',     -- Valor para campo obrigatório
        v_now, 
        v_now
      );
      
      RAISE NOTICE 'Perfil criado com sucesso: %', v_user_id;
    EXCEPTION WHEN others THEN
      RAISE NOTICE 'Erro ao criar perfil: %', SQLERRM;
      
      -- Se falhar, mostrar a estrutura da tabela novamente
      FOR coluna IN
        SELECT column_name, column_default, is_nullable, data_type
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'profiles'
        ORDER BY ordinal_position
      LOOP
        RAISE NOTICE '- % (Tipo: %, Default: %, Nullable: %)', 
          coluna.column_name, 
          coluna.data_type,
          COALESCE(coluna.column_default, 'none'),
          coluna.is_nullable;
      END LOOP;
    END;
  END IF;

  -- 4. Atualizar campos adicionais se existirem (mesmo que não sejam obrigatórios)
  BEGIN
    UPDATE public.profiles SET role = 'admin' WHERE id = v_user_id;
  EXCEPTION WHEN undefined_column THEN
    NULL;
  END;
  
  BEGIN
    UPDATE public.profiles SET status = 'ativo' WHERE id = v_user_id;
  EXCEPTION WHEN undefined_column THEN
    NULL;
  END;

  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Login: admin@bomestudo.com.br / Senha: Admin@123';
  RAISE NOTICE '==============================================';
END $$; 