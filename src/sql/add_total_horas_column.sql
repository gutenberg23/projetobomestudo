-- Adicionar a coluna total_horas à tabela ciclos_estudo existente
ALTER TABLE public.ciclos_estudo 
ADD COLUMN IF NOT EXISTS total_horas INTEGER NOT NULL DEFAULT 40;

-- Adicionar comentário à coluna
COMMENT ON COLUMN public.ciclos_estudo.total_horas IS 'Total de horas semanais definidas para o ciclo de estudos';

-- Atualizar registros existentes para usar a nova coluna
UPDATE public.ciclos_estudo
SET total_horas = 40
WHERE total_horas IS NULL; 