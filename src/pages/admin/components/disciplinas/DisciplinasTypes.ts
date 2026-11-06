export interface Disciplina {
  id: string;
  titulo: string;
  /** Guarda a nota de rating (1 a 10) */
  descricao: string;
  banca?: string;
  /** Disciplina das questões usada na aba Estatísticas (vazio = automático) */
  disciplinaQuestoes?: string;
  /** Teorias da disciplina, na ordem em que aparecem para o aluno */
  teoriasIds: string[];
  favoritos?: number;
}
