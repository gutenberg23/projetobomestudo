-- Atualizar URL do RSS do PCI Concursos para o novo feed do PolitePol
UPDATE public.rss_configs 
SET url = 'https://politepol.com/fd/88t0mcUiNvfb.xml',
    updated_at = now()
WHERE name = 'PCI Concursos' 
   OR url LIKE '%rss.app%' 
   OR url LIKE '%HazoFE0VRZPei40O%';

-- Se não existir nenhuma configuração, inserir a nova
INSERT INTO public.rss_configs (name, url, active) 
SELECT 'PCI Concursos', 'https://politepol.com/fd/88t0mcUiNvfb.xml', true
WHERE NOT EXISTS (
    SELECT 1 FROM public.rss_configs 
    WHERE name = 'PCI Concursos' 
       OR url = 'https://politepol.com/fd/88t0mcUiNvfb.xml'
);