-- Videoaulas da teoria que abrem em outra guia (no YouTube) em vez de
-- aparecer incorporadas na página, como já é possível nos tópicos dos cursos.
-- Guarda os links (os mesmos de videoaulas) marcados pelo admin.
ALTER TABLE public.teorias
  ADD COLUMN IF NOT EXISTS videoaulas_nova_guia text[] NOT NULL DEFAULT '{}';

COMMENT ON COLUMN public.teorias.videoaulas_nova_guia IS
  'Links de videoaulas que abrem em nova guia em vez de incorporados na teoria.';
