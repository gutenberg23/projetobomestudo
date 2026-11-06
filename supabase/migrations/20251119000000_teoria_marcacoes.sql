-- Grifos e notas do aluno nas teorias, salvos na conta (antes ficavam só no navegador).
-- Uma linha por aluno e teoria; "marcacoes" guarda a lista de grifos em JSON:
-- [{ "id": "...", "texto": "...", "cor": "#FFF3A3", "nota": "...", "criadaEm": "..." }]
-- Cada aluno só lê e altera os próprios grifos.

CREATE TABLE IF NOT EXISTS public.teoria_marcacoes (
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  teoria_id uuid NOT NULL REFERENCES public.teorias(id) ON DELETE CASCADE,
  marcacoes jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, teoria_id),
  CONSTRAINT teoria_marcacoes_lista CHECK (jsonb_typeof(marcacoes) = 'array')
);

ALTER TABLE public.teoria_marcacoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Aluno lê os próprios grifos" ON public.teoria_marcacoes;
CREATE POLICY "Aluno lê os próprios grifos" ON public.teoria_marcacoes
  FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Aluno cria os próprios grifos" ON public.teoria_marcacoes;
CREATE POLICY "Aluno cria os próprios grifos" ON public.teoria_marcacoes
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Aluno altera os próprios grifos" ON public.teoria_marcacoes;
CREATE POLICY "Aluno altera os próprios grifos" ON public.teoria_marcacoes
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Aluno apaga os próprios grifos" ON public.teoria_marcacoes;
CREATE POLICY "Aluno apaga os próprios grifos" ON public.teoria_marcacoes
  FOR DELETE TO authenticated USING (user_id = auth.uid());

GRANT SELECT, INSERT, UPDATE, DELETE ON public.teoria_marcacoes TO authenticated;
