-- Criar tabela de popups
CREATE TABLE IF NOT EXISTS public.popups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    titulo VARCHAR(255) NOT NULL,
    conteudo TEXT, -- Conteúdo HTML do popup (opcional)
    imagem_url TEXT,
    link_destino TEXT,
    data_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
    data_fim TIMESTAMP WITH TIME ZONE NOT NULL,
    pagina VARCHAR(100) NOT NULL, -- Página onde o popup será exibido
    ativo BOOLEAN DEFAULT true,
    ordem INTEGER DEFAULT 0
);

-- Adicionar comentários para documentação
COMMENT ON TABLE public.popups IS 'Tabela para armazenar popups do site';
COMMENT ON COLUMN public.popups.titulo IS 'Título do popup para identificação';
COMMENT ON COLUMN public.popups.conteudo IS 'Conteúdo HTML do popup (opcional)';
COMMENT ON COLUMN public.popups.imagem_url IS 'URL da imagem do popup';
COMMENT ON COLUMN public.popups.link_destino IS 'Link de destino quando clicar no popup';
COMMENT ON COLUMN public.popups.data_inicio IS 'Data e hora de início da exibição do popup';
COMMENT ON COLUMN public.popups.data_fim IS 'Data e hora de término da exibição do popup';
COMMENT ON COLUMN public.popups.pagina IS 'Página onde o popup será exibido';
COMMENT ON COLUMN public.popups.ativo IS 'Indica se o popup está ativo';
COMMENT ON COLUMN public.popups.ordem IS 'Ordem de exibição dos popups na mesma página';

-- Configurar RLS (Row Level Security)
ALTER TABLE public.popups ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Leitura pública de popups ativos"
ON public.popups FOR SELECT
TO public
USING (ativo = true AND data_inicio <= NOW() AND data_fim >= NOW());

CREATE POLICY "Admins gerenciam popups"
ON public.popups FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Criar índices para melhorar performance
CREATE INDEX idx_popups_pagina ON public.popups(pagina);
CREATE INDEX idx_popups_data_inicio ON public.popups(data_inicio);
CREATE INDEX idx_popups_data_fim ON public.popups(data_fim);
CREATE INDEX idx_popups_ativo ON public.popups(ativo);