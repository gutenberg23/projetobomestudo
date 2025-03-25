export type Subject = {
  id: string | number;
  name: string;
  topics: Topic[];
  importance?: number;
  difficulty?: string;
  totalExercises?: number;
  correctAnswers?: number;
  isReviewed?: boolean;
};

export type Topic = {
  id: number;
  name: string;
  topic: string;
  title?: string;
  isDone: boolean;
  isReviewed: boolean;
  importance: number;
  link?: string;
  difficulty: "Muito Difícil" | "Difícil" | "Médio" | "Fácil" | "Muito Fácil" | string;
  exercisesDone: number;
  hits: number;
  errors: number;
  performance: number;
  totalExercises?: number;
  correctAnswers?: number;
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
