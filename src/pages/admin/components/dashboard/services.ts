import { supabase } from '@/lib/supabase';
import { DashboardData, CadastrosData, AcessosData, DisciplinasQuestoesData, Estatisticas } from './types';
import { SiteVisitLogger } from '@/services/site-visit-logger';

// Função para obter o início e fim de diferentes períodos
export const getPeriodRange = (period: 'day' | 'week' | 'month' | 'year'): { start: Date, end: Date } => {
  const end = new Date();
  const start = new Date();
  
  switch(period) {
    case 'day':
      start.setHours(0, 0, 0, 0);
      break;
    case 'week':
      start.setDate(start.getDate() - 7);
      break;
    case 'month':
      start.setMonth(start.getMonth() - 1);
      break;
    case 'year':
      start.setFullYear(start.getFullYear() - 1);
      break;
  }
  
  return { start, end };
};

// Função para obter total de usuários cadastrados
export const getTotalUsuarios = async (): Promise<number> => {
  const { count, error } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });
    
  if (error) {
    console.error('Erro ao buscar total de usuários:', error);
    return 0;
  }
  
  return count || 0;
};

// Função para obter novos usuários por período
export const getNovosUsuarios = async (period: 'day' | 'week' | 'month' | 'year'): Promise<number> => {
  const { start, end } = getPeriodRange(period);
  
  const { count, error } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', start.toISOString())
    .lte('created_at', end.toISOString());
    
  if (error) {
    console.error(`Erro ao buscar usuários novos (${period}):`, error);
    return 0;
  }
  
  return count || 0;
};

// Função para obter acessos por período
export const getAcessos = async (period: 'day' | 'week' | 'month' | 'year'): Promise<number> => {
  try {
    // Usar o SiteVisitLogger
    const count = await SiteVisitLogger.countVisits(period);
    return count;
  } catch (error) {
    console.error(`Erro ao buscar acessos (${period}):`, error);
    return 0;
  }
};

// Função para obter total de cursos
export const getTotalCursos = async (): Promise<number> => {
  const { count, error } = await supabase
    .from('cursos')
    .select('*', { count: 'exact', head: true });
    
  if (error) {
    console.error('Erro ao buscar total de cursos:', error);
    return 0;
  }
  
  return count || 0;
};

// Função para obter total de disciplinas
export const getTotalDisciplinas = async (): Promise<number> => {
  const { count, error } = await supabase
    .from('disciplinas')
    .select('*', { count: 'exact', head: true });
    
  if (error) {
    console.error('Erro ao buscar total de disciplinas:', error);
    return 0;
  }
  
  return count || 0;
};

// Função para obter total de aulas
export const getTotalAulas = async (): Promise<number> => {
  const { count, error } = await supabase
    .from('aulas')
    .select('*', { count: 'exact', head: true });
    
  if (error) {
    console.error('Erro ao buscar total de aulas:', error);
    return 0;
  }
  
  return count || 0;
};

// Função para obter total de tópicos
export const getTotalTopicos = async (): Promise<number> => {
  const { count, error } = await supabase
    .from('topicos')
    .select('*', { count: 'exact', head: true });
    
  if (error) {
    console.error('Erro ao buscar total de tópicos:', error);
    return 0;
  }
  
  return count || 0;
};

// Função para obter total de cadernos
export const getTotalCadernos = async (): Promise<number> => {
  const { count, error } = await supabase
    .from('cadernos_questoes')
    .select('*', { count: 'exact', head: true });
    
  if (error) {
    console.error('Erro ao buscar total de cadernos:', error);
    return 0;
  }
  
  return count || 0;
};

// Função para obter total de questões
export const getTotalQuestoes = async (): Promise<number> => {
  const { count, error } = await supabase
    .from('questoes')
    .select('*', { count: 'exact', head: true });
    
  if (error) {
    console.error('Erro ao buscar total de questões:', error);
    return 0;
  }
  
  return count || 0;
};

// Função para obter total de concursos
export const getTotalConcursos = async (): Promise<number> => {
  const { count, error } = await supabase
    .from('concursos')
    .select('*', { count: 'exact', head: true });
    
  if (error) {
    console.error('Erro ao buscar total de concursos:', error);
    return 0;
  }
  
  return count || 0;
};

// Função para obter total de simulados
export const getTotalSimulados = async (): Promise<number> => {
  const { count, error } = await supabase
    .from('simulados')
    .select('*', { count: 'exact', head: true });
    
  if (error) {
    console.error('Erro ao buscar total de simulados:', error);
    return 0;
  }
  
  return count || 0;
};

// Função para obter total de editais verticalizados
export const getTotalEditaisVerticalizados = async (): Promise<number> => {
  const { count, error } = await supabase
    .from('cursoverticalizado')
    .select('*', { count: 'exact', head: true });
    
  if (error) {
    console.error('Erro ao buscar total de editais verticalizados:', error);
    return 0;
  }
  
  return count || 0;
};

// Função para obter total de posts no blog
export const getTotalPostsBlog = async (): Promise<number> => {
  const { count, error } = await supabase
    .from('blog_posts')
    .select('*', { count: 'exact', head: true });
    
  if (error) {
    console.error('Erro ao buscar total de posts no blog:', error);
    return 0;
  }
  
  return count || 0;
};

// Função para obter evolução de usuários cadastrados por mês/ano
export const getEvolucaoUsuarios = async (): Promise<CadastrosData[]> => {
  // Meses em português em formato abreviado
  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const anoAtual = new Date().getFullYear();
  const evolucaoUsuarios: CadastrosData[] = [];
  
  // Buscar dados para cada mês
  for (let mes = 0; mes < 12; mes++) {
    const dataInicio = new Date(anoAtual, mes, 1);
    const dataFim = new Date(anoAtual, mes + 1, 0);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .gte('created_at', dataInicio.toISOString())
      .lte('created_at', dataFim.toISOString());
      
    if (error) {
      console.error(`Erro ao buscar usuários para o mês ${mes + 1}:`, error);
      evolucaoUsuarios.push({ name: meses[mes], usuarios: 0 });
    } else {
      evolucaoUsuarios.push({ name: meses[mes], usuarios: data.length });
    }
  }
  
  return evolucaoUsuarios;
};

// Função para obter evolução de acessos por mês/ano
export const getEvolucaoAcessos = async (): Promise<AcessosData[]> => {
  // Meses em português em formato abreviado
  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const anoAtual = new Date().getFullYear();
  const evolucaoAcessos: AcessosData[] = [];
  
  // Buscar dados para cada mês
  for (let mes = 0; mes < 12; mes++) {
    const dataInicio = new Date(anoAtual, mes, 1);
    const dataFim = new Date(anoAtual, mes + 1, 0);
    
    const { count, error } = await supabase
      .from('site_visits')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', dataInicio.toISOString())
      .lte('created_at', dataFim.toISOString());
      
    if (error) {
      console.error(`Erro ao buscar acessos para o mês ${mes + 1}:`, error);
      evolucaoAcessos.push({ name: meses[mes], acessos: 0 });
    } else {
      evolucaoAcessos.push({ name: meses[mes], acessos: count || 0 });
    }
  }
  
  return evolucaoAcessos;
};

// Função para obter disciplinas com mais questões
export const getDisciplinasQuestoes = async (): Promise<DisciplinasQuestoesData[]> => {
  const { data, error } = await supabase
    .rpc('get_questoes_por_disciplina');
    
  if (error) {
    console.error('Erro ao buscar questões por disciplina:', error);
    return [];
  }
  
  // Mapear os resultados para o formato esperado
  return data.map((item: any) => ({
    name: item.disciplina,
    quantidade: item.total_questoes
  }));
};

// Função para obter todas as estatísticas do dashboard
export const getEstatisticas = async (): Promise<Estatisticas> => {
  const [
    totalUsuarios,
    novosUsuariosAno,
    novosUsuariosMes,
    novosUsuariosSemana,
    novosUsuariosDia,
    totalAcessosAno,
    totalAcessosMes,
    totalAcessosSemana,
    totalAcessosDia,
    totalCursos,
    totalDisciplinas,
    totalAulas,
    totalTopicos,
    totalCadernos,
    totalQuestoes,
    totalConcursos,
    totalSimulados,
    totalEditaisVerticalizados,
    totalPostsBlog,
  ] = await Promise.all([
    getTotalUsuarios(),
    getNovosUsuarios('year'),
    getNovosUsuarios('month'),
    getNovosUsuarios('week'),
    getNovosUsuarios('day'),
    getAcessos('year'),
    getAcessos('month'),
    getAcessos('week'),
    getAcessos('day'),
    getTotalCursos(),
    getTotalDisciplinas(),
    getTotalAulas(),
    getTotalTopicos(),
    getTotalCadernos(),
    getTotalQuestoes(),
    getTotalConcursos(),
    getTotalSimulados(),
    getTotalEditaisVerticalizados(),
    getTotalPostsBlog(),
  ]);
  
  return {
    totalUsuarios,
    novosUsuariosAno,
    novosUsuariosMes,
    novosUsuariosSemana,
    novosUsuariosDia,
    totalAcessosAno,
    totalAcessosMes,
    totalAcessosSemana,
    totalAcessosDia,
    totalCursos,
    totalDisciplinas,
    totalAulas,
    totalTopicos,
    totalCadernos,
    totalQuestoes,
    totalConcursos,
    totalSimulados,
    totalEditaisVerticalizados,
    totalPostsBlog
  };
};

// Função principal para carregar todos os dados do dashboard
export const loadDashboardData = async (): Promise<DashboardData> => {
  const [estatisticas, dadosCadastros, disciplinasQuestoes] = await Promise.all([
    getEstatisticas(),
    getEvolucaoUsuarios(),
    getDisciplinasQuestoes()
  ]);
  
  return {
    estatisticas,
    dadosCadastros,
    dadosAcessos: [], // Mantemos como array vazio para compatibilidade, já que removemos a aba
    disciplinasQuestoes
  };
}; 