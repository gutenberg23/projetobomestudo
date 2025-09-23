-- Criar tabela para disciplinas verticalizadas
CREATE TABLE IF NOT EXISTS public.disciplinaverticalizada (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT,
  topicos TEXT[] DEFAULT '{}',
  links TEXT[] DEFAULT '{}',
  importancia INTEGER[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Criar tabela para curso verticalizado (edital)
CREATE TABLE IF NOT EXISTS public.cursoverticalizado (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  curso_id TEXT NOT NULL,
  disciplinas_ids TEXT[] DEFAULT '{}',
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Adicionar trigger para atualizar o campo updated_at automaticamente
CREATE TRIGGER update_disciplinaverticalizada_updated_at
BEFORE UPDATE ON public.disciplinaverticalizada
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cursoverticalizado_updated_at
BEFORE UPDATE ON public.cursoverticalizado
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Políticas de segurança RLS
ALTER TABLE public.disciplinaverticalizada ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cursoverticalizado ENABLE ROW LEVEL SECURITY;

-- Políticas para disciplinaverticalizada
CREATE POLICY "Todos podem ver disciplinas verticalizadas"
  ON public.disciplinaverticalizada FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Apenas admins podem inserir disciplinas verticalizadas"
  ON public.disciplinaverticalizada FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND admin = true
    )
  );

CREATE POLICY "Apenas admins podem atualizar disciplinas verticalizadas"
  ON public.disciplinaverticalizada FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND admin = true
    )
  );

CREATE POLICY "Apenas admins podem deletar disciplinas verticalizadas"
  ON public.disciplinaverticalizada FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND admin = true
    )
  );

-- Políticas para cursoverticalizado
CREATE POLICY "Todos podem ver cursos verticalizados"
  ON public.cursoverticalizado FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Apenas admins podem inserir cursos verticalizados"
  ON public.cursoverticalizado FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND admin = true
    )
  );

CREATE POLICY "Apenas admins podem atualizar cursos verticalizados"
  ON public.cursoverticalizado FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND admin = true
    )
  );

CREATE POLICY "Apenas admins podem deletar cursos verticalizados"
  ON public.cursoverticalizado FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND admin = true
    )
  );
