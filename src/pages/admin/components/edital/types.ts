
export interface Disciplina {
  id: string;
  titulo: string;
  descricao: string;
  topicos: string[];
  importancia: number[]; // Array para armazenar o valor de importância para cada tópico
  selecionada: boolean;
}

export interface Edital {
  id: string;
  titulo: string;
  disciplinasIds: string[];
  cursoId: string;
  ativo: boolean;
}
