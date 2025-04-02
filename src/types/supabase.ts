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
    };
  };
};
