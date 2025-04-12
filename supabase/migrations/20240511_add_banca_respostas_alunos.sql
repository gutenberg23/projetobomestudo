-- Adicionar coluna banca à tabela respostas_alunos
ALTER TABLE IF EXISTS "public"."respostas_alunos"
ADD COLUMN IF NOT EXISTS "banca" TEXT DEFAULT '';

-- Criar índice para a nova coluna
CREATE INDEX IF NOT EXISTS idx_respostas_alunos_banca ON "public"."respostas_alunos"(banca); 