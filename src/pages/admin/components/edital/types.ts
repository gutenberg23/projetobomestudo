
export interface Disciplina {
  id: string;
  titulo: string;
  descricao: string;
  topicos: string[];
  selecionada: boolean;
}

export interface Edital {
  id: string;
  titulo: string;
  disciplinasIds: string[];
  cursoId: string;
  ativo: boolean;
}
