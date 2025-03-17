-- SQL para criar uma tabela que rastreia as tentativas únicas de questões por usuário
-- Esta tabela armazenará apenas a tentativa mais recente de cada questão

-- Criação da tabela user_question_attempts
CREATE TABLE IF NOT EXISTS public.user_question_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    question_id TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraint para garantir que cada usuário tenha apenas uma entrada por questão
    CONSTRAINT user_question_unique UNIQUE (user_id, question_id)
);

-- Índice para melhorar a performance das consultas
CREATE INDEX IF NOT EXISTS idx_user_question_attempts_user_question ON public.user_question_attempts(user_id, question_id);

-- Trigger para atualizar o timestamp automaticamente
CREATE OR REPLACE FUNCTION update_user_question_attempts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_question_attempts_updated_at
BEFORE UPDATE ON public.user_question_attempts
FOR EACH ROW
EXECUTE FUNCTION update_user_question_attempts_updated_at();

-- Políticas RLS para proteger os dados
ALTER TABLE public.user_question_attempts ENABLE ROW LEVEL SECURITY;

-- Política para SELECT: usuário só pode ver suas próprias tentativas
CREATE POLICY user_question_attempts_select_policy
ON public.user_question_attempts
FOR SELECT
USING (auth.uid() = user_id);

-- Política para INSERT: usuário só pode inserir suas próprias tentativas
CREATE POLICY user_question_attempts_insert_policy
ON public.user_question_attempts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Política para UPDATE: usuário só pode atualizar suas próprias tentativas
CREATE POLICY user_question_attempts_update_policy
ON public.user_question_attempts
FOR UPDATE
USING (auth.uid() = user_id);

-- Função para upsert (inserir ou atualizar) tentativas de questões
-- Isso garante que apenas a tentativa mais recente seja armazenada
CREATE OR REPLACE FUNCTION upsert_user_question_attempt(
    p_user_id UUID,
    p_question_id TEXT,
    p_is_correct BOOLEAN
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.user_question_attempts (user_id, question_id, is_correct)
    VALUES (p_user_id, p_question_id, p_is_correct)
    ON CONFLICT (user_id, question_id) 
    DO UPDATE SET 
        is_correct = p_is_correct,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
