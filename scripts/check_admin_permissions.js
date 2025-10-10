// Script para verificar permissões de administrador
// Este script deve ser executado no ambiente do Supabase

const { createClient } = require('@supabase/supabase-js');

// Substitua pelas suas credenciais do Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role key para acesso total

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUserPermissions(userId) {
  console.log('Verificando permissões para usuário:', userId);
  
  // Verificar perfil do usuário
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (profileError) {
    console.error('Erro ao buscar perfil:', profileError);
    return;
  }
  
  console.log('Perfil do usuário:', profile);
  
  // Verificar roles do usuário
  const { data: roles, error: rolesError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId);
  
  if (rolesError) {
    console.error('Erro ao buscar roles:', rolesError);
    return;
  }
  
  console.log('Roles do usuário:', roles);
  
  // Verificar se é admin usando a função do banco
  const { data: isAdmin, error: isAdminError } = await supabase
    .rpc('is_admin');
  
  if (isAdminError) {
    console.error('Erro ao verificar se é admin:', isAdminError);
    return;
  }
  
  console.log('Função is_admin retorna:', isAdmin);
  
  // Verificar se tem role de admin
  const hasAdminRole = roles.some(r => r.role === 'admin');
  console.log('Tem role de admin:', hasAdminRole);
}

// Substitua 'USER_ID_AQUI' pelo ID do usuário que você quer verificar
const userId = 'USER_ID_AQUI';
checkUserPermissions(userId);