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
  aiExplanation: string;
  expandableContent: string;
  options: QuestionOption[];
  topicos: string[];
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

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Topico {
  id: string;
  nome: string;
  disciplina: string;
  professor_id: string;
  professor_nome: string;
  created_at?: string;
}

export interface CourseItemType {
  id: string;
  titulo: string;
  descricao: string;
  isFavorite: boolean;
  topics: number;
  lessons: number;
  informacoes_curso?: string;
  friendlyUrl?: string;
}

export interface DisciplinaItemType {
  id: string;
  titulo: string;
  descricao: string;
  isFavorite: boolean;
  topics: number;
  lessons: number;
  friendlyUrl?: string;
  banca?: string;
}

export interface Assunto {
  id: string;
  nome: string;
  disciplina: string;
  patrocinador?: string;
  questoes_ids?: string[];
}

export interface FilterItem {
  label: string;
  value: string;
  isActive: boolean;
}

export interface Filters {
  disciplina: FilterItem;
  nivel: FilterItem;
  institution: FilterItem;
  organization: FilterItem;
  role: FilterItem;
  ano: FilterItem;
  dificuldade: FilterItem;
  questionType: FilterItem;
  topicos: FilterItem;
}
