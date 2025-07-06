-- Criar tabela para configurações de RSS
CREATE TABLE IF NOT EXISTS public.rss_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  last_sync TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Adicionar trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_rss_configs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_rss_configs_updated_at
BEFORE UPDATE ON public.rss_configs
FOR EACH ROW
EXECUTE FUNCTION update_rss_configs_updated_at();

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.rss_configs ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários autenticados leiam as configurações
CREATE POLICY "Allow authenticated users to read RSS configs" ON public.rss_configs
  FOR SELECT USING (auth.role() = 'authenticated');

-- Política para permitir que apenas administradores criem configurações
CREATE POLICY "Allow admins to create RSS configs" ON public.rss_configs
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Política para permitir que apenas administradores atualizem configurações
CREATE POLICY "Allow admins to update RSS configs" ON public.rss_configs
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Política para permitir que apenas administradores deletem configurações
CREATE POLICY "Allow admins to delete RSS configs" ON public.rss_configs
  FOR DELETE USING (
    auth.role() = 'authenticated' AND 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Inserir configuração padrão para o RSS fornecido
INSERT INTO public.rss_configs (name, url, active) 
VALUES ('PCI Concursos', 'https://rss.app/feeds/HazoFE0VRZPei40O.xml', true)
ON CONFLICT DO NOTHING;