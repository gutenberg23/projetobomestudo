export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          nome: string;
          sobrenome: string | null;
          foto_url: string | null;
          nivel: 'usuario' | 'assistente' | 'professor' | 'admin';
          status: 'ativo' | 'inativo' | 'pendente' | 'bloqueado';
          data_cadastro: string;
          ultimo_login: string | null;
          metadata: Record<string, any> | null;
          created_at: string;
          updated_at: string;
          foto_perfil: string | null;
          nome_social: string | null;
          nascimento: string | null;
          sexo: string | null;
          escolaridade: string | null;
          estado_civil: string | null;
          celular: string | null;
          telefone: string | null;
          cep: string | null;
          endereco: string | null;
          numero: string | null;
          bairro: string | null;
          complemento: string | null;
          estado: string | null;
          cidade: string | null;
          role: string | null;
        };
        Insert: {
          id: string;
          email: string;
          nome: string;
          sobrenome?: string | null;
          foto_url?: string | null;
          nivel?: 'usuario' | 'assistente' | 'professor' | 'admin';
          status?: 'ativo' | 'inativo' | 'pendente' | 'bloqueado';
          data_cadastro?: string;
          ultimo_login?: string | null;
          metadata?: Record<string, any> | null;
          created_at?: string;
          updated_at?: string;
          foto_perfil?: string | null;
          nome_social?: string | null;
          nascimento?: string | null;
          sexo?: string | null;
          escolaridade?: string | null;
          estado_civil?: string | null;
          celular?: string | null;
          telefone?: string | null;
          cep?: string | null;
          endereco?: string | null;
          numero?: string | null;
          bairro?: string | null;
          complemento?: string | null;
          estado?: string | null;
          cidade?: string | null;
          role?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          nome?: string;
          sobrenome?: string | null;
          foto_url?: string | null;
          nivel?: 'usuario' | 'assistente' | 'professor' | 'admin';
          status?: 'ativo' | 'inativo' | 'pendente' | 'bloqueado';
          data_cadastro?: string;
          ultimo_login?: string | null;
          metadata?: Record<string, any> | null;
          created_at?: string;
          updated_at?: string;
          foto_perfil?: string | null;
          nome_social?: string | null;
          nascimento?: string | null;
          sexo?: string | null;
          escolaridade?: string | null;
          estado_civil?: string | null;
          celular?: string | null;
          telefone?: string | null;
          cep?: string | null;
          endereco?: string | null;
          numero?: string | null;
          bairro?: string | null;
          complemento?: string | null;
          estado?: string | null;
          cidade?: string | null;
          role?: string | null;
        };
      };
      auth_logs: {
        Row: {
          id: string;
          user_id: string;
          event_type: string;
          ip_address: string | null;
          user_agent: string | null;
          metadata: Record<string, any> | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          event_type: string;
          ip_address?: string | null;
          user_agent?: string | null;
          metadata?: Record<string, any> | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          event_type?: string;
          ip_address?: string | null;
          user_agent?: string | null;
          metadata?: Record<string, any> | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_admin_or_staff: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
} 