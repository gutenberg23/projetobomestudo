-- =====================================================================
-- 1. Tópicos ligados a uma teoria ("Link da aula em texto")
-- 2. Correções de trechos das teorias enviadas por usuários, com
--    aprovação da administração
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. topicos.teoria_id
-- ---------------------------------------------------------------------
-- O campo "Link da aula em texto" passa a apontar para uma teoria do
-- próprio site. A coluna pdf_url continua existindo: tópicos antigos que
-- usam PDF seguem funcionando exatamente como antes.
ALTER TABLE public.topicos
    ADD COLUMN IF NOT EXISTS teoria_id UUID REFERENCES public.teorias(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS topicos_teoria_id_idx ON public.topicos (teoria_id);

-- ---------------------------------------------------------------------
-- 2. Correções de teorias
-- ---------------------------------------------------------------------
-- Usuários comuns NÃO recebem escrita em public.teorias. Eles gravam apenas
-- em public.teoria_correcoes. O texto da teoria só muda pela função
-- public.aprovar_correcao_teoria, que exige public.is_admin().
-- A chave de liga/desliga e os limites são os mesmos das contribuições de
-- conteúdo (public.contribuicoes_config).
CREATE TABLE IF NOT EXISTS public.teoria_correcoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    teoria_id UUID NOT NULL REFERENCES public.teorias(id) ON DELETE CASCADE,
    autor_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'rejeitado')),
    trecho_original TEXT NOT NULL CHECK (char_length(btrim(trecho_original)) BETWEEN 3 AND 3000),
    trecho_corrigido TEXT NOT NULL CHECK (char_length(trecho_corrigido) BETWEEN 1 AND 5000),
    justificativa TEXT CHECK (justificativa IS NULL OR char_length(justificativa) <= 2000),
    revisado_por UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    revisado_em TIMESTAMPTZ,
    motivo_rejeicao TEXT CHECK (motivo_rejeicao IS NULL OR char_length(motivo_rejeicao) <= 2000),
    aplicada_no_texto BOOLEAN
);

CREATE INDEX IF NOT EXISTS teoria_correcoes_status_idx ON public.teoria_correcoes (status, created_at DESC);
CREATE INDEX IF NOT EXISTS teoria_correcoes_autor_idx ON public.teoria_correcoes (autor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS teoria_correcoes_teoria_idx ON public.teoria_correcoes (teoria_id);

CREATE OR REPLACE FUNCTION public.teoria_correcoes_validar()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_uid UUID := auth.uid();
    v_admin BOOLEAN := public.is_admin();
    v_moderacao BOOLEAN := coalesce(current_setting('bomestudo.moderacao', true), '') = 'on';
    v_cfg public.contribuicoes_config%ROWTYPE;
    v_qtd INTEGER;
BEGIN
    -- Contextos confiáveis (service_role, conexão direta, cascatas de FK)
    IF coalesce(auth.role(), '') NOT IN ('anon', 'authenticated') AND NOT v_moderacao THEN
        NEW.updated_at := now();
        RETURN NEW;
    END IF;

    IF TG_OP = 'INSERT' THEN
        IF v_uid IS NULL THEN
            RAISE EXCEPTION 'É necessário estar autenticado para sugerir correções';
        END IF;

        NEW.autor_id := v_uid;
        NEW.status := 'pendente';
        NEW.revisado_por := NULL;
        NEW.revisado_em := NULL;
        NEW.motivo_rejeicao := NULL;
        NEW.aplicada_no_texto := NULL;
        NEW.created_at := now();
        NEW.trecho_original := btrim(NEW.trecho_original);
        NEW.trecho_corrigido := btrim(NEW.trecho_corrigido);
        NEW.justificativa := nullif(btrim(coalesce(NEW.justificativa, '')), '');

        IF NEW.trecho_original = NEW.trecho_corrigido THEN
            RAISE EXCEPTION 'O trecho corrigido é igual ao original';
        END IF;

        IF NOT EXISTS (SELECT 1 FROM public.teorias t
                       WHERE t.id = NEW.teoria_id AND t.status = 'published') THEN
            RAISE EXCEPTION 'Teoria não encontrada';
        END IF;

        IF NOT v_admin THEN
            SELECT * INTO v_cfg FROM public.contribuicoes_config WHERE id = 1;
            IF NOT coalesce(v_cfg.habilitado, false) THEN
                RAISE EXCEPTION 'O envio de correções está desabilitado no momento';
            END IF;

            SELECT count(*) INTO v_qtd FROM public.teoria_correcoes
            WHERE autor_id = v_uid AND status = 'pendente';
            IF v_qtd >= v_cfg.limite_pendentes THEN
                RAISE EXCEPTION 'Você atingiu o limite de % correções aguardando análise', v_cfg.limite_pendentes;
            END IF;

            SELECT count(*) INTO v_qtd FROM public.teoria_correcoes
            WHERE autor_id = v_uid AND created_at > now() - interval '24 hours';
            IF v_qtd >= v_cfg.limite_diario THEN
                RAISE EXCEPTION 'Você atingiu o limite de % correções nas últimas 24 horas', v_cfg.limite_diario;
            END IF;
        END IF;
    ELSE
        -- Só as funções de moderação (executadas por admin) alteram registros
        IF NOT (v_moderacao AND v_admin) THEN
            RAISE EXCEPTION 'Correções só podem ser alteradas pela moderação';
        END IF;
        IF NEW.teoria_id IS DISTINCT FROM OLD.teoria_id
           OR NEW.autor_id IS DISTINCT FROM OLD.autor_id
           OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
            RAISE EXCEPTION 'Teoria, autor e data de criação não podem ser alterados';
        END IF;
    END IF;

    NEW.updated_at := now();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS teoria_correcoes_validar ON public.teoria_correcoes;
CREATE TRIGGER teoria_correcoes_validar
BEFORE INSERT OR UPDATE ON public.teoria_correcoes
FOR EACH ROW EXECUTE FUNCTION public.teoria_correcoes_validar();

ALTER TABLE public.teoria_correcoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Autor ou admin leem correções" ON public.teoria_correcoes;
CREATE POLICY "Autor ou admin leem correções"
ON public.teoria_correcoes FOR SELECT
TO authenticated
USING (autor_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Usuários criam as próprias correções" ON public.teoria_correcoes;
CREATE POLICY "Usuários criam as próprias correções"
ON public.teoria_correcoes FOR INSERT
TO authenticated
WITH CHECK (autor_id = auth.uid() AND status = 'pendente');

DROP POLICY IF EXISTS "Autor exclui pendentes, admin exclui todas" ON public.teoria_correcoes;
CREATE POLICY "Autor exclui pendentes, admin exclui todas"
ON public.teoria_correcoes FOR DELETE
TO authenticated
USING ((autor_id = auth.uid() AND status = 'pendente') OR public.is_admin());

REVOKE ALL ON public.teoria_correcoes FROM anon;
REVOKE ALL ON public.teoria_correcoes FROM authenticated;
GRANT SELECT, DELETE ON public.teoria_correcoes TO authenticated;
GRANT INSERT (teoria_id, trecho_original, trecho_corrigido, justificativa)
    ON public.teoria_correcoes TO authenticated;

-- ---------------------------------------------------------------------
-- 3. Aprovação
-- ---------------------------------------------------------------------
-- p_conteudo_novo      : HTML da teoria já com a correção aplicada (calculado
--                        no painel, onde o admin vê a prévia). NULL aprova sem
--                        mexer no texto (ex.: o admin aplicou à mão no editor).
-- p_conteudo_anterior  : HTML sobre o qual a prévia foi calculada. Se a teoria
--                        mudou nesse meio-tempo, a aprovação é recusada para
--                        não sobrescrever outra edição.
CREATE OR REPLACE FUNCTION public.aprovar_correcao_teoria(
    p_id UUID,
    p_conteudo_novo TEXT DEFAULT NULL,
    p_conteudo_anterior TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    c public.teoria_correcoes%ROWTYPE;
    v_atual TEXT;
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Apenas administradores podem aprovar correções' USING ERRCODE = '42501';
    END IF;

    SELECT * INTO c FROM public.teoria_correcoes WHERE id = p_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Correção não encontrada';
    END IF;
    IF c.status <> 'pendente' THEN
        RAISE EXCEPTION 'Esta correção já foi analisada (%).', c.status;
    END IF;

    IF p_conteudo_novo IS NOT NULL THEN
        IF char_length(btrim(p_conteudo_novo)) = 0 THEN
            RAISE EXCEPTION 'O novo conteúdo da teoria está vazio';
        END IF;
        SELECT conteudo INTO v_atual FROM public.teorias WHERE id = c.teoria_id FOR UPDATE;
        IF NOT FOUND THEN
            RAISE EXCEPTION 'A teoria desta correção não existe mais';
        END IF;
        IF v_atual IS DISTINCT FROM p_conteudo_anterior THEN
            RAISE EXCEPTION 'A teoria foi alterada desde que você abriu a moderação. Recarregue a página e tente de novo.';
        END IF;
        UPDATE public.teorias SET conteudo = p_conteudo_novo, updated_at = now() WHERE id = c.teoria_id;
    END IF;

    PERFORM set_config('bomestudo.moderacao', 'on', true);

    UPDATE public.teoria_correcoes
    SET status = 'aprovado',
        revisado_por = auth.uid(),
        revisado_em = now(),
        motivo_rejeicao = NULL,
        aplicada_no_texto = (p_conteudo_novo IS NOT NULL)
    WHERE id = c.id;
END;
$$;

-- ---------------------------------------------------------------------
-- 4. Rejeição
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.rejeitar_correcao_teoria(p_id UUID, p_motivo TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_status TEXT;
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Apenas administradores podem rejeitar correções' USING ERRCODE = '42501';
    END IF;

    IF p_motivo IS NULL OR char_length(btrim(p_motivo)) < 5 THEN
        RAISE EXCEPTION 'Informe o motivo da rejeição (mínimo 5 caracteres)';
    END IF;

    SELECT status INTO v_status FROM public.teoria_correcoes WHERE id = p_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Correção não encontrada';
    END IF;
    IF v_status <> 'pendente' THEN
        RAISE EXCEPTION 'Esta correção já foi analisada (%).', v_status;
    END IF;

    PERFORM set_config('bomestudo.moderacao', 'on', true);

    UPDATE public.teoria_correcoes
    SET status = 'rejeitado',
        revisado_por = auth.uid(),
        revisado_em = now(),
        motivo_rejeicao = left(btrim(p_motivo), 2000)
    WHERE id = p_id;
END;
$$;

REVOKE ALL ON FUNCTION public.aprovar_correcao_teoria(UUID, TEXT, TEXT) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.rejeitar_correcao_teoria(UUID, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.aprovar_correcao_teoria(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rejeitar_correcao_teoria(UUID, TEXT) TO authenticated;
REVOKE ALL ON FUNCTION public.teoria_correcoes_validar() FROM PUBLIC, anon, authenticated;
