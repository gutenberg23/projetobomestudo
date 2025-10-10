-- FASE 2: HABILITAR RLS EM TODAS AS TABELAS PÚBLICAS RESTANTES

-- ===== TABELAS DE CONTEÚDO PÚBLICO (leitura pública, modificação por staff) =====

-- Aulas
ALTER TABLE public.aulas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leitura pública de aulas"
ON public.aulas FOR SELECT
TO public
USING (true);

CREATE POLICY "Staff gerencia aulas"
ON public.aulas FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'professor'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'professor'));

-- Cursos
ALTER TABLE public.cursos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leitura pública de cursos"
ON public.cursos FOR SELECT
TO public
USING (true);

CREATE POLICY "Admins gerenciam cursos"
ON public.cursos FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Disciplinas
ALTER TABLE public.disciplinas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leitura pública de disciplinas"
ON public.disciplinas FOR SELECT
TO public
USING (true);

CREATE POLICY "Staff gerencia disciplinas"
ON public.disciplinas FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'professor'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'professor'));

-- Disciplinas_questoes
ALTER TABLE public.disciplinas_questoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leitura pública de disciplinas_questoes"
ON public.disciplinas_questoes FOR SELECT
TO public
USING (true);

CREATE POLICY "Staff gerencia disciplinas_questoes"
ON public.disciplinas_questoes FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'professor'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'professor'));

-- Niveis
ALTER TABLE public.niveis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leitura pública de níveis"
ON public.niveis FOR SELECT
TO public
USING (true);

CREATE POLICY "Admins gerenciam níveis"
ON public.niveis FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Questoes
ALTER TABLE public.questoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leitura pública de questões"
ON public.questoes FOR SELECT
TO public
USING (true);

CREATE POLICY "Staff gerencia questões"
ON public.questoes FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'professor'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'professor'));

-- Cursoverticalizado
ALTER TABLE public.cursoverticalizado ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leitura pública de cursoverticalizado"
ON public.cursoverticalizado FOR SELECT
TO public
USING (true);

CREATE POLICY "Admins gerenciam cursoverticalizado"
ON public.cursoverticalizado FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Disciplinaverticalizada
ALTER TABLE public.disciplinaverticalizada ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leitura pública de disciplinaverticalizada"
ON public.disciplinaverticalizada FOR SELECT
TO public
USING (true);

CREATE POLICY "Admins gerenciam disciplinaverticalizada"
ON public.disciplinaverticalizada FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ===== TABELAS DE DADOS ESPECÍFICOS DO USUÁRIO =====

-- Cadernos_questoes
ALTER TABLE public.cadernos_questoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários veem próprios cadernos e públicos"
ON public.cadernos_questoes FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR is_public = true OR public.is_admin());

CREATE POLICY "Usuários criam próprios cadernos"
ON public.cadernos_questoes FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Usuários atualizam próprios cadernos"
ON public.cadernos_questoes FOR UPDATE
TO authenticated
USING (user_id = auth.uid() OR public.is_admin())
WITH CHECK (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Usuários deletam próprios cadernos"
ON public.cadernos_questoes FOR DELETE
TO authenticated
USING (user_id = auth.uid() OR public.is_admin());

-- Questoes_caderno
ALTER TABLE public.questoes_caderno ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários gerenciam questões dos próprios cadernos"
ON public.questoes_caderno FOR ALL
TO authenticated
USING (user_id = auth.uid() OR public.is_admin())
WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- User_course_progress
ALTER TABLE public.user_course_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários veem próprio progresso"
ON public.user_course_progress FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Usuários gerenciam próprio progresso"
ON public.user_course_progress FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- User_course_enrollments
ALTER TABLE public.user_course_enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários veem próprias matrículas"
ON public.user_course_enrollments FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Usuários gerenciam próprias matrículas"
ON public.user_course_enrollments FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Edital_verticalizado_data
ALTER TABLE public.edital_verticalizado_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários gerenciam próprios dados de edital"
ON public.edital_verticalizado_data FOR ALL
TO authenticated
USING (user_id = auth.uid() OR public.is_admin())
WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- ===== TABELAS DE BLOG E COMENTÁRIOS =====

-- Blog_comments
ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leitura pública de comentários"
ON public.blog_comments FOR SELECT
TO public
USING (true);

CREATE POLICY "Usuários autenticados comentam"
ON public.blog_comments FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Usuários editam próprios comentários"
ON public.blog_comments FOR UPDATE
TO authenticated
USING (user_id = auth.uid() OR public.is_admin())
WITH CHECK (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Usuários deletam próprios comentários"
ON public.blog_comments FOR DELETE
TO authenticated
USING (user_id = auth.uid() OR public.is_admin());

-- ===== TABELAS DE INTERAÇÃO COM QUESTÕES =====

-- Likes_gabaritos
ALTER TABLE public.likes_gabaritos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leitura pública de likes gabaritos"
ON public.likes_gabaritos FOR SELECT
TO public
USING (true);

CREATE POLICY "Usuários dão likes gabaritos"
ON public.likes_gabaritos FOR INSERT
TO authenticated
WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "Usuários removem próprios likes gabaritos"
ON public.likes_gabaritos FOR DELETE
TO authenticated
USING (usuario_id = auth.uid());

-- Questoes_erros_reportados
ALTER TABLE public.questoes_erros_reportados ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários veem próprios erros reportados"
ON public.questoes_erros_reportados FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Usuários reportam erros"
ON public.questoes_erros_reportados FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins gerenciam erros reportados"
ON public.questoes_erros_reportados FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ===== TABELAS ADMINISTRATIVAS =====

-- Professores
ALTER TABLE public.professores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leitura pública de dados básicos de professores"
ON public.professores FOR SELECT
TO public
USING (true);

CREATE POLICY "Admins gerenciam professores"
ON public.professores FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Question_stats_clearing_log
ALTER TABLE public.question_stats_clearing_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins gerenciam logs de limpeza"
ON public.question_stats_clearing_log FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ===== TABELAS DE NOTAS =====

-- Notas_usuarios
ALTER TABLE public.notas_usuarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários veem próprias notas"
ON public.notas_usuarios FOR SELECT
TO authenticated
USING (usuario_id = auth.uid() OR public.is_admin());

CREATE POLICY "Admins gerenciam notas de usuários"
ON public.notas_usuarios FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Notas_professores
ALTER TABLE public.notas_professores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professores veem próprias notas"
ON public.notas_professores FOR SELECT
TO authenticated
USING (professor_id = auth.uid() OR public.is_admin());

CREATE POLICY "Admins gerenciam notas de professores"
ON public.notas_professores FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ===== TABELAS DE SISTEMA =====

-- Files (sistema de arquivos genérico - restrito a autenticados)
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários autenticados gerenciam arquivos"
ON public.files FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Kanban (sistema kanban - restrito a admins)
ALTER TABLE public.kanban_columns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins gerenciam kanban_columns"
ON public.kanban_columns FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

ALTER TABLE public.kanban_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins gerenciam kanban_items"
ON public.kanban_items FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());