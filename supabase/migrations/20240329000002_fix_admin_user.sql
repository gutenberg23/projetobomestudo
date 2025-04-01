-- Primeiro, remover o admin anterior (se existir)
update public.profiles
set is_admin = false
where id = '4ff53e38-fe42-4817-a841-2f5ad38f5c57';

-- Agora você precisa executar este comando substituindo o UUID pelo ID que apareceu no console
-- Por exemplo, se o ID no console for '123e4567-e89b-12d3-a456-426614174000':
-- update public.profiles
-- set is_admin = true
-- where id = '123e4567-e89b-12d3-a456-426614174000';

-- Você pode descomentar e editar a linha acima com seu ID 