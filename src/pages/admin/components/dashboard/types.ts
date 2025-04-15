// Tipos de dados para o dashboard
export interface CadastrosData {
  name: string;
  usuarios: number;
}

export interface DisciplinasQuestoesData {
  name: string;
  quantidade: number;
}

export interface AcessosData {
  name: string;
  acessos: number;
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
  dadosAcessos: AcessosData[];
  disciplinasQuestoes: DisciplinasQuestoesData[];
  estatisticas: Estatisticas;
}
