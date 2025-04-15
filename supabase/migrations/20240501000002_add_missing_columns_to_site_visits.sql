-- Verificar e adicionar colunas que estão faltando na tabela site_visits

DO $$
DECLARE
    columns_to_check TEXT[] := ARRAY[
        'path', 'user_id', 'user_agent', 'ip_address', 'created_at',
        'referrer', 'session_id', 'device_type', 'browser', 'os',
        'country', 'region', 'city',
        'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
        'time_on_page'
    ];
    col_name TEXT;
BEGIN
    -- Verificar se a tabela site_visits existe
    IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'site_visits'
    ) THEN
        -- Verificar cada coluna e adicionar se estiver faltando
        FOREACH col_name IN ARRAY columns_to_check
        LOOP
            IF NOT EXISTS (
                SELECT 1
                FROM information_schema.columns
                WHERE table_schema = 'public'
                AND table_name = 'site_visits'
                AND column_name = col_name
            ) THEN
                EXECUTE format('ALTER TABLE public.site_visits ADD COLUMN %I TEXT', col_name);

                -- Adicionar comentários para colunas específicas
                IF col_name = 'path' THEN
                    EXECUTE 'COMMENT ON COLUMN public.site_visits.path IS ''Caminho/URL acessado''';
                ELSIF col_name = 'user_id' THEN
                    EXECUTE 'COMMENT ON COLUMN public.site_visits.user_id IS ''ID do usuário (se estiver logado)''';
                ELSIF col_name = 'user_agent' THEN
                    EXECUTE 'COMMENT ON COLUMN public.site_visits.user_agent IS ''User agent do navegador''';
                ELSIF col_name = 'ip_address' THEN
                    EXECUTE 'COMMENT ON COLUMN public.site_visits.ip_address IS ''Endereço IP do visitante''';
                ELSIF col_name = 'referrer' THEN
                    EXECUTE 'COMMENT ON COLUMN public.site_visits.referrer IS ''URL de referência de onde o usuário veio''';
                ELSIF col_name = 'session_id' THEN
                    EXECUTE 'COMMENT ON COLUMN public.site_visits.session_id IS ''ID de sessão para rastrear usuários entre páginas''';
                ELSIF col_name = 'time_on_page' THEN
                    EXECUTE 'COMMENT ON COLUMN public.site_visits.time_on_page IS ''Tempo gasto na página em segundos''';
                    -- Alterar o tipo para INTEGER
                    EXECUTE 'ALTER TABLE public.site_visits ALTER COLUMN time_on_page TYPE INTEGER USING time_on_page::INTEGER';
                END IF;
            END IF;
        END LOOP;
    END IF;
END
$$; 