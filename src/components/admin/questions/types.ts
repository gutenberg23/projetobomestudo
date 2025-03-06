
export interface Topico {
  id: string;
  nome: string;
  disciplina: string;
  patrocinador?: string;
  questoes_ids?: string[];
}

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuestionItemType {
  id: string;
  year: string;
  institution: string;
  organization: string;
  role: string;
  discipline: string;
  level: string;
  difficulty: string;
  questionType: string;
  content: string;
  teacherExplanation: string;
  aiExplanation?: string;
  expandableContent?: string;
  options: QuestionOption[];
  topicos?: string[];
}

export interface FiltersType {
  id: string;
  year: string;
  institution: string;
  organization: string;
  role: string;
  discipline: string;
  level: string;
  difficulty: string;
  questionType: string;
}
