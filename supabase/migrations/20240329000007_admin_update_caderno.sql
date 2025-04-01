-- Função para administradores atualizarem cadernos
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
  -- Verificar se o usuário é administrador
  if not exists (
    select 1 from profiles 
    where id = auth.uid() 
    and is_admin = true
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

-- Conceder permissão para usuários autenticados executarem a função
grant execute on function public.admin_update_caderno(uuid, text, boolean) to authenticated; 