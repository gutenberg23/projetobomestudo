// Tipos de dados para o dashboard
export interface CadastrosData {
  name: string;
  usuarios: number;
}

export interface DisciplinasQuestoesData {
  name: string;
  quantidade: number;
}

export interface Estatisticas {
  totalUsuarios: number;
  novosUsuariosAno: number;
  novosUsuariosMes: number;
  novosUsuariosSemana: number;
  novosUsuariosDia: number;
  totalAcessosAno: number;
  totalAcessosMes: number;
  totalAcessosSemana: number;
  totalAcessosDia: number;
  totalCursos: number;
  totalDisciplinas: number;
  totalAulas: number;
  totalTopicos: number;
  totalCadernos: number;
  totalQuestoes: number;
  totalConcursos: number;
  totalSimulados: number;
  totalEditaisVerticalizados: number;
  totalPostsBlog: number;
}

export interface DashboardData {
  dadosCadastros: CadastrosData[];
  dadosAcessos: any[]; // Mantido apenas para compatibilidade, mas não é mais usado
  disciplinasQuestoes: DisciplinasQuestoesData[];
  estatisticas: Estatisticas;
}
