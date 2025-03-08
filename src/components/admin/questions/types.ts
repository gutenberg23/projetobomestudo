
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
