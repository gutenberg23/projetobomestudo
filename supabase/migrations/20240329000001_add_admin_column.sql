-- Adicionar coluna is_admin na tabela profiles
alter table public.profiles 
add column if not exists is_admin boolean not null default false;

-- Criar política para permitir que apenas administradores atualizem a coluna is_admin
create policy "Apenas administradores podem atualizar is_admin"
on public.profiles
for update using (
  auth.uid() in (
    select id from public.profiles where is_admin = true
  )
)
with check (
  auth.uid() in (
    select id from public.profiles where is_admin = true
  )
);

-- Atualizar as funções administrativas para usar a nova coluna
create or replace function public.admin_delete_caderno(caderno_id uuid)
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
create or replace function public.admin_duplicate_caderno(
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

-- Conceder permissões para executar as funções
grant execute on function public.admin_delete_caderno(uuid) to authenticated;
grant execute on function public.admin_duplicate_caderno(uuid, text, uuid, boolean) to authenticated;

-- Definir o primeiro usuário como administrador (substitua o UUID pelo seu ID de usuário)
update public.profiles
set is_admin = true
where id = '4ff53e38-fe42-4817-a841-2f5ad38f5c57'; 