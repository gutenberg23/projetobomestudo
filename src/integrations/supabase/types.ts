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
      atualizacoes_questoes: {
        Row: {
          created_at: string
          id: string
          professor_id: string
          questao_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          professor_id: string
          questao_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          professor_id?: string
          questao_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "atualizacoes_questoes_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "atualizacoes_questoes_questao_id_fkey"
            columns: ["questao_id"]
            isOneToOne: false
            referencedRelation: "questoes"
            referencedColumns: ["id"]
          },
        ]
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
      auth_logs: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          ip_address: string | null
          metadata: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
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
          is_draft: boolean | null
          likes_count: number
          meta_description: string | null
          meta_keywords: string[] | null
          reading_time: number | null
          region: string | null
          related_posts: string[] | null
          scheduled_for: string | null
          slug: string
          state: string | null
          summary: string
          tags: string[] | null
          title: string
          updated_at: string
          view_count: number
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
          is_draft?: boolean | null
          likes_count?: number
          meta_description?: string | null
          meta_keywords?: string[] | null
          reading_time?: number | null
          region?: string | null
          related_posts?: string[] | null
          scheduled_for?: string | null
          slug: string
          state?: string | null
          summary: string
          tags?: string[] | null
          title: string
          updated_at?: string
          view_count?: number
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
          is_draft?: boolean | null
          likes_count?: number
          meta_description?: string | null
          meta_keywords?: string[] | null
          reading_time?: number | null
          region?: string | null
          related_posts?: string[] | null
          scheduled_for?: string | null
          slug?: string
          state?: string | null
          summary?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          view_count?: number
        }
        Relationships: []
      }
      cadernos_questoes: {
        Row: {
          answered_questions: number | null
          correct_answers: number | null
          created_at: string
          id: string
          is_public: boolean | null
          nome: string
          total_questions: number | null
          updated_at: string
          user_id: string
          wrong_answers: number | null
        }
        Insert: {
          answered_questions?: number | null
          correct_answers?: number | null
          created_at?: string
          id?: string
          is_public?: boolean | null
          nome: string
          total_questions?: number | null
          updated_at?: string
          user_id: string
          wrong_answers?: number | null
        }
        Update: {
          answered_questions?: number | null
          correct_answers?: number | null
          created_at?: string
          id?: string
          is_public?: boolean | null
          nome?: string
          total_questions?: number | null
          updated_at?: string
          user_id?: string
          wrong_answers?: number | null
        }
        Relationships: []
      }
      ciclos_estudo: {
        Row: {
          curso_id: string | null
          data_criacao: string | null
          disciplinas: Json
          id: string
          total_horas: number
          ultima_atualizacao: string | null
          user_id: string | null
        }
        Insert: {
          curso_id?: string | null
          data_criacao?: string | null
          disciplinas?: Json
          id?: string
          total_horas?: number
          ultima_atualizacao?: string | null
          user_id?: string | null
        }
        Update: {
          curso_id?: string | null
          data_criacao?: string | null
          disciplinas?: Json
          id?: string
          total_horas?: number
          ultima_atualizacao?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_curso"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
        ]
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
      concursos: {
        Row: {
          cargos: string[] | null
          created_at: string | null
          data_fim_inscricao: string
          data_inicio_inscricao: string
          estados: string[] | null
          id: string
          niveis: string[] | null
          post_id: string | null
          prorrogado: boolean | null
          salario: string
          titulo: string
          updated_at: string | null
          vagas: number
        }
        Insert: {
          cargos?: string[] | null
          created_at?: string | null
          data_fim_inscricao: string
          data_inicio_inscricao: string
          estados?: string[] | null
          id?: string
          niveis?: string[] | null
          post_id?: string | null
          prorrogado?: boolean | null
          salario: string
          titulo: string
          updated_at?: string | null
          vagas: number
        }
        Update: {
          cargos?: string[] | null
          created_at?: string | null
          data_fim_inscricao?: string
          data_inicio_inscricao?: string
          estados?: string[] | null
          id?: string
          niveis?: string[] | null
          post_id?: string | null
          prorrogado?: boolean | null
          salario?: string
          titulo?: string
          updated_at?: string | null
          vagas?: number
        }
        Relationships: [
          {
            foreignKeyName: "concursos_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      configuracoes_site: {
        Row: {
          chave: string
          created_at: string | null
          id: string
          updated_at: string | null
          valor: Json
        }
        Insert: {
          chave: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          valor?: Json
        }
        Update: {
          chave?: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          valor?: Json
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
      disciplinas: {
        Row: {
          aulas_ids: string[] | null
          banca: string | null
          created_at: string | null
          descricao: string | null
          id: string
          status: string | null
          titulo: string
        }
        Insert: {
          aulas_ids?: string[] | null
          banca?: string | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          status?: string | null
          titulo: string
        }
        Update: {
          aulas_ids?: string[] | null
          banca?: string | null
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
      edital_verticalizado_data: {
        Row: {
          acertos: number
          course_id: string
          created_at: string
          dificuldade: string
          disciplina_id: string
          id: string
          importancia: number
          revisado: boolean
          topicos: Json
          total_exercicios: number
          updated_at: string
          user_id: string
        }
        Insert: {
          acertos?: number
          course_id: string
          created_at?: string
          dificuldade?: string
          disciplina_id: string
          id?: string
          importancia?: number
          revisado?: boolean
          topicos?: Json
          total_exercicios?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          acertos?: number
          course_id?: string
          created_at?: string
          dificuldade?: string
          disciplina_id?: string
          id?: string
          importancia?: number
          revisado?: boolean
          topicos?: Json
          total_exercicios?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      files: {
        Row: {
          created_at: string
          id: string
          name: string
          parent_id: string | null
          size: number | null
          type: string
          updated_at: string | null
          url: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          parent_id?: string | null
          size?: number | null
          type: string
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          parent_id?: string | null
          size?: number | null
          type?: string
          updated_at?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "files_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "files"
            referencedColumns: ["id"]
          },
        ]
      }
      kanban_columns: {
        Row: {
          created_at: string
          id: string
          order: number
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          order: number
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          order?: number
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      kanban_items: {
        Row: {
          column_id: string | null
          comments: number | null
          created_at: string
          id: string
          title: string
          type: string
          updated_at: string | null
          upvotes: number | null
          votes: number | null
        }
        Insert: {
          column_id?: string | null
          comments?: number | null
          created_at?: string
          id?: string
          title: string
          type: string
          updated_at?: string | null
          upvotes?: number | null
          votes?: number | null
        }
        Update: {
          column_id?: string | null
          comments?: number | null
          created_at?: string
          id?: string
          title?: string
          type?: string
          updated_at?: string | null
          upvotes?: number | null
          votes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "kanban_items_column_id_fkey"
            columns: ["column_id"]
            isOneToOne: false
            referencedRelation: "kanban_columns"
            referencedColumns: ["id"]
          },
        ]
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
          type: string | null
          usuario_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          questao_id: string
          type?: string | null
          usuario_id: string
        }
        Update: {
          created_at?: string
          id?: string
          questao_id?: string
          type?: string | null
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
          bairro: string | null
          bio: string | null
          cadernos_favoritos: string[] | null
          celular: string | null
          cep: string | null
          cidade: string | null
          complemento: string | null
          created_at: string | null
          cursos_favoritos: string[] | null
          data_cadastro: string | null
          disciplinas_favoritos: string[] | null
          email: string
          endereco: string | null
          escolaridade: string | null
          estado: string | null
          estado_civil: string | null
          foto_perfil: string | null
          foto_url: string | null
          id: string
          inicio_assinatura: string | null
          metadata: Json | null
          nascimento: string | null
          nivel: string | null
          nome: string
          nome_social: string | null
          numero: string | null
          role: string | null
          sexo: string | null
          sobrenome: string | null
          status: string | null
          telefone: string | null
          termino_assinatura: string | null
          ultimo_login: string | null
          updated_at: string | null
        }
        Insert: {
          assinante?: boolean | null
          bairro?: string | null
          bio?: string | null
          cadernos_favoritos?: string[] | null
          celular?: string | null
          cep?: string | null
          cidade?: string | null
          complemento?: string | null
          created_at?: string | null
          cursos_favoritos?: string[] | null
          data_cadastro?: string | null
          disciplinas_favoritos?: string[] | null
          email: string
          endereco?: string | null
          escolaridade?: string | null
          estado?: string | null
          estado_civil?: string | null
          foto_perfil?: string | null
          foto_url?: string | null
          id: string
          inicio_assinatura?: string | null
          metadata?: Json | null
          nascimento?: string | null
          nivel?: string | null
          nome: string
          nome_social?: string | null
          numero?: string | null
          role?: string | null
          sexo?: string | null
          sobrenome?: string | null
          status?: string | null
          telefone?: string | null
          termino_assinatura?: string | null
          ultimo_login?: string | null
          updated_at?: string | null
        }
        Update: {
          assinante?: boolean | null
          bairro?: string | null
          bio?: string | null
          cadernos_favoritos?: string[] | null
          celular?: string | null
          cep?: string | null
          cidade?: string | null
          complemento?: string | null
          created_at?: string | null
          cursos_favoritos?: string[] | null
          data_cadastro?: string | null
          disciplinas_favoritos?: string[] | null
          email?: string
          endereco?: string | null
          escolaridade?: string | null
          estado?: string | null
          estado_civil?: string | null
          foto_perfil?: string | null
          foto_url?: string | null
          id?: string
          inicio_assinatura?: string | null
          metadata?: Json | null
          nascimento?: string | null
          nivel?: string | null
          nome?: string
          nome_social?: string | null
          numero?: string | null
          role?: string | null
          sexo?: string | null
          sobrenome?: string | null
          status?: string | null
          telefone?: string | null
          termino_assinatura?: string | null
          ultimo_login?: string | null
          updated_at?: string | null
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
          assuntos: string[] | null
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
          role: string[]
          teacherexplanation: string
          topicos: string[] | null
          updated_at: string | null
          user_id: string
          year: string
        }
        Insert: {
          aiexplanation?: string | null
          assuntos?: string[] | null
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
          role: string[]
          teacherexplanation: string
          topicos?: string[] | null
          updated_at?: string | null
          user_id: string
          year: string
        }
        Update: {
          aiexplanation?: string | null
          assuntos?: string[] | null
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
          role?: string[]
          teacherexplanation?: string
          topicos?: string[] | null
          updated_at?: string | null
          user_id?: string
          year?: string
        }
        Relationships: []
      }
      questoes_caderno: {
        Row: {
          caderno_id: string
          created_at: string
          id: string
          questao_id: string
          user_id: string
        }
        Insert: {
          caderno_id: string
          created_at?: string
          id?: string
          questao_id: string
          user_id: string
        }
        Update: {
          caderno_id?: string
          created_at?: string
          id?: string
          questao_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "questoes_caderno_caderno_id_fkey"
            columns: ["caderno_id"]
            isOneToOne: false
            referencedRelation: "cadernos_questoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questoes_caderno_questao_id_fkey"
            columns: ["questao_id"]
            isOneToOne: false
            referencedRelation: "questoes"
            referencedColumns: ["id"]
          },
        ]
      }
      questoes_erros_reportados: {
        Row: {
          created_at: string
          descricao: string
          id: string
          questao_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          descricao: string
          id?: string
          questao_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          descricao?: string
          id?: string
          questao_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "questoes_erros_reportados_questao_id_fkey"
            columns: ["questao_id"]
            isOneToOne: false
            referencedRelation: "questoes"
            referencedColumns: ["id"]
          },
        ]
      }
      questoesimportadas: {
        Row: {
          alternativas: string | null
          assuntos: string | null
          content: string | null
          correctanswer: string | null
          created_at: string | null
          difficulty: string | null
          discipline: string | null
          expandablecontent: string | null
          id: number
          institution: string | null
          optiona: string | null
          optionb: string | null
          optionc: string | null
          optiond: string | null
          optione: string | null
          organization: string | null
          qid: string
          role: string | null
          url: string | null
          year: string | null
        }
        Insert: {
          alternativas?: string | null
          assuntos?: string | null
          content?: string | null
          correctanswer?: string | null
          created_at?: string | null
          difficulty?: string | null
          discipline?: string | null
          expandablecontent?: string | null
          id?: number
          institution?: string | null
          optiona?: string | null
          optionb?: string | null
          optionc?: string | null
          optiond?: string | null
          optione?: string | null
          organization?: string | null
          qid: string
          role?: string | null
          url?: string | null
          year?: string | null
        }
        Update: {
          alternativas?: string | null
          assuntos?: string | null
          content?: string | null
          correctanswer?: string | null
          created_at?: string | null
          difficulty?: string | null
          discipline?: string | null
          expandablecontent?: string | null
          id?: number
          institution?: string | null
          optiona?: string | null
          optionb?: string | null
          optionc?: string | null
          optiond?: string | null
          optione?: string | null
          organization?: string | null
          qid?: string
          role?: string | null
          url?: string | null
          year?: string | null
        }
        Relationships: []
      }
      respostas_alunos: {
        Row: {
          aluno_id: string
          banca: string | null
          created_at: string
          data_resposta: string | null
          disciplina: string | null
          id: string
          is_correta: boolean
          opcao_id: string
          questao_id: string
          topicos: string[] | null
        }
        Insert: {
          aluno_id: string
          banca?: string | null
          created_at?: string
          data_resposta?: string | null
          disciplina?: string | null
          id?: string
          is_correta: boolean
          opcao_id: string
          questao_id: string
          topicos?: string[] | null
        }
        Update: {
          aluno_id?: string
          banca?: string | null
          created_at?: string
          data_resposta?: string | null
          disciplina?: string | null
          id?: string
          is_correta?: boolean
          opcao_id?: string
          questao_id?: string
          topicos?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "respostas_alunos_questao_id_fkey"
            columns: ["questao_id"]
            isOneToOne: false
            referencedRelation: "questoes"
            referencedColumns: ["id"]
          },
        ]
      }
      respostas_simulados: {
        Row: {
          acertos: number
          aluno_id: string
          created_at: string | null
          erros: number
          id: string
          nota: number
          simulado_id: string
          updated_at: string | null
        }
        Insert: {
          acertos?: number
          aluno_id: string
          created_at?: string | null
          erros?: number
          id?: string
          nota?: number
          simulado_id: string
          updated_at?: string | null
        }
        Update: {
          acertos?: number
          aluno_id?: string
          created_at?: string | null
          erros?: number
          id?: string
          nota?: number
          simulado_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_simulado"
            columns: ["simulado_id"]
            isOneToOne: false
            referencedRelation: "simulados"
            referencedColumns: ["id"]
          },
        ]
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
          ranking_is_public: boolean | null
          ranking_updated_at: string | null
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
          ranking_is_public?: boolean | null
          ranking_updated_at?: string | null
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
          ranking_is_public?: boolean | null
          ranking_updated_at?: string | null
          titulo?: string
        }
        Relationships: []
      }
      site_visits: {
        Row: {
          browser: string | null
          city: string | null
          country: string | null
          created_at: string | null
          device_type: string | null
          id: string
          ip_address: string | null
          os: string | null
          path: string
          referrer: string | null
          region: string | null
          session_id: string | null
          time_on_page: number | null
          user_agent: string | null
          user_id: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          browser?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          device_type?: string | null
          id?: string
          ip_address?: string | null
          os?: string | null
          path: string
          referrer?: string | null
          region?: string | null
          session_id?: string | null
          time_on_page?: number | null
          user_agent?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          browser?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          device_type?: string | null
          id?: string
          ip_address?: string | null
          os?: string | null
          path?: string
          referrer?: string | null
          region?: string | null
          session_id?: string | null
          time_on_page?: number | null
          user_agent?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: []
      }
      topicos: {
        Row: {
          abrir_em_nova_guia: boolean | null
          assunto: string | null
          caderno_questoes_url: string | null
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
          abrir_em_nova_guia?: boolean | null
          assunto?: string | null
          caderno_questoes_url?: string | null
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
          abrir_em_nova_guia?: boolean | null
          assunto?: string | null
          caderno_questoes_url?: string | null
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
      user_activity_logs: {
        Row: {
          created_at: string
          description: string | null
          event_type: string
          id: string
          metadata: Json | null
          page: string | null
          resource_id: string | null
          resource_type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          page?: string | null
          resource_id?: string | null
          resource_type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          page?: string | null
          resource_id?: string | null
          resource_type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_course_enrollments: {
        Row: {
          course_id: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_delete_caderno: {
        Args: { p_caderno_id: string }
        Returns: undefined
      }
      admin_duplicate_caderno: {
        Args: {
          p_caderno_id: string
          p_novo_nome: string
          p_novo_user_id: string
          p_is_public: boolean
        }
        Returns: string
      }
      admin_get_caderno: {
        Args: { p_caderno_id: string }
        Returns: {
          id: string
          nome: string
          created_at: string
          user_id: string
          is_public: boolean
          total_questions: number
          answered_questions: number
          correct_answers: number
          wrong_answers: number
          user_email: string
        }[]
      }
      admin_list_cadernos: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          nome: string
          created_at: string
          user_id: string
          is_public: boolean
          total_questions: number
          answered_questions: number
          correct_answers: number
          wrong_answers: number
          user_email: string
        }[]
      }
      admin_update_caderno: {
        Args: { p_caderno_id: string; p_nome: string; p_is_public: boolean }
        Returns: undefined
      }
      check_can_delete_post: {
        Args: { post_id: string }
        Returns: Json
      }
      check_is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      check_table_exists: {
        Args: { in_table_name: string; in_schema_name?: string }
        Returns: boolean
      }
      clear_all_question_stats: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      clear_question_stats: {
        Args: { question_id: string }
        Returns: undefined
      }
      decrement_post_comment_count: {
        Args: { post_id: number } | { post_id: string }
        Returns: undefined
      }
      exec_sql: {
        Args: { sql: string }
        Returns: Json
      }
      get_comment_ranking: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_id: string
          display_name: string
          avatar_url: string
          comment_count: number
          total_likes: number
        }[]
      }
      get_question_attempts_ranking: {
        Args: Record<PropertyKey, never>
        Returns: {
          ranking_position: number
          user_id: string
          display_name: string
          avatar_url: string
          total_attempts: number
          correct_answers: number
          wrong_answers: number
          success_rate: number
        }[]
      }
      get_question_attempts_ranking_by_period: {
        Args: { in_period: string }
        Returns: {
          ranking_position: number
          user_id: string
          display_name: string
          avatar_url: string
          total_attempts: number
          correct_answers: number
          wrong_answers: number
          success_rate: number
        }[]
      }
      get_questoes_por_disciplina: {
        Args: Record<PropertyKey, never>
        Returns: {
          disciplina: string
          total_questoes: number
        }[]
      }
      get_simulado_ranking: {
        Args: { p_simulado_id: string }
        Returns: {
          ranking_position: number
          user_id: string
          nome: string
          acertos: number
          erros: number
          aproveitamento: number
          created_at: string
        }[]
      }
      get_user_courses: {
        Args: { user_id_param: string }
        Returns: {
          course_id: string
          created_at: string
        }[]
      }
      handle_comment_created: {
        Args: { comment_id: number }
        Returns: undefined
      }
      handle_comment_deleted: {
        Args: { comment_id: number }
        Returns: undefined
      }
      handle_new_user: {
        Args: { user_id: number }
        Returns: undefined
      }
      increment: {
        Args: { value: number; row_id: string; column_name: string }
        Returns: number
      }
      increment_blog_post_comments: {
        Args: { post_id: number } | { post_id: string }
        Returns: undefined
      }
      increment_blog_post_likes: {
        Args: { post_id: string }
        Returns: boolean
      }
      increment_comment_likes: {
        Args: { comment_id: number } | { comment_id: string }
        Returns: undefined
      }
      increment_post_comment_count: {
        Args: { post_id: number } | { post_id: string }
        Returns: undefined
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_admin_or_staff: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_own_profile: {
        Args: { profile_id: string }
        Returns: boolean
      }
      recalculate_all_cadernos_statistics: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      recalculate_caderno_statistics: {
        Args: { caderno_id: string }
        Returns: undefined
      }
      recalculate_user_cadernos_statistics: {
        Args: { user_id: string }
        Returns: undefined
      }
      reset_blog_post_likes: {
        Args: { post_id: string }
        Returns: boolean
      }
      sync_missing_users: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      table_exists: {
        Args: { table_name: string }
        Returns: boolean
      }
      update_updated_at_column: {
        Args: { record_id: number }
        Returns: undefined
      }
      update_user_question_attempts_updated_at: {
        Args: { attempt_id: number }
        Returns: undefined
      }
      update_user_role: {
        Args: { user_id: string; new_role: string; new_nivel: string }
        Returns: undefined
      }
      update_users_ultimo_login: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      upsert_user_question_attempt: {
        Args:
          | { p_user_id: string; p_question_id: string; p_is_correct: boolean }
          | { user_id: number; question_id: number; attempt_data: Json }
        Returns: undefined
      }
    }
    Enums: {
      user_role: "admin" | "aluno" | "professor"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_role: ["admin", "aluno", "professor"],
    },
  },
} as const
