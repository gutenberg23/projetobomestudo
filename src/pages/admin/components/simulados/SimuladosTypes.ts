/** Uma linha da tabela simulados (um simulado ligado a um curso). */
export interface SimuladoLinha {
  id: string;
  titulo: string;
  descricao: string | null;
  questoes_ids: string[];
  quantidade_questoes?: number | null;
  curso_id: string;
  data_fim: string | null;
  ativo: boolean;
  created_at?: string;
}

/**
 * Simulados com o mesmo título são o mesmo simulado aplicado a vários cursos
 * (é assim que a edição "vincula" cursos: uma linha por curso).
 */
export interface GrupoSimulado {
  chave: string;
  titulo: string;
  descricao: string;
  questoes: number;
  dataFim: string | null;
  linhas: SimuladoLinha[];
  /** ativo em todos os cursos / em parte / em nenhum */
  ativo: "todos" | "parcial" | "nenhum";
  encerrado: boolean;
  criadoEm: string;
}
