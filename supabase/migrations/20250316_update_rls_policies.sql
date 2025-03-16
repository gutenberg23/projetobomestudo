-- Remover políticas existentes que restringem a inserção apenas para admins
DROP POLICY IF EXISTS "Allow admin insert" ON public.bancas;
DROP POLICY IF EXISTS "Allow admin update" ON public.bancas;
DROP POLICY IF EXISTS "Allow admin delete" ON public.bancas;

DROP POLICY IF EXISTS "Allow admin insert" ON public.instituicoes;
DROP POLICY IF EXISTS "Allow admin update" ON public.instituicoes;
DROP POLICY IF EXISTS "Allow admin delete" ON public.instituicoes;

DROP POLICY IF EXISTS "Allow admin insert" ON public.anos;
DROP POLICY IF EXISTS "Allow admin update" ON public.anos;
DROP POLICY IF EXISTS "Allow admin delete" ON public.anos;

DROP POLICY IF EXISTS "Allow admin insert" ON public.cargos;
DROP POLICY IF EXISTS "Allow admin update" ON public.cargos;
DROP POLICY IF EXISTS "Allow admin delete" ON public.cargos;

DROP POLICY IF EXISTS "Allow admin insert" ON public.disciplinas_questoes;
DROP POLICY IF EXISTS "Allow admin update" ON public.disciplinas_questoes;
DROP POLICY IF EXISTS "Allow admin delete" ON public.disciplinas_questoes;

DROP POLICY IF EXISTS "Allow admin insert" ON public.assuntos;
DROP POLICY IF EXISTS "Allow admin update" ON public.assuntos;
DROP POLICY IF EXISTS "Allow admin delete" ON public.assuntos;

DROP POLICY IF EXISTS "Allow admin insert" ON public.niveis;
DROP POLICY IF EXISTS "Allow admin update" ON public.niveis;
DROP POLICY IF EXISTS "Allow admin delete" ON public.niveis;

DROP POLICY IF EXISTS "Allow admin insert" ON public.dificuldades;
DROP POLICY IF EXISTS "Allow admin update" ON public.dificuldades;
DROP POLICY IF EXISTS "Allow admin delete" ON public.dificuldades;

DROP POLICY IF EXISTS "Allow admin insert" ON public.tipos_questao;
DROP POLICY IF EXISTS "Allow admin update" ON public.tipos_questao;
DROP POLICY IF EXISTS "Allow admin delete" ON public.tipos_questao;

-- Criar novas políticas que permitem que qualquer usuário possa modificar (sem restrição de autenticação)
CREATE POLICY "Allow all insert" ON public.bancas FOR INSERT TO authenticated USING (true);
CREATE POLICY "Allow all update" ON public.bancas FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow all delete" ON public.bancas FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow all insert" ON public.instituicoes FOR INSERT TO authenticated USING (true);
CREATE POLICY "Allow all update" ON public.instituicoes FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow all delete" ON public.instituicoes FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow all insert" ON public.anos FOR INSERT TO authenticated USING (true);
CREATE POLICY "Allow all update" ON public.anos FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow all delete" ON public.anos FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow all insert" ON public.cargos FOR INSERT TO authenticated USING (true);
CREATE POLICY "Allow all update" ON public.cargos FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow all delete" ON public.cargos FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow all insert" ON public.disciplinas_questoes FOR INSERT TO authenticated USING (true);
CREATE POLICY "Allow all update" ON public.disciplinas_questoes FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow all delete" ON public.disciplinas_questoes FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow all insert" ON public.assuntos FOR INSERT TO authenticated USING (true);
CREATE POLICY "Allow all update" ON public.assuntos FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow all delete" ON public.assuntos FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow all insert" ON public.niveis FOR INSERT TO authenticated USING (true);
CREATE POLICY "Allow all update" ON public.niveis FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow all delete" ON public.niveis FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow all insert" ON public.dificuldades FOR INSERT TO authenticated USING (true);
CREATE POLICY "Allow all update" ON public.dificuldades FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow all delete" ON public.dificuldades FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow all insert" ON public.tipos_questao FOR INSERT TO authenticated USING (true);
CREATE POLICY "Allow all update" ON public.tipos_questao FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow all delete" ON public.tipos_questao FOR DELETE TO authenticated USING (true);
