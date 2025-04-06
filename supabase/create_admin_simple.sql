-- Script SIMPLES sem loops ou variáveis complexas
-- Cria um usuário admin com senha fixa

-- 1. Criar o usuário na tabela auth.users
INSERT INTO auth.users (
  id, 
  email, 
  encrypted_password, 
  email_confirmed_at, 
  created_at, 
  updated_at, 
  aud, 
  role
) VALUES (
  'a0000000-0000-0000-0000-000000000000',  -- ID fixo para facilitar referência
  'admin@bomestudo.com.br', 
  crypt('Admin@123', gen_salt('bf')), 
  now(), 
  now(), 
  now(), 
  'authenticated', 
  'authenticated'
) 
ON CONFLICT (email) DO 
  UPDATE SET 
    encrypted_password = crypt('Admin@123', gen_salt('bf')),
    updated_at = now(),
    email_confirmed_at = now();

-- 2. Criar ou atualizar perfil na tabela profiles
INSERT INTO public.profiles (
  id, 
  email, 
  nome, 
  nivel,
  created_at, 
  updated_at
) VALUES (
  'a0000000-0000-0000-0000-000000000000',  -- Mesmo ID do usuário criado acima
  'admin@bomestudo.com.br', 
  'Administrador', 
  'admin',
  now(), 
  now()
)
ON CONFLICT (id) DO 
  UPDATE SET 
    email = 'admin@bomestudo.com.br',
    nome = 'Administrador',
    nivel = 'admin',
    updated_at = now();

-- 3. Mostrar mensagem de confirmação
SELECT 'Usuário admin criado ou atualizado com sucesso. Login: admin@bomestudo.com.br / Senha: Admin@123'; 