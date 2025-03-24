
// Tipos para aulas e progresso do usuário
export interface SimpleAula {
  id: string;
  titulo: string;
  questoes_ids?: string[];
}

export interface LessonProgressData {
  completed: boolean;
}

export interface SubjectLessonsData {
  [lessonId: string]: LessonProgressData;
}

export interface CompletedLessons {
  [lessonId: string]: boolean;
}

export interface SubjectProgressData {
  lessons?: SubjectLessonsData;
  completed_lessons?: CompletedLessons;
  stats?: {
    hits: number;
    errors: number;
  };
}

export interface UserProgressData {
  [subjectId: string]: SubjectProgressData;
}

export interface LessonStatsData {
  total: number;
  hits: number;
  errors: number;
}

export interface ProcessedLesson {
  id: string;
  titulo: string;
  concluida: boolean;
  questoesIds: string[];
  stats: LessonStatsData;
}

export interface FetchLessonsResult {
  lessons: ProcessedLesson[];
  loading: boolean;
}
