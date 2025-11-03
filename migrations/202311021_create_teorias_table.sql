-- Create teorias table
CREATE TABLE IF NOT EXISTS public.teorias (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    disciplina_id UUID NOT NULL,
    assunto_id UUID NOT NULL,
    topicos_ids UUID[] DEFAULT ARRAY[]::UUID[], -- Voltando a ser UUID[] para manter consistência
    conteudo TEXT NOT NULL,
    no_edital TEXT,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_teorias_disciplina_id ON public.teorias(disciplina_id);
CREATE INDEX IF NOT EXISTS idx_teorias_assunto_id ON public.teorias(assunto_id);
CREATE INDEX IF NOT EXISTS idx_teorias_status ON public.teorias(status);
CREATE INDEX IF NOT EXISTS idx_teorias_updated_at ON public.teorias(updated_at);

-- Enable RLS (Row Level Security)
ALTER TABLE public.teorias ENABLE ROW LEVEL SECURITY;

-- Create policies for teorias table
CREATE POLICY "Todos podem ver teorias publicadas" 
    ON public.teorias 
    FOR SELECT 
    USING (status = 'published');

CREATE POLICY "Usuários autenticados podem ver todas as teorias" 
    ON public.teorias 
    FOR SELECT 
    TO authenticated 
    USING (true);

CREATE POLICY "Usuários autenticados podem inserir teorias" 
    ON public.teorias 
    FOR INSERT 
    TO authenticated 
    WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar teorias" 
    ON public.teorias 
    FOR UPDATE 
    TO authenticated 
    USING (true);

CREATE POLICY "Usuários autenticados podem deletar teorias" 
    ON public.teorias 
    FOR DELETE 
    TO authenticated 
    USING (true);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_teorias_updated_at 
    BEFORE UPDATE ON public.teorias 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();