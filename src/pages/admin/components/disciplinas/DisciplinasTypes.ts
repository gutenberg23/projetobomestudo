export interface Disciplina {
  id: string;
  titulo: string;
  /** Guarda a nota de rating (1 a 10) */
  descricao: string;
  banca?: string;
  aulasIds: string[];
  topicosIds?: string[];
  totalQuestoes?: number;
  favoritos?: number;
}
