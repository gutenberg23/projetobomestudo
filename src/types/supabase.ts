export type Database = {
  public: {
    Tables: {
      cadernos_questoes: {
        Row: {
          id: string;
          nome: string;
          user_id: string;
          is_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nome: string;
          user_id: string;
          is_public: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      questoes_caderno: {
        Row: {
          id: string;
          caderno_id: string;
          questao_id: string;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          caderno_id: string;
          questao_id: string;
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          email: string | null;
          nome: string | null;
          created_at: string;
          updated_at: string;
          role?: string;
          foto_perfil: string | null;
          sobrenome: string | null;
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
          nivel?: string;
          status?: string;
          data_cadastro?: string;
          ultimo_login?: string | null;
          metadata?: Record<string, any> | null;
        };
        Insert: {
          id: string;
          email?: string | null;
          nome?: string | null;
          created_at?: string;
          updated_at?: string;
          role?: string;
          foto_perfil?: string | null;
          sobrenome?: string | null;
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
          nivel?: string;
          status?: string;
          data_cadastro?: string;
          ultimo_login?: string | null;
          metadata?: Record<string, any> | null;
        };
        Update: {
          id?: string;
          email?: string | null;
          nome?: string | null;
          created_at?: string;
          updated_at?: string;
          role?: string;
          foto_perfil?: string | null;
          sobrenome?: string | null;
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
          nivel?: string;
          status?: string;
          data_cadastro?: string;
          ultimo_login?: string | null;
          metadata?: Record<string, any> | null;
        };
      };
    };
  };
};
