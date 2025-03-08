
export type TeacherStatus = "aprovado" | "pendente" | "rejeitado";

export interface TeacherData {
  id: string;
  nomeCompleto: string;
  email: string;
  linkYoutube: string;
  disciplina: string;
  instagram?: string;
  twitter?: string;
  facebook?: string;
  website?: string;
  fotoPerfil: string;
  status: TeacherStatus;
  dataCadastro: string;
  ativo: boolean;
  rating: number;
}

export interface TeacherFiltersState {
  termoPesquisa: string;
  filtroStatus: string;
  filtroDisciplina: string;
}

export interface Topico {
  id: string;
  nome: string;
  disciplina: string;
  patrocinador?: string;
  questoes_ids?: string[];
  professor_id?: string;
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
