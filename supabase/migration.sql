
-- Criar tabela para armazenar metas de desempenho e datas de exame
CREATE TABLE IF NOT EXISTS public.user_exam_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  course_id TEXT NOT NULL,
  performance_goal INTEGER,
  exam_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Função para atualizar o campo updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Adicionar trigger para atualizar o campo updated_at
CREATE TRIGGER update_user_exam_goals_updated_at
BEFORE UPDATE ON public.user_exam_goals
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Criar tabela para armazenar os dados de progresso por disciplina
CREATE TABLE IF NOT EXISTS public.user_subject_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  course_id TEXT NOT NULL,
  subject_name TEXT NOT NULL, -- Nome da disciplina
  line_numbers INTEGER[] DEFAULT '{}', -- Lista de números de linha
  completed BOOLEAN[] DEFAULT '{}', -- Lista de status de conclusão
  topics TEXT[] DEFAULT '{}', -- Lista de tópicos
  importance INTEGER[] DEFAULT '{}', -- Lista de importâncias
  difficulty TEXT[] DEFAULT '{}', -- Lista de dificuldades
  total_exercises INTEGER[] DEFAULT '{}', -- Lista de total de exercícios
  correct_answers INTEGER[] DEFAULT '{}', -- Lista de acertos
  reviewed BOOLEAN[] DEFAULT '{}', -- Lista de status de revisão
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Adicionar trigger para atualizar o campo updated_at
CREATE TRIGGER update_user_subject_progress_updated_at
BEFORE UPDATE ON public.user_subject_progress
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Adicionar políticas de segurança baseadas em linha (RLS)
ALTER TABLE public.user_subject_progress ENABLE ROW LEVEL SECURITY;

-- Políticas para garantir que usuários só possam ver e modificar seus próprios dados
CREATE POLICY "Users can view their own progress" 
ON public.user_subject_progress 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress" 
ON public.user_subject_progress 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" 
ON public.user_subject_progress 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own progress" 
ON public.user_subject_progress 
FOR DELETE 
USING (auth.uid() = user_id);

-- Aplique as mesmas políticas RLS à tabela user_exam_goals
ALTER TABLE public.user_exam_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own exam goals" 
ON public.user_exam_goals 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own exam goals" 
ON public.user_exam_goals 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own exam goals" 
ON public.user_exam_goals 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own exam goals" 
ON public.user_exam_goals 
FOR DELETE 
USING (auth.uid() = user_id);

-- Índices para melhorar performance de consultas
CREATE INDEX idx_user_subject_progress_user_id ON public.user_subject_progress(user_id);
CREATE INDEX idx_user_subject_progress_course_id ON public.user_subject_progress(course_id);
CREATE INDEX idx_user_subject_progress_user_course ON public.user_subject_progress(user_id, course_id);
CREATE INDEX idx_user_exam_goals_user_id ON public.user_exam_goals(user_id);
CREATE INDEX idx_user_exam_goals_course_id ON public.user_exam_goals(course_id);
CREATE INDEX idx_user_exam_goals_user_course ON public.user_exam_goals(user_id, course_id);
