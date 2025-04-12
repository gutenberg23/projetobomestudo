-- Adicionar colunas topicos e disciplina à tabela respostas_alunos
ALTER TABLE IF EXISTS "public"."respostas_alunos"
ADD COLUMN IF NOT EXISTS "topicos" TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS "disciplina" TEXT DEFAULT '';

-- Criar índices para as novas colunas
CREATE INDEX IF NOT EXISTS idx_respostas_alunos_disciplina ON "public"."respostas_alunos"(disciplina); 