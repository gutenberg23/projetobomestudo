-- Verificar e corrigir as políticas RLS da tabela user_question_attempts

-- Primeiro, vamos garantir que as políticas permitam que os usuários vejam e modifiquem suas próprias tentativas
DROP POLICY IF EXISTS "user_question_attempts_select_policy" ON public.user_question_attempts;
DROP POLICY IF EXISTS "user_question_attempts_insert_policy" ON public.user_question_attempts;
DROP POLICY IF EXISTS "user_question_attempts_update_policy" ON public.user_question_attempts;
DROP POLICY IF EXISTS "Usuários autenticados podem ver o ranking de questões" ON public.user_question_attempts;

-- Criar políticas corretas
CREATE POLICY "Usuários podem ver suas próprias tentativas"
ON public.user_question_attempts
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias tentativas"
ON public.user_question_attempts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias tentativas"
ON public.user_question_attempts
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Política para permitir que usuários autenticados vejam o ranking (para funcionalidades de ranking)
CREATE POLICY "Usuários autenticados podem ver tentativas para ranking"
ON public.user_question_attempts
FOR SELECT
USING (auth.role() = 'authenticated');

-- Garantir que a função upsert funcione corretamente
CREATE OR REPLACE FUNCTION public.upsert_user_question_attempt(
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