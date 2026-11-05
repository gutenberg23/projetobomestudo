-- Aba "Estatísticas" de uma disciplina em /course/...
--
-- Conta, no banco, quantas questões de uma disciplina caem em cada assunto e
-- tópico, com filtros de banca, instituição e ano. Assim a página não precisa
-- baixar milhares de questões (o Supabase devolve no máximo 1.000 linhas por
-- consulta). As funções só devolvem contagens, nunca o conteúdo das questões,
-- por isso rodam como SECURITY DEFINER e funcionam também para quem não
-- está logado.
--
-- Colunas da tabela questoes usadas:
--   discipline   -> disciplina da questão
--   assuntos[]   -> Assunto (anel de dentro do gráfico)
--   topicos[]    -> Tópico (anel de fora)
--   institution  -> Banca
--   organization -> Instituição
--   year         -> Ano

create index if not exists questoes_discipline_idx on public.questoes (discipline);

-- Linhas devolvidas:
--   tipo 'total'       -> questões que passam nos filtros
--   tipo 'sem_assunto' -> dessas, quantas não têm assunto
--   tipo 'assunto'     -> questões por assunto
--   tipo 'topico'      -> questões por tópico
--   tipo 'par'         -> questões por (assunto, tópico); a página usa para saber
--                         em qual assunto cada tópico aparece mais
create or replace function public.estatisticas_assuntos(
  p_disciplina text,
  p_bancas text[] default null,
  p_instituicoes text[] default null,
  p_anos text[] default null
)
returns table (tipo text, assunto text, topico text, total bigint)
language sql
stable
security definer
set search_path = public
as $$
  with q as (
    select
      qq.id,
      coalesce(qq.assuntos, '{}'::text[]) as assuntos,
      coalesce(qq.topicos, '{}'::text[]) as topicos
    from public.questoes qq
    where qq.discipline = p_disciplina
      and (coalesce(cardinality(p_bancas), 0) = 0 or btrim(qq.institution) = any (p_bancas))
      and (coalesce(cardinality(p_instituicoes), 0) = 0 or btrim(qq.organization) = any (p_instituicoes))
      and (coalesce(cardinality(p_anos), 0) = 0 or btrim(qq.year::text) = any (p_anos))
  ),
  a as (
    select distinct q.id, btrim(x) as assunto
    from q, unnest(q.assuntos) as x
    where btrim(coalesce(x, '')) <> ''
  ),
  t as (
    select distinct q.id, btrim(x) as topico
    from q, unnest(q.topicos) as x
    where btrim(coalesce(x, '')) <> ''
  )
  select 'total'::text, null::text, null::text, count(*)::bigint from q
  union all
  select 'sem_assunto'::text, null::text, null::text, count(*)::bigint
    from q where not exists (select 1 from a where a.id = q.id)
  union all
  select 'assunto'::text, a.assunto, null::text, count(*)::bigint from a group by a.assunto
  union all
  select 'topico'::text, null::text, t.topico, count(*)::bigint from t group by t.topico
  union all
  select 'par'::text, a.assunto, t.topico, count(*)::bigint
    from a join t on t.id = a.id
    group by a.assunto, t.topico
$$;

-- Opções dos filtros (banca, instituição e ano) da disciplina, com contagem.
create or replace function public.opcoes_estatisticas_assuntos(p_disciplina text)
returns table (campo text, valor text, total bigint)
language sql
stable
security definer
set search_path = public
as $$
  select 'banca'::text, btrim(institution), count(*)::bigint
    from public.questoes
    where discipline = p_disciplina and btrim(coalesce(institution, '')) <> ''
    group by btrim(institution)
  union all
  select 'instituicao'::text, btrim(organization), count(*)::bigint
    from public.questoes
    where discipline = p_disciplina and btrim(coalesce(organization, '')) <> ''
    group by btrim(organization)
  union all
  select 'ano'::text, btrim(year::text), count(*)::bigint
    from public.questoes
    where discipline = p_disciplina and btrim(coalesce(year::text, '')) <> ''
    group by btrim(year::text)
$$;

grant execute on function public.estatisticas_assuntos(text, text[], text[], text[]) to anon, authenticated;
grant execute on function public.opcoes_estatisticas_assuntos(text) to anon, authenticated;
