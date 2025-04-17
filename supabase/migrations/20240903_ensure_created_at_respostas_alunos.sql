-- Garantindo que a tabela respostas_alunos tenha o campo created_at
DO $$
BEGIN
    -- Verifica se a coluna created_at existe
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'respostas_alunos' 
        AND column_name = 'created_at'
    ) THEN
        -- Adiciona a coluna created_at com valor padrão
        ALTER TABLE public.respostas_alunos 
        ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;
    END IF;
    
    -- Criar um índice para melhorar a performance das consultas que ordenam por created_at
    IF NOT EXISTS (
        SELECT 1
        FROM pg_indexes
        WHERE tablename = 'respostas_alunos'
        AND indexname = 'idx_respostas_alunos_created_at'
    ) THEN
        CREATE INDEX idx_respostas_alunos_created_at ON public.respostas_alunos(questao_id, aluno_id, created_at);
    END IF;
END
$$; 