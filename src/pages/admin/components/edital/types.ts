
export interface Disciplina {
  id: string;
  titulo: string;
  descricao: string;
  topicos: string[];
  importancia: number[];
  links: string[];
  selecionada: boolean;
}

export interface Edital {
  id: string;
  titulo: string;
  disciplinas_ids: string[];
  curso_id: string;
  ativo: boolean;
  created_at?: string;
}
