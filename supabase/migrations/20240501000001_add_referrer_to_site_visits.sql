-- Adicionar a coluna referrer à tabela site_visits se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'site_visits'
        AND column_name = 'referrer'
    ) THEN
        ALTER TABLE public.site_visits ADD COLUMN referrer TEXT;
        COMMENT ON COLUMN public.site_visits.referrer IS 'URL de referência de onde o usuário veio';
    END IF;
END
$$; 