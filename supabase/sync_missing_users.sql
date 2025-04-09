-- Função para sincronizar usuários faltantes
CREATE OR REPLACE FUNCTION sync_missing_users()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user RECORD;
BEGIN
    -- Encontrar usuários que existem em auth.users mas não em public.profiles
    FOR v_user IN
        SELECT 
            au.id,
            au.email,
            au.raw_user_meta_data,
            au.raw_app_meta_data,
            au.raw_user_meta_data->>'name' as nome,
            au.raw_app_meta_data->>'provider' as provider,
            au.created_at,
            au.updated_at,
            au.last_sign_in_at
        FROM auth.users au
        LEFT JOIN public.profiles p ON au.id = p.id
        WHERE p.id IS NULL
    LOOP
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
        ) VALUES (
            v_user.id,
            v_user.email,
            COALESCE(v_user.nome, split_part(v_user.email, '@', 1)),
            'usuario',
            'ativo',
            v_user.created_at,
            v_user.last_sign_in_at,
            v_user.created_at,
            v_user.updated_at,
            CASE 
                WHEN v_user.provider = 'google' 
                THEN v_user.raw_user_meta_data->>'avatar_url'
                ELSE NULL
            END,
            jsonb_build_object(
                'provider', v_user.provider,
                'raw_user_meta_data', v_user.raw_user_meta_data
            )
        );
        
        RAISE NOTICE 'Usuário sincronizado: % (%)', v_user.email, v_user.id;
    END LOOP;
END;
$$;

-- Executar a função para sincronizar usuários faltantes
SELECT sync_missing_users(); 