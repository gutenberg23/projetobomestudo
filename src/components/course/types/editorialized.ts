
export type Subject = {
  id: string | number;
  name: string;
  topics: Topic[];
};

export type Topic = {
  id: number;
  name: string;
  topic: string;
  isDone: boolean;
  isReviewed: boolean;
  importance: number;
  link?: string;
  difficulty: "Muito Difícil" | "Difícil" | "Médio" | "Fácil" | "Muito Fácil";
  exercisesDone: number;
  hits: number;
  errors: number;
  performance: number;
};

export type SubjectStats = {
  exercisesDone: number;
  hits: number;
  errors: number;
  completedTopics: number;
  totalTopics: number;
};

export type OverallStats = {
  totalExercises: number;
  totalHits: number;
  totalErrors: number;
  completedTopics: number;
  totalTopics: number;
};

// Tipos simples para dados do Supabase
export type SupabaseAula = {
  id: string;
  titulo: string;
  disciplina_id?: string | number;
  questoes_ids?: string[];
  [key: string]: any; // Para outros campos que podem existir
};

export type SupabaseResposta = {
  questao_id: string;
  is_correta: boolean;
  created_at: string;
  [key: string]: any; // Para outros campos que podem existir
};

export type SupabaseProgress = {
  subjects_data?: Record<string, {
    completed?: boolean;
    lessons?: Record<string, {
      completed?: boolean;
    }>;
    stats?: {
      hits?: number;
      errors?: number;
    };
  }>;
  [key: string]: any; // Para outros campos que podem existir
};
