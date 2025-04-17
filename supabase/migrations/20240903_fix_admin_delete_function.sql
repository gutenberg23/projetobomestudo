-- Remover a função existente
drop function if exists public.admin_delete_caderno(uuid);

-- Recriar a função com a verificação correta de administrador
create or replace function public.admin_delete_caderno(p_caderno_id uuid)
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

  -- Excluir as questões do caderno
  delete from questoes_caderno
  where caderno_id = p_caderno_id;
  
  -- Excluir o caderno
  delete from cadernos_questoes
  where id = p_caderno_id;
end;
$$;

-- Conceder permissão para usuários autenticados executarem a função
grant execute on function public.admin_delete_caderno(uuid) to authenticated; 