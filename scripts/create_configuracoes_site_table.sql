-- Criar tabela de configurações do site
CREATE TABLE IF NOT EXISTS public.configuracoes_site (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chave TEXT NOT NULL UNIQUE,
    valor JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índice na coluna chave para buscas rápidas
CREATE INDEX IF NOT EXISTS idx_configuracoes_site_chave ON public.configuracoes_site (chave);

-- Inserir configuração padrão para as abas do curso
INSERT INTO public.configuracoes_site (chave, valor)
VALUES (
    'tabs_course',
    '{
        "showDisciplinasTab": true,
        "showEditalTab": true,
        "showSimuladosTab": true
    }'::jsonb
)
ON CONFLICT (chave) DO NOTHING;

-- Comentários sobre a tabela
COMMENT ON TABLE public.configuracoes_site IS 'Armazena configurações gerais do site';
COMMENT ON COLUMN public.configuracoes_site.chave IS 'Identificador único da configuração';
COMMENT ON COLUMN public.configuracoes_site.valor IS 'Valor da configuração em formato JSON';
COMMENT ON COLUMN public.configuracoes_site.created_at IS 'Data de criação do registro';
COMMENT ON COLUMN public.configuracoes_site.updated_at IS 'Data da última atualização do registro'; 