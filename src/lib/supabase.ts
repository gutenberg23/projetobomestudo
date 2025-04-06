import { createClient } from '@supabase/supabase-js';
import { type Database } from '@/types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
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
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .update({
        role: 'admin',
        nivel: 'admin',
        status: 'ativo'
      })
      .eq('email', email);

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

// Teste de conexão
(async () => {
  try {
    // Primeiro testar sem autenticação para isolar problemas de autenticação vs. conectividade
    const { error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) {
      console.error('Erro ao conectar com o Supabase:', error.message);
      
      // Se o erro for de permissão, test se conseguimos acessar tabelas públicas
      try {
        const { error: authError } = await supabase.auth.getSession();
        if (authError) {
          console.error('Erro ao verificar sessão:', authError.message);
        } else {
          console.log('Sessão verificada com sucesso');
        }
      } catch (authErr) {
        console.error('Exceção ao verificar sessão:', authErr);
      }
    } else {
      console.log('Conexão com o Supabase testada com sucesso');
    }
    
    // Verificar site URLs permitidos (apenas log)
    console.log('IMPORTANTE: Verifique se o domínio', currentDomain, 'está na lista de Site URLs permitidos no Dashboard do Supabase -> Authentication -> URL Configuration');

    // Tentar atualizar o perfil do usuário para administrador
    await makeUserAdmin('gutenberg23@gmail.com');
  } catch (err) {
    console.error('Erro ao testar conexão com o Supabase:', err);
  }
})();

// Exportando o cliente Supabase
export { supabase };

// Exportando a instância auth para facilitar o uso
export const auth = supabase.auth;