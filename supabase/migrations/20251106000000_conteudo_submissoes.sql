-- =====================================================================
-- Contribuições de usuários com aprovação da administração
-- =====================================================================
-- Usuários comuns NÃO recebem permissão de escrita em cursos, disciplinas,
-- aulas ou topicos. Eles escrevem apenas em public.conteudo_submissoes
-- (área de quarentena). A publicação acontece somente pela função
-- public.aprovar_submissao, que roda como SECURITY DEFINER e exige
-- public.is_admin(). As policies existentes das tabelas de conteúdo
-- permanecem inalteradas.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Configuração da funcionalidade (linha única)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contribuicoes_config (
    id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    habilitado BOOLEAN NOT NULL DEFAULT true,
    limite_pendentes INTEGER NOT NULL DEFAULT 20 CHECK (limite_pendentes BETWEEN 1 AND 500),
    limite_diario INTEGER NOT NULL DEFAULT 30 CHECK (limite_diario BETWEEN 1 AND 1000),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

INSERT INTO public.contribuicoes_config (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.contribuicoes_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Leitura pública da config de contribuições" ON public.contribuicoes_config;
CREATE POLICY "Leitura pública da config de contribuições"
ON public.contribuicoes_config FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Admins atualizam config de contribuições" ON public.contribuicoes_config;
CREATE POLICY "Admins atualizam config de contribuições"
ON public.contribuicoes_config FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

REVOKE ALL ON public.contribuicoes_config FROM anon, authenticated;
GRANT SELECT ON public.contribuicoes_config TO anon, authenticated;
GRANT UPDATE (habilitado, limite_pendentes, limite_diario) ON public.contribuicoes_config TO authenticated;

CREATE OR REPLACE FUNCTION public.contribuicoes_config_touch()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    NEW.updated_at := now();
    NEW.updated_by := auth.uid();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS contribuicoes_config_touch ON public.contribuicoes_config;
CREATE TRIGGER contribuicoes_config_touch
BEFORE UPDATE ON public.contribuicoes_config
FOR EACH ROW EXECUTE FUNCTION public.contribuicoes_config_touch();

-- ---------------------------------------------------------------------
-- 2. Tabela de submissões
-- ---------------------------------------------------------------------
-- tipo               : o que está sendo proposto
-- dados              : campos específicos do tipo (lista branca validada no trigger)
-- itens_ids          : filhos já publicados (topicos de uma aula, aulas de
--                      uma disciplina, disciplinas de um curso)
-- itens_submissao_ids: filhos que também são submissões do mesmo autor
-- destino_id         : item já publicado onde o novo conteúdo deve ser
--                      anexado (ex.: tópico novo dentro de uma aula existente)
CREATE TABLE IF NOT EXISTS public.conteudo_submissoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    tipo TEXT NOT NULL CHECK (tipo IN ('topico', 'aula', 'disciplina', 'curso')),
    status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'rejeitado')),
    autor_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL CHECK (char_length(btrim(titulo)) BETWEEN 3 AND 200),
    descricao TEXT CHECK (descricao IS NULL OR char_length(descricao) <= 5000),
    dados JSONB NOT NULL DEFAULT '{}'::jsonb
        CHECK (jsonb_typeof(dados) = 'object' AND pg_column_size(dados) <= 65536),
    itens_ids TEXT[] NOT NULL DEFAULT '{}' CHECK (cardinality(itens_ids) <= 300),
    itens_submissao_ids UUID[] NOT NULL DEFAULT '{}' CHECK (cardinality(itens_submissao_ids) <= 100),
    destino_id TEXT CHECK (destino_id IS NULL OR char_length(destino_id) <= 64),
    revisado_por UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    revisado_em TIMESTAMPTZ,
    motivo_rejeicao TEXT CHECK (motivo_rejeicao IS NULL OR char_length(motivo_rejeicao) <= 2000),
    conteudo_publicado_id TEXT
);

CREATE INDEX IF NOT EXISTS conteudo_submissoes_status_idx ON public.conteudo_submissoes (status, created_at DESC);
CREATE INDEX IF NOT EXISTS conteudo_submissoes_autor_idx ON public.conteudo_submissoes (autor_id, created_at DESC);

-- ---------------------------------------------------------------------
-- 3. Validação e proteção de campos (trigger)
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.conteudo_submissoes_validar()
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
    v_permitidos TEXT[];
    v_chave TEXT;
    v_valor JSONB;
    v_parte TEXT;
    v_qtd INTEGER;
    v_tipo_filho TEXT;
    v_questoes TEXT[];
BEGIN
    -- Contextos confiáveis (service_role, conexões diretas ao banco, cascatas
    -- de FK disparadas pelo Auth ao excluir usuários) não passam pelas regras
    -- de usuário final.
    IF coalesce(auth.role(), '') NOT IN ('anon', 'authenticated') AND NOT v_moderacao THEN
        NEW.updated_at := now();
        RETURN NEW;
    END IF;

    IF v_uid IS NULL AND NOT v_moderacao THEN
        RAISE EXCEPTION 'É necessário estar autenticado para enviar conteúdo';
    END IF;

    IF TG_OP = 'INSERT' THEN
        -- Campos controlados pelo servidor: nunca aceitos do cliente
        NEW.autor_id := v_uid;
        NEW.status := 'pendente';
        NEW.revisado_por := NULL;
        NEW.revisado_em := NULL;
        NEW.motivo_rejeicao := NULL;
        NEW.conteudo_publicado_id := NULL;
        NEW.created_at := now();

        IF NOT v_admin THEN
            SELECT * INTO v_cfg FROM public.contribuicoes_config WHERE id = 1;
            IF NOT coalesce(v_cfg.habilitado, false) THEN
                RAISE EXCEPTION 'O envio de conteúdos por usuários está desabilitado no momento';
            END IF;

            SELECT count(*) INTO v_qtd FROM public.conteudo_submissoes
            WHERE autor_id = v_uid AND status = 'pendente';
            IF v_qtd >= v_cfg.limite_pendentes THEN
                RAISE EXCEPTION 'Você atingiu o limite de % envios aguardando análise', v_cfg.limite_pendentes;
            END IF;

            SELECT count(*) INTO v_qtd FROM public.conteudo_submissoes
            WHERE autor_id = v_uid AND created_at > now() - interval '24 hours';
            IF v_qtd >= v_cfg.limite_diario THEN
                RAISE EXCEPTION 'Você atingiu o limite de % envios nas últimas 24 horas', v_cfg.limite_diario;
            END IF;
        END IF;
    ELSE
        -- UPDATE
        IF NEW.tipo IS DISTINCT FROM OLD.tipo
           OR NEW.autor_id IS DISTINCT FROM OLD.autor_id
           OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
            RAISE EXCEPTION 'Tipo, autor e data de criação não podem ser alterados';
        END IF;

        IF NEW.status IS DISTINCT FROM OLD.status
           OR NEW.revisado_por IS DISTINCT FROM OLD.revisado_por
           OR NEW.revisado_em IS DISTINCT FROM OLD.revisado_em
           OR NEW.motivo_rejeicao IS DISTINCT FROM OLD.motivo_rejeicao
           OR NEW.conteudo_publicado_id IS DISTINCT FROM OLD.conteudo_publicado_id THEN
            -- Só as funções de moderação (executadas por admin) mudam o status
            IF NOT (v_moderacao AND v_admin) THEN
                RAISE EXCEPTION 'O status só pode ser alterado pela moderação';
            END IF;
        ELSIF OLD.status <> 'pendente' THEN
            RAISE EXCEPTION 'Envios já analisados não podem ser editados';
        END IF;
    END IF;

    NEW.updated_at := now();

    -- Normalização básica
    NEW.titulo := btrim(NEW.titulo);
    NEW.descricao := nullif(btrim(coalesce(NEW.descricao, '')), '');
    NEW.destino_id := nullif(btrim(coalesce(NEW.destino_id, '')), '');

    -- Validações de conteúdo só se aplicam a envios pendentes
    IF NEW.status <> 'pendente' THEN
        RETURN NEW;
    END IF;

    -- Lista branca de campos por tipo
    v_permitidos := CASE NEW.tipo
        WHEN 'topico' THEN ARRAY['disciplina', 'video_url', 'pdf_url', 'mapa_url', 'resumo_url',
                                 'musica_url', 'resumo_audio_url', 'caderno_questoes_url',
                                 'questoes_ids', 'abrir_em_nova_guia']
        WHEN 'aula' THEN ARRAY[]::TEXT[]
        WHEN 'disciplina' THEN ARRAY['banca']
        WHEN 'curso' THEN ARRAY['informacoes_curso']
    END;

    FOR v_chave, v_valor IN SELECT key, value FROM jsonb_each(NEW.dados) LOOP
        IF NOT (v_chave = ANY (v_permitidos)) THEN
            RAISE EXCEPTION 'Campo não permitido para %: %', NEW.tipo, v_chave;
        END IF;

        IF v_chave LIKE '%\_url' ESCAPE '\' THEN
            IF jsonb_typeof(v_valor) <> 'string' THEN
                RAISE EXCEPTION 'O campo % deve ser texto', v_chave;
            END IF;
            IF char_length(v_valor #>> '{}') > 4000 THEN
                RAISE EXCEPTION 'O campo % é muito longo', v_chave;
            END IF;
            -- musica_url e resumo_audio_url aceitam lista separada por vírgula
            FOREACH v_parte IN ARRAY string_to_array(v_valor #>> '{}', ',') LOOP
                v_parte := btrim(v_parte);
                CONTINUE WHEN v_parte = '';
                IF v_parte !~* '^https?://[^\s<>"''`\\]+$' THEN
                    RAISE EXCEPTION 'Link inválido em %: use um endereço http(s)://', v_chave;
                END IF;
            END LOOP;
        ELSIF v_chave = 'questoes_ids' THEN
            IF jsonb_typeof(v_valor) <> 'array' OR jsonb_array_length(v_valor) > 500 THEN
                RAISE EXCEPTION 'questoes_ids deve ser uma lista com no máximo 500 itens';
            END IF;
            IF EXISTS (SELECT 1 FROM jsonb_array_elements(v_valor) e
                       WHERE jsonb_typeof(e) <> 'string' OR char_length(e #>> '{}') > 64) THEN
                RAISE EXCEPTION 'questoes_ids contém valores inválidos';
            END IF;
            SELECT coalesce(array_agg(DISTINCT e), '{}') INTO v_questoes
            FROM jsonb_array_elements_text(v_valor) e;
            SELECT count(*) INTO v_qtd FROM public.questoes q WHERE q.id::text = ANY (v_questoes);
            IF v_qtd <> cardinality(v_questoes) THEN
                RAISE EXCEPTION 'Uma ou mais questões informadas não existem';
            END IF;
        ELSIF v_chave = 'abrir_em_nova_guia' THEN
            IF jsonb_typeof(v_valor) <> 'boolean' THEN
                RAISE EXCEPTION 'abrir_em_nova_guia deve ser verdadeiro ou falso';
            END IF;
        ELSIF v_chave = 'informacoes_curso' THEN
            IF jsonb_typeof(v_valor) <> 'string' OR char_length(v_valor #>> '{}') > 20000 THEN
                RAISE EXCEPTION 'informacoes_curso inválido ou muito longo';
            END IF;
        ELSE
            -- disciplina, banca
            IF jsonb_typeof(v_valor) <> 'string' OR char_length(v_valor #>> '{}') > 200 THEN
                RAISE EXCEPTION 'O campo % deve ser texto com até 200 caracteres', v_chave;
            END IF;
        END IF;
    END LOOP;

    IF NEW.tipo = 'topico' AND nullif(btrim(coalesce(NEW.dados ->> 'disciplina', '')), '') IS NULL THEN
        RAISE EXCEPTION 'Informe a disciplina do tópico';
    END IF;

    -- Filhos: só fazem sentido para aula, disciplina e curso
    v_tipo_filho := CASE NEW.tipo
        WHEN 'aula' THEN 'topico'
        WHEN 'disciplina' THEN 'aula'
        WHEN 'curso' THEN 'disciplina'
        ELSE NULL
    END;

    IF v_tipo_filho IS NULL THEN
        IF cardinality(NEW.itens_ids) > 0 OR cardinality(NEW.itens_submissao_ids) > 0 THEN
            RAISE EXCEPTION 'Tópicos não possuem itens filhos';
        END IF;
    ELSE
        SELECT coalesce(array_agg(DISTINCT x), '{}') INTO NEW.itens_ids
        FROM unnest(NEW.itens_ids) x WHERE btrim(x) <> '';

        IF cardinality(NEW.itens_ids) > 0 THEN
            EXECUTE format('SELECT count(*) FROM public.%I WHERE id::text = ANY ($1)',
                           CASE v_tipo_filho WHEN 'topico' THEN 'topicos'
                                             WHEN 'aula' THEN 'aulas'
                                             ELSE 'disciplinas' END)
            INTO v_qtd USING NEW.itens_ids;
            IF v_qtd <> cardinality(NEW.itens_ids) THEN
                RAISE EXCEPTION 'Um ou mais itens selecionados não existem';
            END IF;
        END IF;

        SELECT coalesce(array_agg(DISTINCT x), '{}') INTO NEW.itens_submissao_ids
        FROM unnest(NEW.itens_submissao_ids) x;

        IF cardinality(NEW.itens_submissao_ids) > 0 THEN
            IF NEW.id = ANY (NEW.itens_submissao_ids) THEN
                RAISE EXCEPTION 'Um envio não pode conter a si mesmo';
            END IF;
            SELECT count(*) INTO v_qtd FROM public.conteudo_submissoes s
            WHERE s.id = ANY (NEW.itens_submissao_ids)
              AND s.autor_id = NEW.autor_id
              AND s.tipo = v_tipo_filho
              AND s.status <> 'rejeitado';
            IF v_qtd <> cardinality(NEW.itens_submissao_ids) THEN
                RAISE EXCEPTION 'Itens enviados inválidos: use apenas seus próprios envios do tipo %', v_tipo_filho;
            END IF;
        END IF;

        IF cardinality(NEW.itens_ids) + cardinality(NEW.itens_submissao_ids) = 0 THEN
            RAISE EXCEPTION 'Selecione ao menos um item para compor este conteúdo';
        END IF;
    END IF;

    -- Destino (anexar a um item já publicado)
    IF NEW.destino_id IS NOT NULL THEN
        IF NEW.tipo = 'curso' THEN
            RAISE EXCEPTION 'Cursos não podem ser anexados a outro item';
        END IF;
        EXECUTE format('SELECT count(*) FROM public.%I WHERE id::text = $1',
                       CASE NEW.tipo WHEN 'topico' THEN 'aulas'
                                     WHEN 'aula' THEN 'disciplinas'
                                     ELSE 'cursos' END)
        INTO v_qtd USING NEW.destino_id;
        IF v_qtd = 0 THEN
            RAISE EXCEPTION 'O destino selecionado não existe';
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS conteudo_submissoes_validar ON public.conteudo_submissoes;
CREATE TRIGGER conteudo_submissoes_validar
BEFORE INSERT OR UPDATE ON public.conteudo_submissoes
FOR EACH ROW EXECUTE FUNCTION public.conteudo_submissoes_validar();

-- ---------------------------------------------------------------------
-- 4. RLS
-- ---------------------------------------------------------------------
ALTER TABLE public.conteudo_submissoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Autor ou admin leem submissões" ON public.conteudo_submissoes;
CREATE POLICY "Autor ou admin leem submissões"
ON public.conteudo_submissoes FOR SELECT
TO authenticated
USING (autor_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Usuários criam as próprias submissões" ON public.conteudo_submissoes;
CREATE POLICY "Usuários criam as próprias submissões"
ON public.conteudo_submissoes FOR INSERT
TO authenticated
WITH CHECK (autor_id = auth.uid() AND status = 'pendente');

DROP POLICY IF EXISTS "Autor edita pendentes, admin edita todas" ON public.conteudo_submissoes;
CREATE POLICY "Autor edita pendentes, admin edita todas"
ON public.conteudo_submissoes FOR UPDATE
TO authenticated
USING ((autor_id = auth.uid() AND status = 'pendente') OR public.is_admin())
WITH CHECK ((autor_id = auth.uid() AND status = 'pendente') OR public.is_admin());

DROP POLICY IF EXISTS "Autor exclui pendentes, admin exclui todas" ON public.conteudo_submissoes;
CREATE POLICY "Autor exclui pendentes, admin exclui todas"
ON public.conteudo_submissoes FOR DELETE
TO authenticated
USING ((autor_id = auth.uid() AND status = 'pendente') OR public.is_admin());

REVOKE ALL ON public.conteudo_submissoes FROM anon;
REVOKE ALL ON public.conteudo_submissoes FROM authenticated;
GRANT SELECT, INSERT, DELETE ON public.conteudo_submissoes TO authenticated;
-- Apenas colunas de conteúdo são editáveis diretamente
GRANT UPDATE (titulo, descricao, dados, itens_ids, itens_submissao_ids, destino_id)
    ON public.conteudo_submissoes TO authenticated;

-- ---------------------------------------------------------------------
-- 5. Helpers internos (não expostos)
-- ---------------------------------------------------------------------
-- União das questões de uma lista de tópicos publicados
CREATE OR REPLACE FUNCTION public._submissao_questoes_de_topicos(p_topicos TEXT[])
RETURNS TEXT[]
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT coalesce(array_agg(DISTINCT q), '{}')
    FROM public.topicos t
    CROSS JOIN LATERAL unnest(coalesce(t.questoes_ids::text[], '{}')) q
    WHERE t.id::text = ANY (p_topicos) AND btrim(q) <> '';
$$;

REVOKE ALL ON FUNCTION public._submissao_questoes_de_topicos(TEXT[]) FROM PUBLIC, anon, authenticated;

-- ---------------------------------------------------------------------
-- 6. Aprovação
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.aprovar_submissao(
    p_id UUID,
    p_incluir_dependencias BOOLEAN DEFAULT true
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    s public.conteudo_submissoes%ROWTYPE;
    filho public.conteudo_submissoes%ROWTYPE;
    v_filhos TEXT[];
    v_filho_id UUID;
    v_novo TEXT;
    v_aulas TEXT[];
    v_topicos TEXT[];
    v_questoes TEXT[];
    v_arr TEXT[];
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Apenas administradores podem aprovar conteúdos' USING ERRCODE = '42501';
    END IF;

    SELECT * INTO s FROM public.conteudo_submissoes WHERE id = p_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Envio não encontrado';
    END IF;
    IF s.status <> 'pendente' THEN
        RAISE EXCEPTION 'Este envio já foi analisado (%).', s.status;
    END IF;

    PERFORM set_config('bomestudo.moderacao', 'on', true);

    -- Resolve filhos: publicados + submissões (aprovando-as se pedido)
    v_filhos := coalesce(s.itens_ids, '{}');
    FOREACH v_filho_id IN ARRAY coalesce(s.itens_submissao_ids, '{}') LOOP
        SELECT * INTO filho FROM public.conteudo_submissoes WHERE id = v_filho_id;
        CONTINUE WHEN NOT FOUND;  -- autor excluiu o item: ignora
        IF filho.status = 'aprovado' THEN
            v_filhos := v_filhos || filho.conteudo_publicado_id;
        ELSIF filho.status = 'pendente' AND p_incluir_dependencias THEN
            v_filhos := v_filhos || public.aprovar_submissao(filho.id, true);
            PERFORM set_config('bomestudo.moderacao', 'on', true);
        ELSIF filho.status = 'pendente' THEN
            RAISE EXCEPTION 'O item "%" ainda está pendente. Aprove-o antes ou inclua as dependências.', filho.titulo;
        ELSE
            RAISE EXCEPTION 'O item "%" foi rejeitado. Remova-o deste envio antes de aprovar.', filho.titulo;
        END IF;
    END LOOP;
    -- Remove nulos/duplicados mantendo a ordem
    SELECT coalesce(array_agg(x ORDER BY ord), '{}') INTO v_filhos
    FROM (SELECT DISTINCT ON (x) x, ord
          FROM unnest(v_filhos) WITH ORDINALITY AS u(x, ord)
          WHERE x IS NOT NULL
          ORDER BY x, ord) d;

    IF s.tipo = 'topico' THEN
        INSERT INTO public.topicos (nome, disciplina, questoes_ids, video_url, pdf_url, mapa_url,
                                    resumo_url, musica_url, resumo_audio_url, caderno_questoes_url,
                                    abrir_em_nova_guia)
        SELECT r.nome, r.disciplina, r.questoes_ids, r.video_url, r.pdf_url, r.mapa_url,
               r.resumo_url, r.musica_url, r.resumo_audio_url, r.caderno_questoes_url,
               coalesce(r.abrir_em_nova_guia, false)
        FROM jsonb_populate_record(NULL::public.topicos,
                                   (s.dados - 'nome') || jsonb_build_object('nome', s.titulo)) r
        RETURNING id::text INTO v_novo;

    ELSIF s.tipo = 'aula' THEN
        SELECT coalesce(array_agg(x ORDER BY ord), '{}') INTO v_topicos
        FROM unnest(v_filhos) WITH ORDINALITY AS u(x, ord)
        WHERE EXISTS (SELECT 1 FROM public.topicos t WHERE t.id::text = x);
        v_questoes := public._submissao_questoes_de_topicos(v_topicos);

        INSERT INTO public.aulas (titulo, descricao, topicos_ids, questoes_ids, status)
        SELECT r.titulo, r.descricao, r.topicos_ids, r.questoes_ids, 'ativo'
        FROM jsonb_populate_record(NULL::public.aulas, jsonb_build_object(
            'titulo', s.titulo, 'descricao', s.descricao,
            'topicos_ids', to_jsonb(v_topicos), 'questoes_ids', to_jsonb(v_questoes))) r
        RETURNING id::text INTO v_novo;

    ELSIF s.tipo = 'disciplina' THEN
        SELECT coalesce(array_agg(x ORDER BY ord), '{}') INTO v_aulas
        FROM unnest(v_filhos) WITH ORDINALITY AS u(x, ord)
        WHERE EXISTS (SELECT 1 FROM public.aulas a WHERE a.id::text = x);

        INSERT INTO public.disciplinas (titulo, descricao, banca, aulas_ids)
        SELECT r.titulo, r.descricao, r.banca, r.aulas_ids
        FROM jsonb_populate_record(NULL::public.disciplinas, jsonb_build_object(
            'titulo', s.titulo, 'descricao', s.descricao,
            'banca', nullif(btrim(coalesce(s.dados ->> 'banca', '')), ''),
            'aulas_ids', to_jsonb(v_aulas))) r
        RETURNING id::text INTO v_novo;

    ELSE -- curso
        SELECT coalesce(array_agg(x ORDER BY ord), '{}') INTO v_arr
        FROM unnest(v_filhos) WITH ORDINALITY AS u(x, ord)
        WHERE EXISTS (SELECT 1 FROM public.disciplinas d WHERE d.id::text = x);

        SELECT coalesce(array_agg(DISTINCT a), '{}') INTO v_aulas
        FROM public.disciplinas d CROSS JOIN LATERAL unnest(coalesce(d.aulas_ids::text[], '{}')) a
        WHERE d.id::text = ANY (v_arr);

        SELECT coalesce(array_agg(DISTINCT t), '{}') INTO v_topicos
        FROM public.aulas a CROSS JOIN LATERAL unnest(coalesce(a.topicos_ids::text[], '{}')) t
        WHERE a.id::text = ANY (v_aulas);

        SELECT coalesce(array_agg(DISTINCT q), '{}') INTO v_questoes
        FROM (
            SELECT unnest(public._submissao_questoes_de_topicos(v_topicos)) q
            UNION
            SELECT unnest(coalesce(a.questoes_ids::text[], '{}')) FROM public.aulas a
            WHERE a.id::text = ANY (v_aulas)
        ) z WHERE btrim(q) <> '';

        INSERT INTO public.cursos (titulo, descricao, informacoes_curso, disciplinas_ids,
                                   aulas_ids, topicos_ids, questoes_ids)
        SELECT r.titulo, r.descricao, r.informacoes_curso, r.disciplinas_ids,
               r.aulas_ids, r.topicos_ids, r.questoes_ids
        FROM jsonb_populate_record(NULL::public.cursos, jsonb_build_object(
            'titulo', s.titulo, 'descricao', s.descricao,
            'informacoes_curso', s.dados ->> 'informacoes_curso',
            'disciplinas_ids', to_jsonb(v_arr), 'aulas_ids', to_jsonb(v_aulas),
            'topicos_ids', to_jsonb(v_topicos), 'questoes_ids', to_jsonb(v_questoes))) r
        RETURNING id::text INTO v_novo;
    END IF;

    -- Anexa ao destino escolhido pelo autor (se ainda existir)
    IF s.destino_id IS NOT NULL THEN
        IF s.tipo = 'topico' THEN
            SELECT coalesce(topicos_ids::text[], '{}') INTO v_arr FROM public.aulas WHERE id::text = s.destino_id;
            IF FOUND AND NOT (v_novo = ANY (v_arr)) THEN
                v_arr := v_arr || v_novo;
                v_questoes := public._submissao_questoes_de_topicos(v_arr);
                UPDATE public.aulas
                SET topicos_ids = (SELECT r.topicos_ids FROM jsonb_populate_record(NULL::public.aulas,
                                       jsonb_build_object('topicos_ids', to_jsonb(v_arr))) r),
                    questoes_ids = (SELECT r.questoes_ids FROM jsonb_populate_record(NULL::public.aulas,
                                       jsonb_build_object('questoes_ids', to_jsonb(
                                           ARRAY(SELECT DISTINCT unnest(coalesce(aulas.questoes_ids::text[], '{}') || v_questoes))
                                       ))) r)
                WHERE id::text = s.destino_id;
            END IF;
        ELSIF s.tipo = 'aula' THEN
            SELECT coalesce(aulas_ids::text[], '{}') INTO v_arr FROM public.disciplinas WHERE id::text = s.destino_id;
            IF FOUND AND NOT (v_novo = ANY (v_arr)) THEN
                UPDATE public.disciplinas
                SET aulas_ids = (SELECT r.aulas_ids FROM jsonb_populate_record(NULL::public.disciplinas,
                                     jsonb_build_object('aulas_ids', to_jsonb(v_arr || v_novo))) r)
                WHERE id::text = s.destino_id;
            END IF;
        ELSIF s.tipo = 'disciplina' THEN
            SELECT coalesce(disciplinas_ids::text[], '{}') INTO v_arr FROM public.cursos WHERE id::text = s.destino_id;
            IF FOUND AND NOT (v_novo = ANY (v_arr)) THEN
                UPDATE public.cursos
                SET disciplinas_ids = (SELECT r.disciplinas_ids FROM jsonb_populate_record(NULL::public.cursos,
                                           jsonb_build_object('disciplinas_ids', to_jsonb(v_arr || v_novo))) r)
                WHERE id::text = s.destino_id;
            END IF;
        END IF;
    END IF;

    UPDATE public.conteudo_submissoes
    SET status = 'aprovado',
        revisado_por = auth.uid(),
        revisado_em = now(),
        motivo_rejeicao = NULL,
        conteudo_publicado_id = v_novo
    WHERE id = s.id;

    RETURN v_novo;
END;
$$;

-- ---------------------------------------------------------------------
-- 7. Rejeição
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.rejeitar_submissao(p_id UUID, p_motivo TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_status TEXT;
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Apenas administradores podem rejeitar conteúdos' USING ERRCODE = '42501';
    END IF;

    IF p_motivo IS NULL OR char_length(btrim(p_motivo)) < 5 THEN
        RAISE EXCEPTION 'Informe o motivo da rejeição (mínimo 5 caracteres)';
    END IF;

    SELECT status INTO v_status FROM public.conteudo_submissoes WHERE id = p_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Envio não encontrado';
    END IF;
    IF v_status <> 'pendente' THEN
        RAISE EXCEPTION 'Este envio já foi analisado (%).', v_status;
    END IF;

    PERFORM set_config('bomestudo.moderacao', 'on', true);

    UPDATE public.conteudo_submissoes
    SET status = 'rejeitado',
        revisado_por = auth.uid(),
        revisado_em = now(),
        motivo_rejeicao = left(btrim(p_motivo), 2000)
    WHERE id = p_id;
END;
$$;

REVOKE ALL ON FUNCTION public.aprovar_submissao(UUID, BOOLEAN) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.rejeitar_submissao(UUID, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.aprovar_submissao(UUID, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rejeitar_submissao(UUID, TEXT) TO authenticated;

REVOKE ALL ON FUNCTION public.conteudo_submissoes_validar() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.contribuicoes_config_touch() FROM PUBLIC, anon, authenticated;

-- ---------------------------------------------------------------------
-- 8. Nome do autor para a moderação (sem expor e-mail/dados pessoais)
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.autores_submissoes(p_ids UUID[])
RETURNS TABLE (id UUID, nome TEXT)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Acesso negado' USING ERRCODE = '42501';
    END IF;
    RETURN QUERY
    SELECT p.id, coalesce(nullif(btrim(concat_ws(' ', p.nome, p.sobrenome)), ''), p.email)::text
    FROM public.profiles p
    WHERE p.id = ANY (p_ids);
END;
$$;

REVOKE ALL ON FUNCTION public.autores_submissoes(UUID[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.autores_submissoes(UUID[]) TO authenticated;
