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
      anos: {
        Row: {
          created_at: string
          id: string
          updated_at: string
          valor: string
        }
        Insert: {
          created_at?: string
          id?: string
          updated_at?: string
          valor: string
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
          valor?: string
        }
        Relationships: []
      }
      assuntos: {
        Row: {
          created_at: string
          disciplina: string
          id: string
          nome: string
          patrocinador: string | null
          questoes_ids: string[] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          disciplina: string
          id?: string
          nome: string
          patrocinador?: string | null
          questoes_ids?: string[] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          disciplina?: string
          id?: string
          nome?: string
          patrocinador?: string | null
          questoes_ids?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
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
      bancas: {
        Row: {
          created_at: string
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      blog_comments: {
        Row: {
          author_avatar: string | null
          author_name: string
          content: string
          created_at: string
          id: string
          likes_count: number
          parent_id: string | null
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          author_avatar?: string | null
          author_name: string
          content: string
          created_at?: string
          id?: string
          likes_count?: number
          parent_id?: string | null
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          author_avatar?: string | null
          author_name?: string
          content?: string
          created_at?: string
          id?: string
          likes_count?: number
          parent_id?: string | null
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "blog_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author: string
          author_avatar: string | null
          category: string
          comment_count: number
          content: string
          created_at: string
          featured: boolean | null
          featured_image: string | null
          id: string
          likes_count: number
          meta_description: string | null
          meta_keywords: string[] | null
          reading_time: number | null
          region: string | null
          related_posts: string[] | null
          slug: string
          state: string | null
          summary: string
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          author: string
          author_avatar?: string | null
          category: string
          comment_count?: number
          content: string
          created_at?: string
          featured?: boolean | null
          featured_image?: string | null
          id?: string
          likes_count?: number
          meta_description?: string | null
          meta_keywords?: string[] | null
          reading_time?: number | null
          region?: string | null
          related_posts?: string[] | null
          slug: string
          state?: string | null
          summary: string
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          author?: string
          author_avatar?: string | null
          category?: string
          comment_count?: number
          content?: string
          created_at?: string
          featured?: boolean | null
          featured_image?: string | null
          id?: string
          likes_count?: number
          meta_description?: string | null
          meta_keywords?: string[] | null
          reading_time?: number | null
          region?: string | null
          related_posts?: string[] | null
          slug?: string
          state?: string | null
          summary?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      cargos: {
        Row: {
          created_at: string
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string
          updated_at?: string
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
      cursoverticalizado: {
        Row: {
          ativo: boolean | null
          created_at: string
          curso_id: string
          disciplinas_ids: string[] | null
          id: string
          titulo: string
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string
          curso_id: string
          disciplinas_ids?: string[] | null
          id?: string
          titulo: string
        }
        Update: {
          ativo?: boolean | null
          created_at?: string
          curso_id?: string
          disciplinas_ids?: string[] | null
          id?: string
          titulo?: string
        }
        Relationships: []
      }
      dificuldades: {
        Row: {
          created_at: string
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string
          updated_at?: string
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
      disciplinas_questoes: {
        Row: {
          created_at: string
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      disciplinaverticalizada: {
        Row: {
          created_at: string
          descricao: string | null
          id: string
          importancia: number[] | null
          links: string[] | null
          titulo: string
          topicos: string[] | null
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          id?: string
          importancia?: number[] | null
          links?: string[] | null
          titulo: string
          topicos?: string[] | null
        }
        Update: {
          created_at?: string
          descricao?: string | null
          id?: string
          importancia?: number[] | null
          links?: string[] | null
          titulo?: string
          topicos?: string[] | null
        }
        Relationships: []
      }
      instituicoes: {
        Row: {
          created_at: string
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string
          updated_at?: string
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
      niveis: {
        Row: {
          created_at: string
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      notas_professores: {
        Row: {
          conteudo: string
          data_criacao: string | null
          id: string
          professor_id: string
          usuario_id: string | null
        }
        Insert: {
          conteudo: string
          data_criacao?: string | null
          id?: string
          professor_id: string
          usuario_id?: string | null
        }
        Update: {
          conteudo?: string
          data_criacao?: string | null
          id?: string
          professor_id?: string
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notas_professores_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "professores"
            referencedColumns: ["id"]
          },
        ]
      }
      notas_usuarios: {
        Row: {
          conteudo: string
          criado_por: string | null
          data_criacao: string | null
          id: string
          usuario_id: string
        }
        Insert: {
          conteudo: string
          criado_por?: string | null
          data_criacao?: string | null
          id?: string
          usuario_id: string
        }
        Update: {
          conteudo?: string
          criado_por?: string | null
          data_criacao?: string | null
          id?: string
          usuario_id?: string
        }
        Relationships: []
      }
      professores: {
        Row: {
          data_cadastro: string | null
          disciplina: string
          email: string
          facebook: string | null
          foto_perfil: string | null
          id: string
          instagram: string | null
          link_youtube: string | null
          nome_completo: string
          rating: number | null
          twitter: string | null
          website: string | null
        }
        Insert: {
          data_cadastro?: string | null
          disciplina: string
          email: string
          facebook?: string | null
          foto_perfil?: string | null
          id?: string
          instagram?: string | null
          link_youtube?: string | null
          nome_completo: string
          rating?: number | null
          twitter?: string | null
          website?: string | null
        }
        Update: {
          data_cadastro?: string | null
          disciplina?: string
          email?: string
          facebook?: string | null
          foto_perfil?: string | null
          id?: string
          instagram?: string | null
          link_youtube?: string | null
          nome_completo?: string
          rating?: number | null
          twitter?: string | null
          website?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          assinante: boolean | null
          cursos_favoritos: string[] | null
          disciplinas_favoritos: string[] | null
          email: string | null
          foto_perfil: string | null
          id: string
          inicio_assinatura: string | null
          nome: string | null
          role: string | null
          status: string | null
          termino_assinatura: string | null
          tipo: string | null
          ultimo_login: string | null
        }
        Insert: {
          assinante?: boolean | null
          cursos_favoritos?: string[] | null
          disciplinas_favoritos?: string[] | null
          email?: string | null
          foto_perfil?: string | null
          id: string
          inicio_assinatura?: string | null
          nome?: string | null
          role?: string | null
          status?: string | null
          termino_assinatura?: string | null
          tipo?: string | null
          ultimo_login?: string | null
        }
        Update: {
          assinante?: boolean | null
          cursos_favoritos?: string[] | null
          disciplinas_favoritos?: string[] | null
          email?: string | null
          foto_perfil?: string | null
          id?: string
          inicio_assinatura?: string | null
          nome?: string | null
          role?: string | null
          status?: string | null
          termino_assinatura?: string | null
          tipo?: string | null
          ultimo_login?: string | null
        }
        Relationships: []
      }
      question_stats_clearing_log: {
        Row: {
          cleared_at: string
          cleared_by: string | null
          id: string
          is_bulk_clear: boolean | null
          question_id: string
        }
        Insert: {
          cleared_at?: string
          cleared_by?: string | null
          id?: string
          is_bulk_clear?: boolean | null
          question_id: string
        }
        Update: {
          cleared_at?: string
          cleared_by?: string | null
          id?: string
          is_bulk_clear?: boolean | null
          question_id?: string
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
      tipos_questao: {
        Row: {
          created_at: string
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string
          updated_at?: string
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
      user_course_progress: {
        Row: {
          course_id: string
          created_at: string | null
          exam_date: string | null
          id: string
          performance_goal: number | null
          subjects_data: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          course_id: string
          created_at?: string | null
          exam_date?: string | null
          id?: string
          performance_goal?: number | null
          subjects_data?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          course_id?: string
          created_at?: string | null
          exam_date?: string | null
          id?: string
          performance_goal?: number | null
          subjects_data?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_question_attempts: {
        Row: {
          created_at: string
          id: string
          is_correct: boolean
          question_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_correct: boolean
          question_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_correct?: boolean
          question_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_simulado_results: {
        Row: {
          acertos: number
          created_at: string
          erros: number
          id: string
          simulado_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          acertos?: number
          created_at?: string
          erros?: number
          id?: string
          simulado_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          acertos?: number
          created_at?: string
          erros?: number
          id?: string
          simulado_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      edital_verticalizado_data: {
        Row: {
          id: string
          user_id: string
          course_id: string
          disciplina_id: string
          topicos: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          course_id: string
          disciplina_id: string
          topicos?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string
          disciplina_id?: string
          topicos?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "edital_verticalizado_data_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      clear_all_question_stats: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      clear_question_stats: {
        Args: {
          question_id: string
        }
        Returns: undefined
      }
      decrement_post_comment_count:
        | {
            Args: {
              post_id: number
            }
            Returns: undefined
          }
        | {
            Args: {
              post_id: string
            }
            Returns: undefined
          }
      handle_comment_created: {
        Args: {
          comment_id: number
        }
        Returns: undefined
      }
      handle_comment_deleted: {
        Args: {
          comment_id: number
        }
        Returns: undefined
      }
      handle_new_user: {
        Args: {
          user_id: number
        }
        Returns: undefined
      }
      increment_blog_post_comments:
        | {
            Args: {
              post_id: number
            }
            Returns: undefined
          }
        | {
            Args: {
              post_id: string
            }
            Returns: undefined
          }
      increment_blog_post_likes:
        | {
            Args: {
              post_id: number
            }
            Returns: undefined
          }
        | {
            Args: {
              post_id: string
            }
            Returns: undefined
          }
      increment_comment_likes:
        | {
            Args: {
              comment_id: number
            }
            Returns: undefined
          }
        | {
            Args: {
              comment_id: string
            }
            Returns: undefined
          }
      increment_post_comment_count:
        | {
            Args: {
              post_id: number
            }
            Returns: undefined
          }
        | {
            Args: {
              post_id: string
            }
            Returns: undefined
          }
      table_exists: {
        Args: {
          table_name: string
        }
        Returns: boolean
      }
      update_updated_at_column: {
        Args: {
          record_id: number
        }
        Returns: undefined
      }
      update_user_question_attempts_updated_at: {
        Args: {
          attempt_id: number
        }
        Returns: undefined
      }
      upsert_user_question_attempt:
        | {
            Args: {
              p_user_id: string
              p_question_id: string
              p_is_correct: boolean
            }
            Returns: undefined
          }
        | {
            Args: {
              user_id: number
              question_id: number
              attempt_data: Json
            }
            Returns: undefined
          }
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
