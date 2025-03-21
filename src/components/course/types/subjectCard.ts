
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

export interface SimpleUserProgress {
  subjects_data: Record<string, {
    lessons?: Record<string, {
      completed: boolean;
    }>;
    stats?: {
      hits: number;
      errors: number;
    };
  }>;
}

export interface LessonData {
  id: string;
  titulo: string;
  concluida: boolean;
  questoesIds: string[];
  stats: {
    total: number;
    hits: number;
    errors: number;
  };
}

export interface SubjectCardProps {
  subject: any;
  isExpanded: boolean;
  onToggle: () => void;
}
