-- Função para administradores excluírem cadernos
create or replace function admin_delete_caderno(caderno_id uuid)
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
  delete from questoes_caderno where caderno_id = $1;
  
  -- Excluir o caderno
  delete from cadernos_questoes where id = $1;
end;
$$;

-- Função para administradores duplicarem cadernos
create or replace function admin_duplicate_caderno(
  caderno_id uuid,
  novo_nome text,
  novo_user_id uuid,
  is_public boolean
)
returns uuid
language plpgsql
security definer
as $$
declare
  novo_caderno_id uuid;
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
  values (novo_nome, novo_user_id, is_public)
  returning id into novo_caderno_id;

  -- Copiar as questões do caderno original
  insert into questoes_caderno (caderno_id, questao_id)
  select novo_caderno_id, questao_id
  from questoes_caderno
  where caderno_id = $1;

  return novo_caderno_id;
end;
$$; 