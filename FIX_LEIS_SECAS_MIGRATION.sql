-- Script para corrigir a migração da tabela leis_secas
-- Este script deve ser executado por um administrador do banco de dados

-- Verificar se a coluna cursos_ids existe
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'leis_secas' AND column_name = 'cursos_ids';

-- Se a coluna não existir, execute os seguintes comandos:

-- 1. Adicionar coluna para múltiplos cursos em leis secas
ALTER TABLE public.leis_secas 
ADD COLUMN IF NOT EXISTS cursos_ids UUID[];

-- 2. Atualizar dados existentes para garantir compatibilidade
-- Copiar o valor de curso_id para cursos_ids como um array
UPDATE public.leis_secas 
SET cursos_ids = ARRAY[curso_id]::UUID[]
WHERE cursos_ids IS NULL OR cursos_ids = '{}';

-- 3. Verificar se a coluna foi adicionada corretamente
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'leis_secas' AND column_name = 'cursos_ids';

-- 4. Verificar alguns registros para confirmar que os dados foram atualizados
SELECT id, titulo, curso_id, cursos_ids 
FROM public.leis_secas 
LIMIT 5;