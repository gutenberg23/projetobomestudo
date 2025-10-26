-- Criar tabela de topicos
CREATE TABLE IF NOT EXISTS public.topicos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    nome TEXT NOT NULL,
    patrocinador TEXT,
    disciplina TEXT NOT NULL,
    questoes_ids TEXT[],
    professor_id UUID REFERENCES auth.users(id),
    professor_nome TEXT,
    video_url TEXT,
    pdf_url TEXT,
    mapa_url TEXT,
    resumo_url TEXT,
    musica_url TEXT,
    resumo_audio_url TEXT,
    caderno_questoes_url TEXT,
    abrir_em_nova_guia BOOLEAN DEFAULT false
);

-- Habilitar RLS
ALTER TABLE public.topicos ENABLE ROW LEVEL SECURITY;

-- Criar políticas de acesso
CREATE POLICY "Leitura pública de topicos"
ON public.topicos FOR SELECT
TO public
USING (true);

CREATE POLICY "Admins e professores gerenciam topicos"
ON public.topicos FOR ALL
TO authenticated
USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'professor')
)
WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'professor')
);

-- Criar função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar trigger para atualizar updated_at
CREATE TRIGGER update_topicos_updated_at 
    BEFORE UPDATE ON public.topicos 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();