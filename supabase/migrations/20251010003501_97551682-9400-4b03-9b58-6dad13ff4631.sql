-- Habilitar RLS em tabelas que têm políticas mas RLS desabilitado

-- 1. blog_posts - tem política de deleção mas RLS desabilitado
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- 2. configuracoes_site - tem 4 políticas mas RLS desabilitado
ALTER TABLE public.configuracoes_site ENABLE ROW LEVEL SECURITY;

-- 3. simulados - tem política de atualização mas RLS desabilitado  
ALTER TABLE public.simulados ENABLE ROW LEVEL SECURITY;

-- 4. user_question_attempts - tem 4 políticas mas RLS desabilitado
ALTER TABLE public.user_question_attempts ENABLE ROW LEVEL SECURITY;

-- 5. user_simulado_results - tem 2 políticas mas RLS desabilitado
ALTER TABLE public.user_simulado_results ENABLE ROW LEVEL SECURITY;