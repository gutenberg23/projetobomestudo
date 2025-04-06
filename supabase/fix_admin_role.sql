-- Atualizar o usuário administrador
UPDATE public.profiles
SET 
  nivel = 'admin',
  role = 'admin',
  nome = 'Equipe BomEstudo',
  status = 'ativo',
  updated_at = CURRENT_TIMESTAMP
WHERE email = 'gutenberg23@gmail.com';

-- Garantir que a atualização seja refletida na tabela perfil
UPDATE public.perfil
SET 
  nivel = 'admin',
  role = 'admin',
  nome = 'Equipe BomEstudo',
  status = 'ativo',
  updated_at = CURRENT_TIMESTAMP
WHERE email = 'gutenberg23@gmail.com'; 