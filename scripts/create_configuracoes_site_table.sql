-- Script para criar a tabela configuracoes_site no Supabase
-- Execute este script no painel SQL do Supabase

-- Criação da tabela configuracoes_site
CREATE TABLE IF NOT EXISTS public.configuracoes_site (
    id SERIAL PRIMARY KEY,
    chave TEXT NOT NULL UNIQUE,
    valor TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comentários na tabela e colunas (documentação)
COMMENT ON TABLE public.configuracoes_site IS 'Tabela para armazenar configurações do site no formato chave-valor';
COMMENT ON COLUMN public.configuracoes_site.chave IS 'Identificador único da configuração (ex: tabs_course, pages_visibility, visual_config, etc)';
COMMENT ON COLUMN public.configuracoes_site.valor IS 'Valor da configuração em formato JSON';

-- Adicionar políticas RLS para controle de acesso
-- As políticas permitem que apenas usuários autenticados com role 'admin' possam modificar as configurações
-- Todos os usuários podem visualizar as configurações

-- Habilitar Row Level Security
ALTER TABLE public.configuracoes_site ENABLE ROW LEVEL SECURITY;

-- Política para visualização
CREATE POLICY "Todos podem visualizar configurações" ON public.configuracoes_site
    FOR SELECT USING (true);

-- Política para inserção, atualização e exclusão (apenas admins)
CREATE POLICY "Apenas admins podem inserir configurações" ON public.configuracoes_site
    FOR INSERT WITH CHECK (auth.role() = 'admin');

CREATE POLICY "Apenas admins podem atualizar configurações" ON public.configuracoes_site
    FOR UPDATE USING (auth.role() = 'admin');

CREATE POLICY "Apenas admins podem excluir configurações" ON public.configuracoes_site
    FOR DELETE USING (auth.role() = 'admin');

-- Inserir configurações iniciais padrão
INSERT INTO public.configuracoes_site (chave, valor) 
VALUES 
('tabs_course', '{"showDisciplinasTab":true,"showEditalTab":true,"showSimuladosTab":true}'),
('pages_visibility', '{"showBlogPage":true,"showQuestionsPage":true,"showExplorePage":true,"showMyCoursesPage":true}'),
('visual_config', '{"primaryColor":"#5f2ebe","secondaryColor":"#272f3c","accentColor":"#f97316","logoUrl":"/lovable-uploads/logo.svg","faviconUrl":"/favicon.ico","fontFamily":"Inter, sans-serif","buttonStyle":"rounded","darkMode":false}'),
('general_config', '{"siteName":"BomEstudo","contactEmail":"contato@bomestudo.com.br","supportEmail":"suporte@bomestudo.com.br","whatsappNumber":"5511999999999","footerText":"© BomEstudo. Todos os direitos reservados.","enableRegistration":true,"enableComments":true,"maintenanceMode":false}'),
('seo_config', '{"siteTitle":"BomEstudo - Plataforma de estudos para concursos","siteDescription":"Plataforma de estudos online para candidatos de concursos públicos com cursos, questões comentadas e estatísticas de desempenho.","siteKeywords":["concursos","estudos","questões","cursos","preparatório"],"ogImageUrl":"/images/og-image.jpg","twitterHandle":"@bomestudo","googleAnalyticsId":"","enableIndexing":true,"structuredData":true}')
ON CONFLICT (chave) DO UPDATE 
SET valor = EXCLUDED.valor;

-- Criar function para atualizar o campo updated_at automaticamente
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar o campo updated_at
CREATE TRIGGER update_configuracoes_modified
BEFORE UPDATE ON public.configuracoes_site
FOR EACH ROW
EXECUTE FUNCTION update_modified_column(); 