-- Criar tabela para leis secas
CREATE TABLE public.leis_secas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  palavras_treino JSONB NOT NULL DEFAULT '[]'::jsonb,
  curso_id UUID NOT NULL,
  ativo BOOLEAN DEFAULT true,
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.leis_secas ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Leitura pública de leis secas"
ON public.leis_secas
FOR SELECT
TO public
USING (ativo = true);

CREATE POLICY "Admins gerenciam leis secas"
ON public.leis_secas
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Trigger para atualizar updated_at
CREATE TRIGGER update_leis_secas_updated_at
  BEFORE UPDATE ON public.leis_secas
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();