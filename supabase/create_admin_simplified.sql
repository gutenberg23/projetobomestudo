-- Script ULTRA SIMPLIFICADO para criar um usuário administrador
-- Este script verifica as colunas existentes antes de tentar usá-las

DO $$
DECLARE
  v_user_id UUID;
  v_email TEXT := 'admin@bomestudo.com.br'; 
  v_password TEXT := 'Admin@123';
  v_now TIMESTAMP WITH TIME ZONE := now();
  v_has_role BOOLEAN;
  v_has_nivel BOOLEAN;
  v_has_status BOOLEAN;
  v_insert_query TEXT;
  v_columns TEXT := 'id, email, nome, created_at, updated_at';
  v_values TEXT := 'v_user_id, v_email, ''Administrador'', v_now, v_now';
BEGIN
  -- Verificar se o usuário já existe
  SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;
  
  -- Verificar quais colunas existem na tabela profiles
  SELECT 
    EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'role') INTO v_has_role;
  
  SELECT 
    EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'nivel') INTO v_has_nivel;
    
  SELECT 
    EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'status') INTO v_has_status;
  
  -- Construir a lista de colunas e valores dinamicamente
  IF v_has_role THEN
    v_columns := v_columns || ', role';
    v_values := v_values || ', ''admin''';
  END IF;
  
  IF v_has_nivel THEN
    v_columns := v_columns || ', nivel';
    v_values := v_values || ', ''admin''';
  END IF;
  
  IF v_has_status THEN
    v_columns := v_columns || ', status';
    v_values := v_values || ', ''ativo''';
  END IF;
  
  RAISE NOTICE 'Colunas: %', v_columns;
  RAISE NOTICE 'Valores: %', v_values;
  
  -- Criar novo usuário se não existir
  IF v_user_id IS NULL THEN
    -- Inserir na tabela auth.users
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
    
    -- ABORDAGEM MAIS SEGURA: Usar parametrização
    EXECUTE 
      format('INSERT INTO public.profiles (%s) VALUES ($1, $2, $3, $4, $5%s)',
        v_columns,
        CASE WHEN v_has_role THEN ', $6' ELSE '' END ||
        CASE WHEN v_has_nivel THEN CASE WHEN v_has_role THEN ', $7' ELSE ', $6' END ELSE '' END ||
        CASE WHEN v_has_status THEN 
          CASE WHEN v_has_role AND v_has_nivel THEN ', $8' 
               WHEN v_has_role OR v_has_nivel THEN ', $7'
               ELSE ', $6' END
          ELSE '' END
      )
    USING 
      v_user_id, v_email, 'Administrador', v_now, v_now,
      CASE WHEN v_has_role THEN 'admin'::text END,
      CASE WHEN v_has_nivel THEN 'admin'::text END,
      CASE WHEN v_has_status THEN 'ativo'::text END;
           
    RAISE NOTICE 'Usuário admin criado com sucesso! ID: %', v_user_id;
  ELSE
    RAISE NOTICE 'Usuário admin já existe com ID: %', v_user_id;
    
    -- Atualizar senha do usuário existente
    UPDATE auth.users
    SET 
      encrypted_password = crypt(v_password, gen_salt('bf')),
      email_confirmed_at = v_now,
      updated_at = v_now
    WHERE id = v_user_id;
    
    -- Atualizar apenas os campos que existem (com parametrização segura)
    IF v_has_nivel THEN
      UPDATE public.profiles SET nivel = 'admin' WHERE id = v_user_id;
    END IF;
    
    IF v_has_status THEN
      UPDATE public.profiles SET status = 'ativo' WHERE id = v_user_id;
    END IF;
    
    IF v_has_role THEN
      UPDATE public.profiles SET role = 'admin' WHERE id = v_user_id;
    END IF;
    
    RAISE NOTICE 'Senha do usuário admin resetada para Admin@123';
  END IF;
  
  RAISE NOTICE 'Login: admin@bomestudo.com.br / Senha: Admin@123';
END $$; 