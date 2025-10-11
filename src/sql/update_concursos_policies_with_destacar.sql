-- Atualizar políticas da tabela de concursos para incluir o novo campo destacar

-- Remover políticas existentes
DROP POLICY IF EXISTS concursos_select_policy ON public.concursos;
DROP POLICY IF EXISTS concursos_insert_policy ON public.concursos;
DROP POLICY IF EXISTS concursos_update_policy ON public.concursos;
DROP POLICY IF EXISTS concursos_delete_policy ON public.concursos;

-- Política para permitir leitura pública (incluindo o campo destacar)
CREATE POLICY concursos_select_policy ON public.concursos
  FOR SELECT USING (true);

-- Política para permitir inserção para usuários autenticados com função admin, editor ou jornalista
CREATE POLICY concursos_insert_policy ON public.concursos
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND (
        nivel = 'admin' OR 
        role = 'admin' OR 
        role = 'editor' OR 
        role = 'jornalista'
      )
    )
  );

-- Política para permitir atualização para usuários autenticados com função admin, editor ou jornalista
CREATE POLICY concursos_update_policy ON public.concursos
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND (
        nivel = 'admin' OR 
        role = 'admin' OR 
        role = 'editor' OR 
        role = 'jornalista'
      )
    )
  );

-- Política para permitir exclusão apenas para usuários autenticados com função admin
CREATE POLICY concursos_delete_policy ON public.concursos
  FOR DELETE USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND (
        nivel = 'admin' OR
        role = 'admin'
      )
    )
  );