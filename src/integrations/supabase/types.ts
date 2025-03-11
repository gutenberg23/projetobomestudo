export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      aulas: {
        Row: {
          created_at: string | null
          descricao: string | null
          id: string
          questoes_ids: string[] | null
          status: string | null
          titulo: string
          topicos_ids: string[] | null
        }
        Insert: {
          created_at?: string | null
          descricao?: string | null
          id?: string
          questoes_ids?: string[] | null
          status?: string | null
          titulo: string
          topicos_ids?: string[] | null
        }
        Update: {
          created_at?: string | null
          descricao?: string | null
          id?: string
          questoes_ids?: string[] | null
          status?: string | null
          titulo?: string
          topicos_ids?: string[] | null
        }
        Relationships: []
      }
      comentarios_questoes: {
        Row: {
          conteudo: string
          created_at: string
          id: string
          questao_id: string
          usuario_id: string
        }
        Insert: {
          conteudo: string
          created_at?: string
          id?: string
          questao_id: string
          usuario_id: string
        }
        Update: {
          conteudo?: string
          created_at?: string
          id?: string
          questao_id?: string
          usuario_id?: string
        }
        Relationships: []
      }
      cursos: {
        Row: {
          aulas_ids: string[] | null
          created_at: string | null
          descricao: string | null
          disciplinas_ids: string[] | null
          favoritos: number | null
          id: string
          informacoes_curso: string | null
          questoes_ids: string[] | null
          status: string | null
          titulo: string
          topicos_ids: string[] | null
        }
        Insert: {
          aulas_ids?: string[] | null
          created_at?: string | null
          descricao?: string | null
          disciplinas_ids?: string[] | null
          favoritos?: number | null
          id?: string
          informacoes_curso?: string | null
          questoes_ids?: string[] | null
          status?: string | null
          titulo: string
          topicos_ids?: string[] | null
        }
        Update: {
          aulas_ids?: string[] | null
          created_at?: string | null
          descricao?: string | null
          disciplinas_ids?: string[] | null
          favoritos?: number | null
          id?: string
          informacoes_curso?: string | null
          questoes_ids?: string[] | null
          status?: string | null
          titulo?: string
          topicos_ids?: string[] | null
        }
        Relationships: []
      }
      disciplinas: {
        Row: {
          aulas_ids: string[] | null
          created_at: string | null
          descricao: string | null
          id: string
          status: string | null
          titulo: string
        }
        Insert: {
          aulas_ids?: string[] | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          status?: string | null
          titulo: string
        }
        Update: {
          aulas_ids?: string[] | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          status?: string | null
          titulo?: string
        }
        Relationships: []
      }
      likes_comentarios: {
        Row: {
          comentario_id: string
          created_at: string
          id: string
          usuario_id: string
        }
        Insert: {
          comentario_id: string
          created_at?: string
          id?: string
          usuario_id: string
        }
        Update: {
          comentario_id?: string
          created_at?: string
          id?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_comentarios_comentario_id_fkey"
            columns: ["comentario_id"]
            isOneToOne: false
            referencedRelation: "comentarios_questoes"
            referencedColumns: ["id"]
          },
        ]
      }
      likes_gabaritos: {
        Row: {
          created_at: string
          id: string
          questao_id: string
          usuario_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          questao_id: string
          usuario_id: string
        }
        Update: {
          created_at?: string
          id?: string
          questao_id?: string
          usuario_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          cursos_favoritos: string[] | null
          disciplinas_favoritos: string[] | null
          email: string | null
          foto_perfil: string | null
          id: string
          nome: string | null
          role: string | null
        }
        Insert: {
          cursos_favoritos?: string[] | null
          disciplinas_favoritos?: string[] | null
          email?: string | null
          foto_perfil?: string | null
          id: string
          nome?: string | null
          role?: string | null
        }
        Update: {
          cursos_favoritos?: string[] | null
          disciplinas_favoritos?: string[] | null
          email?: string | null
          foto_perfil?: string | null
          id?: string
          nome?: string | null
          role?: string | null
        }
        Relationships: []
      }
      questoes: {
        Row: {
          aiexplanation: string | null
          content: string
          created_at: string | null
          difficulty: string
          discipline: string
          expandablecontent: string | null
          id: string
          institution: string
          level: string
          options: Json | null
          organization: string
          questiontype: string
          role: string
          teacherexplanation: string
          topicos: string[] | null
          updated_at: string | null
          user_id: string
          year: string
        }
        Insert: {
          aiexplanation?: string | null
          content: string
          created_at?: string | null
          difficulty: string
          discipline: string
          expandablecontent?: string | null
          id: string
          institution: string
          level: string
          options?: Json | null
          organization: string
          questiontype: string
          role: string
          teacherexplanation: string
          topicos?: string[] | null
          updated_at?: string | null
          user_id: string
          year: string
        }
        Update: {
          aiexplanation?: string | null
          content?: string
          created_at?: string | null
          difficulty?: string
          discipline?: string
          expandablecontent?: string | null
          id?: string
          institution?: string
          level?: string
          options?: Json | null
          organization?: string
          questiontype?: string
          role?: string
          teacherexplanation?: string
          topicos?: string[] | null
          updated_at?: string | null
          user_id?: string
          year?: string
        }
        Relationships: []
      }
      respostas_alunos: {
        Row: {
          aluno_id: string
          created_at: string
          id: string
          is_correta: boolean
          opcao_id: string
          questao_id: string
        }
        Insert: {
          aluno_id: string
          created_at?: string
          id?: string
          is_correta: boolean
          opcao_id: string
          questao_id: string
        }
        Update: {
          aluno_id?: string
          created_at?: string
          id?: string
          is_correta?: boolean
          opcao_id?: string
          questao_id?: string
        }
        Relationships: []
      }
      simulados: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          curso_id: string
          data_fim: string | null
          data_inicio: string | null
          id: string
          quantidade_questoes: number | null
          questoes_ids: string[] | null
          titulo: string
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          curso_id: string
          data_fim?: string | null
          data_inicio?: string | null
          id?: string
          quantidade_questoes?: number | null
          questoes_ids?: string[] | null
          titulo: string
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          curso_id?: string
          data_fim?: string | null
          data_inicio?: string | null
          id?: string
          quantidade_questoes?: number | null
          questoes_ids?: string[] | null
          titulo?: string
        }
        Relationships: []
      }
      topicos: {
        Row: {
          created_at: string | null
          disciplina: string
          id: string
          mapa_url: string | null
          musica_url: string | null
          nome: string
          patrocinador: string | null
          pdf_url: string | null
          professor_id: string | null
          professor_nome: string | null
          questoes_ids: string[] | null
          resumo_url: string | null
          video_url: string | null
        }
        Insert: {
          created_at?: string | null
          disciplina: string
          id?: string
          mapa_url?: string | null
          musica_url?: string | null
          nome: string
          patrocinador?: string | null
          pdf_url?: string | null
          professor_id?: string | null
          professor_nome?: string | null
          questoes_ids?: string[] | null
          resumo_url?: string | null
          video_url?: string | null
        }
        Update: {
          created_at?: string | null
          disciplina?: string
          id?: string
          mapa_url?: string | null
          musica_url?: string | null
          nome?: string
          patrocinador?: string | null
          pdf_url?: string | null
          professor_id?: string | null
          professor_nome?: string | null
          questoes_ids?: string[] | null
          resumo_url?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: "aluno" | "professor" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
