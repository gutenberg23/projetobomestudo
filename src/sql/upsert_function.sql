
-- Função para upsert (inserir ou atualizar) tentativas de questões
-- Isso garante que apenas a tentativa mais recente seja armazenada
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
