export interface Disciplina {
  id: string;
  titulo: string;
  descricao: string;
  topicos: string[];
  links: string[];
  assuntos: string[][];
  topicos_filtro: string[][];
  disciplinas_filtro: string[][];  // Nova propriedade para filtros de disciplina
  bancas_filtro: string[][];       // Nova propriedade para filtros de banca
  quantidade_questoes_filtro: number[]; // Nova propriedade para quantidade de questões
  importancia: number[];
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