
import { DashboardData } from './types';

// Dados do dashboard
export const dashboardData: DashboardData = {
  dadosAssinantes: [
    { name: 'Jan', ativos: 120, novos: 30, cancelados: 10 },
    { name: 'Fev', ativos: 140, novos: 35, cancelados: 15 },
    { name: 'Mar', ativos: 160, novos: 40, cancelados: 20 },
    { name: 'Abr', ativos: 180, novos: 45, cancelados: 25 },
    { name: 'Mai', ativos: 200, novos: 50, cancelados: 30 },
    { name: 'Jun', ativos: 220, novos: 40, cancelados: 20 },
    { name: 'Jul', ativos: 240, novos: 45, cancelados: 25 },
    { name: 'Ago', ativos: 260, novos: 50, cancelados: 30 },
    { name: 'Set', ativos: 280, novos: 55, cancelados: 35 },
    { name: 'Out', ativos: 300, novos: 60, cancelados: 40 },
    { name: 'Nov', ativos: 320, novos: 65, cancelados: 45 },
    { name: 'Dez', ativos: 340, novos: 70, cancelados: 50 }
  ],
  dadosReceita: [
    { name: 'Jan', receita: 12000, mrr: 10000 },
    { name: 'Fev', receita: 14000, mrr: 11000 },
    { name: 'Mar', receita: 16000, mrr: 12000 },
    { name: 'Abr', receita: 18000, mrr: 13000 },
    { name: 'Mai', receita: 20000, mrr: 14000 },
    { name: 'Jun', receita: 22000, mrr: 15000 },
    { name: 'Jul', receita: 24000, mrr: 16000 },
    { name: 'Ago', receita: 26000, mrr: 17000 },
    { name: 'Set', receita: 28000, mrr: 18000 },
    { name: 'Out', receita: 30000, mrr: 19000 },
    { name: 'Nov', receita: 32000, mrr: 20000 },
    { name: 'Dez', receita: 34000, mrr: 21000 }
  ],
  dadosPlanos: [
    { name: 'Mensal', value: 65 },
    { name: 'Trimestral', value: 15 },
    { name: 'Anual', value: 20 }
  ],
  cuponsAtivos: [
    { codigo: 'BEMVINDO10', desconto: '10%', validade: '30/06/2025', usos: 45, limite: 100 },
    { codigo: 'VOLTA20', desconto: '20%', validade: '15/04/2025', usos: 23, limite: 50 },
    { codigo: 'PROMO50', desconto: '50%', validade: '10/03/2025', usos: 18, limite: 20 }
  ],
  estatisticas: {
    assinantesAtivos: 340,
    novosAssinantes: 70,
    assinantesCancelados: 50,
    receitaTotal: 'R$ 34.000,00',
    receitaMensal: 'R$ 21.000,00',
    crescimentoAssinantes: '+10.3%',
    crescimentoReceita: '+7.8%',
    taxaCancelamento: '4.2%',
    projecaoProximoMes: 'R$ 37.000,00'
  }
};
