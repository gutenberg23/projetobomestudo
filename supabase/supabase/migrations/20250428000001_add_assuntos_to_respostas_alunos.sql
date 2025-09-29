-- Adiciona coluna assuntos à tabela respostas_alunos
ALTER TABLE respostas_alunos 
ADD COLUMN IF NOT EXISTS assuntos TEXT[];