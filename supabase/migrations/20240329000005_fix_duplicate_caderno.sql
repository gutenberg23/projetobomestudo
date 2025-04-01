-- Remover a função antiga
drop function if exists public.admin_duplicate_caderno(uuid, text, uuid, boolean);

-- Função para administradores duplicarem cadernos
create function public.admin_duplicate_caderno(
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
  -- Verificar se o usuário é administrador
  if not exists (
    select 1 from profiles 
    where id = auth.uid() 
    and is_admin = true
  ) then
    raise exception 'Apenas administradores podem executar esta função';
  end if;

  -- Criar o novo caderno
  insert into cadernos_questoes (nome, user_id, is_public)
  values (p_novo_nome, p_novo_user_id, p_is_public)
  returning id into v_novo_caderno_id;

  -- Copiar as questões do caderno original
  insert into questoes_caderno (caderno_id, questao_id, user_id)
  select v_novo_caderno_id, qc.questao_id, p_novo_user_id
  from questoes_caderno qc
  where qc.caderno_id = p_caderno_id;

  return v_novo_caderno_id;
end;
$$;

-- Conceder permissão para usuários autenticados executarem a função
grant execute on function public.admin_duplicate_caderno(uuid, text, uuid, boolean) to authenticated; 