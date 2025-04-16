-- Criação da tabela de ciclos de estudo
CREATE TABLE IF NOT EXISTS public.ciclos_estudo (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  curso_id UUID,
  disciplinas JSONB NOT NULL DEFAULT '[]',
  total_horas INTEGER NOT NULL DEFAULT 40,
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ultima_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Índices para otimizar consultas
  CONSTRAINT fk_curso FOREIGN KEY (curso_id) REFERENCES public.cursos(id) ON DELETE CASCADE
);

-- Criar índices para melhorar o desempenho
CREATE INDEX IF NOT EXISTS idx_ciclos_estudo_user_id ON public.ciclos_estudo(user_id);
CREATE INDEX IF NOT EXISTS idx_ciclos_estudo_curso_id ON public.ciclos_estudo(curso_id);

-- Comentários para documentação da tabela
COMMENT ON TABLE public.ciclos_estudo IS 'Armazena os ciclos de estudo personalizados para cada usuário e curso';
COMMENT ON COLUMN public.ciclos_estudo.disciplinas IS 'Array de objetos JSON contendo as configurações de cada disciplina: id, ativo, horasDedicadas, cor';
COMMENT ON COLUMN public.ciclos_estudo.total_horas IS 'Total de horas semanais definidas para o ciclo de estudos';

-- Configurar políticas de segurança RLS (Row Level Security)
ALTER TABLE public.ciclos_estudo ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários vejam apenas seus próprios ciclos
CREATE POLICY select_own_ciclos ON public.ciclos_estudo
  FOR SELECT USING (auth.uid() = user_id);

-- Política para permitir que usuários insiram seus próprios ciclos
CREATE POLICY insert_own_ciclos ON public.ciclos_estudo
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para permitir que usuários atualizem apenas seus próprios ciclos
CREATE POLICY update_own_ciclos ON public.ciclos_estudo
  FOR UPDATE USING (auth.uid() = user_id);

-- Política para permitir que usuários excluam apenas seus próprios ciclos
CREATE POLICY delete_own_ciclos ON public.ciclos_estudo
  FOR DELETE USING (auth.uid() = user_id);

-- Função para atualizar o timestamp de última atualização
CREATE OR REPLACE FUNCTION update_ciclo_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.ultima_atualizacao = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar o timestamp automaticamente
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON public.ciclos_estudo
FOR EACH ROW
EXECUTE FUNCTION update_ciclo_timestamp(); 