-- Atualizar tabela de popups para tornar o campo conteudo opcional
ALTER TABLE public.popups 
ALTER COLUMN conteudo DROP NOT NULL;

-- Atualizar comentário da coluna
COMMENT ON COLUMN public.popups.conteudo IS 'Conteúdo HTML do popup (opcional)';