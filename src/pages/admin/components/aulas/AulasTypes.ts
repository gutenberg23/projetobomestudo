export interface Aula {
  id: string;
  titulo: string;
  /** Texto "No edital": tópicos do edital cobertos pela aula */
  descricao: string;
  topicosIds: string[];
  questoesIds: string[];
  selecionada?: boolean;
  totalQuestoes?: number;
}
