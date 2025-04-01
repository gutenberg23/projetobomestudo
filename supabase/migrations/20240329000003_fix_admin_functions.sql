-- Primeiro, definir seu usuário como administrador
update public.profiles
set is_admin = true
where id = '631c9cc4-eb93-4537-a691-01577384a201';

-- Remover as funções antigas
drop function if exists public.admin_delete_caderno(uuid);
drop function if exists public.admin_duplicate_caderno(uuid, text, uuid, boolean);

-- Corrigir a função de exclusão
create or replace function public.admin_delete_caderno(p_caderno_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  -- Verificar se o usuário é administrador
  if not exists (
    select 1 from profiles 
    where id = auth.uid() 
    and is_admin = true
  ) then
    raise exception 'Apenas administradores podem executar esta função';
  end if;

  -- Excluir as questões do caderno
  delete from questoes_caderno
  where caderno_id = p_caderno_id;
  
  -- Excluir o caderno
  delete from cadernos_questoes
  where id = p_caderno_id;
end;
$$;

-- Corrigir a função de duplicação
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
  insert into questoes_caderno (caderno_id, questao_id)
  select v_novo_caderno_id, questao_id
  from questoes_caderno
  where caderno_id = p_caderno_id;

  return v_novo_caderno_id;
end;
$$;

-- Conceder permissões para executar as funções
grant execute on function public.admin_delete_caderno(uuid) to authenticated;
grant execute on function public.admin_duplicate_caderno(uuid, text, uuid, boolean) to authenticated; 