import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('VITE_SUPABASE_URL não está definida no arquivo .env');
}

if (!supabaseAnonKey) {
  throw new Error('VITE_SUPABASE_ANON_KEY não está definida no arquivo .env');
}

// Validar se a URL está no formato correto
try {
  new URL(supabaseUrl);
} catch (error) {
  throw new Error('VITE_SUPABASE_URL não é uma URL válida. Exemplo correto: https://seu-projeto.supabase.co');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 