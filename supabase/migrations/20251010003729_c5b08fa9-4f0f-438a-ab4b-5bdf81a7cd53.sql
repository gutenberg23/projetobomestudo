-- Proteger tabela respostas_alunos com RLS

-- 1. Habilitar RLS na tabela respostas_alunos
ALTER TABLE public.respostas_alunos ENABLE ROW LEVEL SECURITY;

-- 2. Política de SELECT: Usuários veem apenas suas próprias respostas
CREATE POLICY "Estudantes veem próprias respostas"
ON public.respostas_alunos FOR SELECT
TO authenticated
USING (aluno_id = auth.uid());

-- 3. Política de SELECT: Admins podem ver todas as respostas
CREATE POLICY "Admins veem todas as respostas"
ON public.respostas_alunos FOR SELECT
TO authenticated
USING (public.is_admin());

-- 4. Política de INSERT: Usuários podem inserir apenas suas próprias respostas
CREATE POLICY "Estudantes inserem próprias respostas"
ON public.respostas_alunos FOR INSERT
TO authenticated
WITH CHECK (aluno_id = auth.uid());

-- 5. Política de DELETE: Usuários podem deletar apenas suas próprias respostas
CREATE POLICY "Estudantes deletam próprias respostas"
ON public.respostas_alunos FOR DELETE
TO authenticated
USING (aluno_id = auth.uid());

-- 6. Política de DELETE: Admins podem deletar qualquer resposta
CREATE POLICY "Admins deletam respostas"
ON public.respostas_alunos FOR DELETE
TO authenticated
USING (public.is_admin());

-- Nota: Não há política de UPDATE porque respostas não devem ser modificadas após inserção (integridade de dados)