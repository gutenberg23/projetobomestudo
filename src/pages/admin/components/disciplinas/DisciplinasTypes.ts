export interface Disciplina {
  id: string;
  titulo: string;
  /** Antiga nota de rating (1 a 10). Agora a relevância é dada em cada curso (cursos.relevancia_por_disciplina) */
  descricao: string;
  banca?: string;
  /** Disciplina das questões usada na aba Estatísticas (vazio = automático) */
  disciplinaQuestoes?: string;
  /** Teorias da disciplina, na ordem em que aparecem para o aluno */
  teoriasIds: string[];
  favoritos?: number;
}
