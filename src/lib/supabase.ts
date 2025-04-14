import { createClient } from '@supabase/supabase-js';
import { type Database } from '@/types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Erro crítico: Variáveis de ambiente do Supabase não configuradas!');
  throw new Error('As variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY são necessárias');
}

// Verificar se o domínio atual está na lista de permitidos
const currentDomain = window.location.origin;
console.log(`Aplicação executando no domínio: ${currentDomain}`);

// Criação do cliente Supabase com opções mais detalhadas
const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    storageKey: 'bomestudo-auth-token', // Chave unificada para armazenamento
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce', // Usar PKCE para segurança adicional
  },
  global: {
    headers: {
      'X-Client-Info': `bomestudo-app/${import.meta.env.VITE_APP_VERSION || 'dev'}`
    },
  },
  // Ajustes de timeout e retry
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  db: {
    schema: 'public',
  },
});

console.log('Supabase client configurado com sucesso');

// Função para atualizar o perfil do usuário para administrador
export const makeUserAdmin = async (email: string) => {
  try {
    // Primeiro, buscar o usuário pelo email para obter o ID
    const { data: userData, error: findError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (findError || !userData) {
      console.error('Erro ao encontrar usuário pelo email:', findError);
      throw findError || new Error('Usuário não encontrado');
    }

    // Atualizar usando o ID em vez do email
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .update({
        role: 'admin',
        nivel: 'admin',
        status: 'ativo'
      })
      .eq('id', userData.id)
      .single();

    if (userError) {
      console.error('Erro ao atualizar perfil:', userError);
      throw userError;
    }

    console.log('Perfil atualizado com sucesso:', user);
    return user;
  } catch (error) {
    console.error('Erro ao fazer atualização:', error);
    throw error;
  }
};

// Teste inicial de conexão
const testSupabaseConnection = async () => {
  console.log('Testando conexão com Supabase...');
  try {
    // Testar acesso à tabela de concursos (foco deste contexto)
    const { data, error } = await supabase
      .from('concursos')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Erro ao acessar tabela de concursos:', error.message);
      
      if (error.code === 'PGRST301') {
        console.error('ERRO DE PERMISSÃO: Verifique as políticas RLS da tabela concursos');
      } else if (error.code === '42P01') {
        console.error('ERRO DE TABELA: A tabela "concursos" não existe no banco de dados');
      } else if (error.code?.startsWith('PGRST')) {
        console.error('ERRO DO POSTGREST:', error.message);
      }
      
      // Verificar se o token de autenticação está presente
      const { data: session } = await supabase.auth.getSession();
      console.log('Status da sessão:', session?.session ? 'Autenticado' : 'Não autenticado');
      
      // Tentar acessar outra tabela pública para diagnóstico
      console.log('Tentando acessar outra tabela para diagnóstico...');
      const { error: otherError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);
        
      if (otherError) {
        console.error('Também falhou ao acessar profiles:', otherError.message);
      } else {
        console.log('Acesso à tabela profiles funcionou, problema pode ser específico da tabela concursos');
      }
    } else {
      console.log('Conexão com tabela de concursos testada com sucesso!', data);
    }
    
    // Verificar site URLs permitidos (apenas log)
    console.log('IMPORTANTE: Verifique se o domínio', currentDomain, 'está na lista de Site URLs permitidos no Dashboard do Supabase -> Authentication -> URL Configuration');
  } catch (err) {
    console.error('Erro crítico ao testar conexão com o Supabase:', err);
  }
};

// Executar teste de conexão após 1 segundo para não bloquear carregamento inicial
setTimeout(testSupabaseConnection, 1000);

// Exportando o cliente Supabase
export { supabase };

// Exportando a instância auth para facilitar o uso
export const auth = supabase.auth;