// Função Edge para deletar usuários com service role key
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// URL do Supabase e chave de serviço (disponíveis como variáveis de ambiente)
const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://ukkatmoathxhbaelstzo.supabase.co';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

serve(async (req) => {
  // Verificar método HTTP
  if (req.method !== 'DELETE') {
    return new Response(
      JSON.stringify({ error: 'Método não permitido' }),
      { headers: { 'Content-Type': 'application/json' }, status: 405 }
    );
  }

  try {
    // Obter o corpo da requisição
    const { userId } = await req.json();

    // Validar ID do usuário
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'ID do usuário é obrigatório' }),
        { headers: { 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Criar cliente Supabase com service role key
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Verificar se o usuário que está fazendo a requisição é admin
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    
    const { data: { user } } = await supabaseAdmin.auth.getUser(token);
    
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Não autorizado' }),
        { headers: { 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // Verificar se o usuário tem permissão de admin
    const { data: userRoles, error: rolesError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    if (rolesError) {
      return new Response(
        JSON.stringify({ error: 'Erro ao verificar permissões' }),
        { headers: { 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const isAdmin = userRoles.some(role => role.role === 'admin');
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Apenas administradores podem excluir usuários' }),
        { headers: { 'Content-Type': 'application/json' }, status: 403 }
      );
    }

    // Excluir da tabela profiles primeiro
    const { error: profilesError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', userId);
    
    if (profilesError) {
      console.error('Erro ao excluir perfil:', profilesError);
      return new Response(
        JSON.stringify({ error: 'Erro ao excluir perfil do usuário' }),
        { headers: { 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Excluir usuário no Supabase Auth
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    
    if (authError) {
      console.error('Erro ao excluir usuário no Auth:', authError);
      return new Response(
        JSON.stringify({ error: 'Erro ao excluir usuário no sistema de autenticação' }),
        { headers: { 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Retornar sucesso
    return new Response(
      JSON.stringify({ message: 'Usuário excluído com sucesso' }),
      { headers: { 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Erro inesperado:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { headers: { 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});