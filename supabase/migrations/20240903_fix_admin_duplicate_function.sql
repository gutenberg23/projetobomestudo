-- Remover a função existente
drop function if exists public.admin_duplicate_caderno(uuid, text, uuid, boolean);

-- Recriar a função com a verificação correta de administrador
create or replace function public.admin_duplicate_caderno(
  p_caderno_id uuid,
  p_novo_nome text,
  p_novo_user_id uuid,
  p_is_public boolean
)
returns uuid
language plpgsql
security definer
as $$
declare
  v_novo_caderno_id uuid;
begin
  -- Verificar se o usuário é administrador usando a coluna nivel
  if not exists (
    select 1 from public.profiles p
    where p.id = auth.uid() 
    and p.nivel = 'admin'
  ) then
    raise exception 'Apenas administradores podem executar esta função';
  end if;

  -- Criar o novo caderno
  insert into cadernos_questoes (nome, user_id, is_public)
  values (p_novo_nome, p_novo_user_id, p_is_public)
  returning id into v_novo_caderno_id;

  -- Copiar as questões do caderno original
  insert into questoes_caderno (caderno_id, questao_id, user_id)
  select 
    v_novo_caderno_id, 
    questao_id,
    p_novo_user_id
  from questoes_caderno
  where caderno_id = p_caderno_id;

  -- Atualizar o contador de questões
  update cadernos_questoes
  set total_questions = (
    select count(*) 
    from questoes_caderno 
    where caderno_id = v_novo_caderno_id
  )
  where id = v_novo_caderno_id;

  return v_novo_caderno_id;
end;
$$;

-- Conceder permissão para usuários autenticados executarem a função
grant execute on function public.admin_duplicate_caderno(uuid, text, uuid, boolean) to authenticated; 