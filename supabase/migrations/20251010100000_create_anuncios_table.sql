-- Criar tabela de anúncios
CREATE TABLE IF NOT EXISTS public.anuncios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    titulo VARCHAR(255) NOT NULL,
    imagem_url TEXT,
    link_destino TEXT,
    data_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
    data_fim TIMESTAMP WITH TIME ZONE NOT NULL,
    posicao VARCHAR(50) NOT NULL, -- questions_filters, questions_list, cadernos_top, etc.
    ativo BOOLEAN DEFAULT true,
    ordem INTEGER DEFAULT 0
);

-- Adicionar comentários para documentação
COMMENT ON TABLE public.anuncios IS 'Tabela para armazenar anúncios/banners do site';
COMMENT ON COLUMN public.anuncios.titulo IS 'Título do anúncio para identificação';
COMMENT ON COLUMN public.anuncios.imagem_url IS 'URL da imagem do banner';
COMMENT ON COLUMN public.anuncios.link_destino IS 'Link de destino quando clicar no banner';
COMMENT ON COLUMN public.anuncios.data_inicio IS 'Data e hora de início da exibição do anúncio';
COMMENT ON COLUMN public.anuncios.data_fim IS 'Data e hora de término da exibição do anúncio';
COMMENT ON COLUMN public.anuncios.posicao IS 'Posição onde o anúncio será exibido';
COMMENT ON COLUMN public.anuncios.ativo IS 'Indica se o anúncio está ativo';
COMMENT ON COLUMN public.anuncios.ordem IS 'Ordem de exibição dos anúncios na mesma posição';

-- Configurar RLS (Row Level Security)
ALTER TABLE public.anuncios ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Leitura pública de anúncios ativos"
ON public.anuncios FOR SELECT
TO public
USING (ativo = true AND data_inicio <= NOW() AND data_fim >= NOW());

CREATE POLICY "Admins gerenciam anúncios"
ON public.anuncios FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Criar índices para melhorar performance
CREATE INDEX idx_anuncios_posicao ON public.anuncios(posicao);
CREATE INDEX idx_anuncios_data_inicio ON public.anuncios(data_inicio);
CREATE INDEX idx_anuncios_data_fim ON public.anuncios(data_fim);
CREATE INDEX idx_anuncios_ativo ON public.anuncios(ativo);