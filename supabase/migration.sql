
-- Adicionar a função RPC para buscar cursos do usuário
CREATE OR REPLACE FUNCTION public.get_user_courses(user_id_param UUID)
RETURNS TABLE (course_id UUID, created_at TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT uce.course_id, uce.created_at
  FROM public.user_course_enrollments uce
  WHERE uce.user_id = user_id_param;
END;
$$;

-- Verificar se a tabela user_course_enrollments já existe
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_course_enrollments') THEN
    -- Criar tabela de matrículas do usuário em cursos
    CREATE TABLE public.user_course_enrollments (
      id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID NOT NULL,
      course_id UUID NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    -- Habilitar RLS
    ALTER TABLE public.user_course_enrollments ENABLE ROW LEVEL SECURITY;

    -- Criar políticas de segurança
    CREATE POLICY "Usuários podem ver suas próprias matrículas" 
    ON public.user_course_enrollments 
    FOR SELECT 
    USING (auth.uid() = user_id);

    -- Criar índices para melhorar performance
    CREATE INDEX idx_user_course_enrollments_user_id ON public.user_course_enrollments(user_id);
    CREATE INDEX idx_user_course_enrollments_course_id ON public.user_course_enrollments(course_id);
  END IF;
END
$$;
