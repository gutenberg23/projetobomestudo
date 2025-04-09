-- Atualizar o usuário administrador
UPDATE public.profiles
SET 
  nivel = 'admin',
  role = 'admin',
  nome = 'Equipe BomEstudo',
  status = 'ativo',
  updated_at = CURRENT_TIMESTAMP
WHERE email = 'gutenberg23@gmail.com'; 