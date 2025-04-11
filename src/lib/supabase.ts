import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Carregar variáveis de ambiente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validação básica
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Erro: Variáveis de ambiente do Supabase não encontradas');
  throw new Error('Configuração do Supabase não encontrada');
}

// Verificar se o domínio atual está na lista de permitidos
const currentDomain = window.location.origin;
console.log(`Aplicação executando no domínio: ${currentDomain}`);

// Criar cliente do Supabase
const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Verificar se o cliente do Supabase foi inicializado corretamente
if (!supabase) {
  console.error('Erro: Cliente do Supabase não inicializado corretamente');
  throw new Error('Cliente do Supabase não inicializado');
}

// Lista de buckets necessários
const REQUIRED_BUCKETS = [
  'temp-files',
  'blog-images',
  'avatars',
  'uploads'
];

// Função para inicializar os buckets de armazenamento necessários
export const inicializarStorageBuckets = async () => {
  try {
    const user = supabase.auth.getUser();
    
    // Verificar se o usuário está autenticado antes de tentar criar buckets
    if (!user) {
      console.log('Usuário não autenticado. Ignorando criação de buckets.');
      return;
    }
    
    console.log('Verificando buckets de armazenamento...');
    
    // Listar buckets existentes
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.warn('Aviso: Não foi possível listar os buckets existentes. O usuário pode não ter permissões adequadas.', listError);
      return;
    }
    
    const existingBuckets = buckets?.map(bucket => bucket.name) || [];
    console.log('Buckets existentes:', existingBuckets);
    
    // Tentar criar buckets faltantes
    for (const bucketName of REQUIRED_BUCKETS) {
      if (!existingBuckets.includes(bucketName)) {
        console.log(`Tentando criar bucket ${bucketName}...`);
        try {
          // Tentar criar o bucket, mas não falhar se não for possível
          const { error } = await supabase.storage.createBucket(bucketName, {
            public: false
          });
          
          if (error) {
            console.warn(`Aviso: Não foi possível criar o bucket ${bucketName}. O aplicativo funcionará, mas alguns recursos podem estar limitados.`, error);
          } else {
            console.log(`Bucket ${bucketName} criado com sucesso.`);
          }
        } catch (err) {
          console.warn(`Erro ao criar bucket ${bucketName}:`, err);
        }
      } else {
        console.log(`Bucket ${bucketName} já existe.`);
      }
    }
  } catch (error) {
    // Apenas logar o erro, não falhar a inicialização
    console.warn('Aviso: Erro ao inicializar buckets de armazenamento. O aplicativo continuará funcionando, mas alguns recursos podem estar limitados.', error);
  }
};

// Utilitário para verificar se um bucket existe sem lançar erro
export const verificarBucketExiste = async (bucketName: string): Promise<boolean> => {
  try {
    const { data } = await supabase.storage.listBuckets();
    return data?.some(bucket => bucket.name === bucketName) || false;
  } catch (error) {
    console.warn(`Erro ao verificar se o bucket ${bucketName} existe:`, error);
    return false;
  }
};

// Obter URL pública para um arquivo
export const getPublicUrl = (bucket: string, path: string): string => {
  try {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  } catch (error) {
    console.error('Erro ao obter URL pública:', error);
    return '';
  }
};

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

// Teste de conexão - modificado para ser mais seguro
(async () => {
  try {
    // Primeiro testar sem autenticação para isolar problemas
    const { error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) {
      console.error('Erro ao conectar com o Supabase:', error.message);
      
      // Se o erro for de permissão, testar se conseguimos acessar tabelas públicas
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

    // NÃO executar chamadas automáticas que possam gerar erros
    // A chamada a makeUserAdmin foi removida para evitar erros
  } catch (err) {
    console.error('Erro ao testar conexão com o Supabase:', err);
  }
})();

// Função para verificar a configuração em ambiente de desenvolvimento
(async () => {
  try {
    // Verificar se estamos em desenvolvimento
    const isDevelopment = import.meta.env.MODE === 'development';
    
    if (isDevelopment) {
      console.log("Verificando configuração de ambiente de desenvolvimento");
      
      // Outras configurações específicas para ambiente de desenvolvimento podem ser adicionadas aqui
    }
  } catch (error) {
    console.error("Erro ao verificar configuração:", error);
  }
})();

// Exportar o cliente Supabase e a instância de autenticação
export { supabase };
export const auth = supabase.auth;