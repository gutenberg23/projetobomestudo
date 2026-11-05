-- Disciplina das questões ligada a cada disciplina do site.
--
-- A disciplina do site (ex.: "Português para a PM") e a disciplina das
-- questões (questoes.discipline, ex.: "Língua Portuguesa") são cadastros
-- diferentes. Esta coluna diz qual disciplina das questões a aba
-- Estatísticas de /course/... deve usar. Vazia = a página tenta descobrir
-- sozinha pelas questões ligadas aos tópicos.
alter table public.disciplinas add column if not exists disciplina_questoes text;
