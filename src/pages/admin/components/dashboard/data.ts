import { DashboardData } from './types';

// Dados do dashboard
export const dashboardData: DashboardData = {
  dadosCadastros: [
    { name: 'Jan', usuarios: 120 },
    { name: 'Fev', usuarios: 155 },
    { name: 'Mar', usuarios: 190 },
    { name: 'Abr', usuarios: 222 },
    { name: 'Mai', usuarios: 252 },
    { name: 'Jun', usuarios: 290 },
    { name: 'Jul', usuarios: 332 },
    { name: 'Ago', usuarios: 380 },
    { name: 'Set', usuarios: 430 },
    { name: 'Out', usuarios: 498 },
    { name: 'Nov', usuarios: 552 },
    { name: 'Dez', usuarios: 620 }
  ],
  dadosAcessos: [
    { name: 'Jan', acessos: 420 },
    { name: 'Fev', acessos: 540 },
    { name: 'Mar', acessos: 670 },
    { name: 'Abr', acessos: 810 },
    { name: 'Mai', acessos: 950 },
    { name: 'Jun', acessos: 1200 },
    { name: 'Jul', acessos: 1350 },
    { name: 'Ago', acessos: 1590 },
    { name: 'Set', acessos: 1750 },
    { name: 'Out', acessos: 2100 },
    { name: 'Nov', acessos: 2350 },
    { name: 'Dez', acessos: 2700 }
  ],
  disciplinasQuestoes: [
    { name: 'Direito Constitucional', quantidade: 1200 },
    { name: 'Direito Administrativo', quantidade: 950 },
    { name: 'Português', quantidade: 850 },
    { name: 'Matemática', quantidade: 780 },
    { name: 'Direito Civil', quantidade: 730 },
    { name: 'Raciocínio Lógico', quantidade: 650 },
    { name: 'Direito Processual', quantidade: 560 },
    { name: 'Informática', quantidade: 490 },
    { name: 'Direito Penal', quantidade: 430 },
    { name: 'Contabilidade', quantidade: 350 }
  ],
  estatisticas: {
    totalUsuarios: 620,
    novosUsuariosAno: 500,
    novosUsuariosMes: 68,
    novosUsuariosSemana: 15,
    novosUsuariosDia: 3,
    totalAcessosAno: 15430,
    totalAcessosMes: 2700,
    totalAcessosSemana: 680,
    totalAcessosDia: 98,
    totalCursos: 25,
    totalDisciplinas: 42,
    totalAulas: 320,
    totalTopicos: 1850,
    totalCadernos: 342,
    totalQuestoes: 7500,
    totalConcursos: 85,
    totalSimulados: 120,
    totalEditaisVerticalizados: 35,
    totalPostsBlog: 210
  }
};
