// Define simplified types to avoid deep instantiation issues
export interface SimpleDisciplina {
  id: string;
  titulo: string;
  aulas_ids?: string[];
}

export interface SimpleAula {
  id: string;
  titulo: string;
  disciplina_id?: string;
  id_disciplina?: string;
  disciplina?: string;
  questoes_ids?: string[];
}

export interface SimpleQuestao {
  id: string;
}

export interface SimpleResposta {
  questao_id: string;
  is_correta: boolean;
  created_at: string;
}

// Estrutura simplificada para dados de progresso do usuário
export interface LessonProgress {
  completed: boolean;
}

export interface SubjectProgress {
  lessons?: Record<string, LessonProgress>;
  stats?: {
    hits: number;
    errors: number;
  };
}

export interface UserProgress {
  subjects_data: Record<string, SubjectProgress>;
}

export interface LessonData {
  id: string;
  titulo: string;
  concluida: boolean;
  questoesIds: string[];
  topicosIds?: string[];
  stats: {
    total: number;
    hits: number;
    errors: number;
  };
}

export interface SubjectCardProps {
  subject: {
    id: string | number;
    name?: string;
    titulo?: string;
    courseId?: string;
    progress?: number;
    questionsTotal?: number;
    questionsCorrect?: number;
    questionsWrong?: number;
    topics?: any[];
    stats?: {
      totalTopics?: number;
      completedTopics?: number;
      exercisesDone?: number;
      hits?: number;
      errors?: number;
    };
  };
  isExpanded: boolean;
  onToggle: () => void;
}

export interface SubjectStatsResult {
  progress: number;
  questionsTotal: number;
  questionsCorrect: number;
  questionsWrong: number;
  aproveitamento: number;
}
