
// Tipos básicos para estruturas simples
export type AnyObject = Record<string, any>;

// Tipos para análise e estatísticas
export interface OverallStats {
  hits: number;
  errors: number;
  total: number;
  hitRate: number;
  completedTopics: number;
  totalTopics: number;
  completionRate: number;
}

export interface SubjectStats {
  subjectId: string | number;
  subjectName: string;
  hits: number;
  errors: number;
  total: number;
  hitRate: number;
  completedTopics: number;
  totalTopics: number;
  completionRate: number;
}

// Tipos para tópicos e assuntos
export interface Topic {
  id: number;
  name: string;
  topic: string;
  isDone: boolean;
  isReviewed: boolean;
  importance: number;
  link: string;
  difficulty: string;
  exercisesDone: number;
  hits: number;
  errors: number;
  performance: number;
}

export interface Subject {
  id: string | number;
  name: string;
  rating: string;
  topics: Topic[];
}

// Tipos para dados do Supabase para evitar tipos excessivamente profundos
export interface SupabaseAula {
  id: string;
  titulo: string;
  descricao: string;
  duracao: number;
  ordem: number;
  tipo: string;
  topico_id: string;
  created_at: string;
  updated_at: string;
  video_url?: string;
  thumbnail?: string;
  status?: string;
}

export interface SupabaseResposta {
  id: string;
  usuario_id: string;
  questao_id: string;
  resposta: string;
  is_correta: boolean;
  created_at: string;
}

export interface SupabaseProgress {
  id: string;
  user_id: string;
  course_id: string;
  subjects_data: Subject[];
  performance_goal: number;
  exam_date: string | null;
  created_at: string;
  updated_at: string;
}

// Tipos para análise e estatísticas
export interface PerformanceData {
  hits: number;
  errors: number;
  total: number;
  hitRate: number;
  errorRate: number;
}

export interface SubjectPerformance {
  subjectId: string | number;
  subjectName: string;
  hits: number;
  errors: number;
  total: number;
  hitRate: number;
  exercisesDone: number;
  completionRate: number;
}

export interface CompletionStats {
  completedTopics: number;
  totalTopics: number;
  completionPercentage: number;
}

export interface StudyProgress {
  completedTopics: number;
  totalTopics: number;
  completionPercentage: number;
  subjects: SubjectProgress[];
}

export interface SubjectProgress {
  id: string | number;
  name: string;
  completedTopics: number;
  totalTopics: number;
  completionPercentage: number;
}

// Tipos para filtros e configurações
export interface StudyConfig {
  userId: string;
  courseId: string;
  performanceGoal: number;
  examDate: Date | null;
}

export interface StudyFilter {
  subject?: string | number;
  importance?: number[];
  difficulty?: string[];
  status?: ('done' | 'pending' | 'reviewed')[];
  search?: string;
}

export interface ExamPerformanceData {
  examDate: Date;
  performanceGoal: number;
  currentPerformance: number;
  daysLeft: number;
  topicsCompleted: number;
  totalTopics: number;
  completionRate: number;
}
