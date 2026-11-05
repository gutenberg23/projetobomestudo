-- Finalizar simulado sem erro de permissão (42501 em user_simulado_results).
--
-- Antes o navegador gravava acertos/erros direto na tabela, e a política de
-- segurança barrava a gravação. Agora a nota é calculada no banco pela
-- função finalizar_simulado, a partir das respostas do próprio aluno em
-- respostas_alunos e do gabarito em questoes. Assim ninguém consegue gravar
-- uma nota inventada, e o aluno não precisa de permissão de escrita na tabela.
--
-- O ranking (get_simulado_ranking) também passa a rodar com permissão do
-- banco, mas só devolve a lista quando o ranking do simulado é público ou
-- quando quem pede é administrador.
--
-- Pode ser executado mais de uma vez.

-- 1. Uma linha por aluno e simulado (necessário para atualizar a nota)
do $$
begin
  if not exists (
    select 1
    from pg_index i
    join pg_class t on t.oid = i.indrelid
    where t.relname = 'user_simulado_results'
      and t.relnamespace = 'public'::regnamespace
      and i.indisunique
      and (
        select array_agg(a.attname::text order by a.attname::text)
        from pg_attribute a
        where a.attrelid = t.oid and a.attnum = any(i.indkey)
      ) = array['simulado_id', 'user_id']
  ) then
    -- Mantém só o resultado mais recente de cada aluno antes de criar a regra
    delete from public.user_simulado_results r
    using public.user_simulado_results r2
    where r.user_id = r2.user_id
      and r.simulado_id = r2.simulado_id
      and r.ctid < r2.ctid;
    create unique index user_simulado_results_user_simulado_key
      on public.user_simulado_results (user_id, simulado_id);
  end if;
end $$;

-- 2. Políticas: o aluno lê e apaga os próprios resultados (gravar só pela função); administradores fazem tudo
alter table public.user_simulado_results enable row level security;

do $$
declare
  p record;
begin
  for p in select policyname from pg_policies where schemaname = 'public' and tablename = 'user_simulado_results' loop
    execute format('drop policy %I on public.user_simulado_results', p.policyname);
  end loop;
end $$;

create policy "Aluno vê os próprios resultados de simulado"
  on public.user_simulado_results for select
  to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- "Zerar estatísticas" no /dashboard apaga os resultados do próprio aluno
create policy "Aluno apaga os próprios resultados de simulado"
  on public.user_simulado_results for delete
  to authenticated
  using (user_id = auth.uid());

create policy "Admins gerenciam resultados de simulado"
  on public.user_simulado_results for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 3. Calcula e grava a nota do aluno logado
create or replace function public.finalizar_simulado(p_simulado_id uuid)
returns table (acertos integer, erros integer, total integer, respondidas integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_ids text[];
  v_total integer;
  v_acertos integer;
  v_respondidas integer;
begin
  if v_uid is null then
    raise exception 'Entre na sua conta para finalizar o simulado' using errcode = '42501';
  end if;

  select s.questoes_ids::text[] into v_ids from public.simulados s where s.id = p_simulado_id;
  if not found then
    raise exception 'Simulado não encontrado' using errcode = 'P0002';
  end if;
  v_ids := coalesce(v_ids, array[]::text[]);
  v_total := coalesce(array_length(v_ids, 1), 0);

  -- Última resposta do aluno em cada questão do simulado
  with ultimas as (
    select distinct on (r.questao_id::text) r.questao_id::text as qid, r.opcao_id::text as opcao
    from public.respostas_alunos r
    where r.aluno_id::text = v_uid::text
      and r.questao_id::text = any (v_ids)
    order by r.questao_id::text, r.created_at desc
  )
  select
    count(*)::integer,
    (count(*) filter (
      where exists (
        select 1
        from public.questoes q
        cross join lateral jsonb_array_elements(
          case when jsonb_typeof(q.options::jsonb) = 'array' then q.options::jsonb else '[]'::jsonb end
        ) o
        where q.id::text = u.qid
          and o ->> 'id' = u.opcao
          and lower(coalesce(o ->> 'isCorrect', 'false')) in ('true', '1')
      )
    ))::integer
  into v_respondidas, v_acertos
  from ultimas u;

  insert into public.user_simulado_results (user_id, simulado_id, acertos, erros, updated_at)
  values (v_uid, p_simulado_id, v_acertos, greatest(0, v_total - v_acertos), now())
  on conflict (user_id, simulado_id) do update
    set acertos = excluded.acertos,
        erros = excluded.erros,
        updated_at = now();

  return query select v_acertos, greatest(0, v_total - v_acertos), v_total, v_respondidas;
end;
$$;

revoke all on function public.finalizar_simulado(uuid) from public, anon;
grant execute on function public.finalizar_simulado(uuid) to authenticated;

-- 4. Ranking do simulado
drop function if exists public.get_simulado_ranking(uuid);
drop function if exists public.get_simulado_ranking(text);

create function public.get_simulado_ranking(p_simulado_id uuid)
returns table (
  ranking_position bigint,
  user_id uuid,
  nome text,
  acertos integer,
  erros integer,
  aproveitamento numeric,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    row_number() over (order by r.acertos desc, r.erros asc, coalesce(r.updated_at, r.created_at) asc) as ranking_position,
    r.user_id::uuid,
    coalesce(nullif(trim(p.nome_social), ''), nullif(trim(p.nome), ''), 'Aluno')::text as nome,
    r.acertos::integer,
    r.erros::integer,
    case when coalesce(r.acertos, 0) + coalesce(r.erros, 0) > 0
      then round(r.acertos * 100.0 / (r.acertos + r.erros), 1)
      else 0
    end as aproveitamento,
    coalesce(r.updated_at, r.created_at)::timestamptz as created_at
  from public.user_simulado_results r
  left join public.profiles p on p.id::text = r.user_id::text
  where r.simulado_id::text = p_simulado_id::text
    and (
      public.is_admin()
      or exists (select 1 from public.simulados s where s.id = p_simulado_id and coalesce(s.ranking_is_public, false))
    )
  order by ranking_position;
$$;

grant execute on function public.get_simulado_ranking(uuid) to authenticated, anon;
