-- Função para administradores buscarem detalhes de um caderno
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
    select 1 from profiles 
    where id = auth.uid() 
    and is_admin = true
  );
$$;

-- Conceder permissão para usuários autenticados executarem a função
grant execute on function public.admin_get_caderno(uuid) to authenticated; 