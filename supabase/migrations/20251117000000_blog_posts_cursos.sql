-- Cursos vinculados a um post do blog.
-- No fim do post aparece um bloco "Estude grátis" com um botão por cargo
-- (o cargo vem do campo "Cargo" do curso, coluna cursos.descricao).
-- A ordem do array é a ordem dos botões.
ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS cursos_ids uuid[] NOT NULL DEFAULT '{}';

COMMENT ON COLUMN public.blog_posts.cursos_ids IS
  'Cursos (cargos) divulgados no fim do post, na ordem dos botões.';
