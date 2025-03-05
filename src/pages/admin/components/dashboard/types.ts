
// Tipos de dados para o dashboard
export interface AssinanteData {
  name: string;
  ativos: number;
  novos: number;
  cancelados: number;
}

export interface ReceitaData {
  name: string;
  receita: number;
  mrr: number;
}

export interface PlanosData {
  name: string;
  value: number;
}

export interface CupomData {
  codigo: string;
  desconto: string;
  validade: string;
  usos: number;
  limite: number;
}

export interface Estatisticas {
  assinantesAtivos: number;
  novosAssinantes: number;
  assinantesCancelados: number;
  receitaTotal: string;
  receitaMensal: string;
  crescimentoAssinantes: string;
  crescimentoReceita: string;
  taxaCancelamento: string;
  projecaoProximoMes: string;
}

export interface DashboardData {
  dadosAssinantes: AssinanteData[];
  dadosReceita: ReceitaData[];
  dadosPlanos: PlanosData[];
  cuponsAtivos: CupomData[];
  estatisticas: Estatisticas;
}
