-- Corrigir a função admin_get_caderno
drop function if exists public.admin_get_caderno(uuid);

create or replace function public.admin_get_caderno(p_caderno_id uuid)
returns table (
  id uuid,
  nome text,
  created_at timestamptz,
  user_id uuid,
  is_public boolean,
  total_questions bigint,
  answered_questions bigint,
  correct_answers bigint,
  wrong_answers bigint,
  user_email text
)
language sql
security definer
as $$
  select 
    cq.id,
    cq.nome,
    cq.created_at,
    cq.user_id,
    cq.is_public,
    coalesce(cq.total_questions, 0) as total_questions,
    coalesce(cq.answered_questions, 0) as answered_questions,
    coalesce(cq.correct_answers, 0) as correct_answers,
    coalesce(cq.wrong_answers, 0) as wrong_answers,
    u.email as user_email
  from cadernos_questoes cq
  left join auth.users u on u.id = cq.user_id
  where cq.id = p_caderno_id
  and exists (
    select 1 from public.profiles p
    where p.id = auth.uid() 
    and p.nivel = 'admin'
  );
$$;

-- Corrigir a função admin_update_caderno
drop function if exists public.admin_update_caderno(uuid, text, boolean);

create or replace function public.admin_update_caderno(
  p_caderno_id uuid,
  p_nome text,
  p_is_public boolean
)
returns void
language plpgsql
security definer
as $$
begin
  -- Verificar se o usuário é administrador usando a coluna nivel
  if not exists (
    select 1 from public.profiles p
    where p.id = auth.uid() 
    and p.nivel = 'admin'
  ) then
    raise exception 'Apenas administradores podem executar esta função';
  end if;

  -- Atualizar o caderno
  update cadernos_questoes
  set 
    nome = p_nome,
    is_public = p_is_public,
    updated_at = now()
  where id = p_caderno_id;
end;
$$;

-- Conceder permissões para usuários autenticados executarem as funções
grant execute on function public.admin_get_caderno(uuid) to authenticated;
grant execute on function public.admin_update_caderno(uuid, text, boolean) to authenticated; 