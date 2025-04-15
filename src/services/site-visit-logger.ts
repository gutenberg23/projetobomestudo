import { supabase } from '@/lib/supabase';

// Serviço para registrar visitas ao site
export const SiteVisitLogger = {
  /**
   * Registra uma visita ao site
   */
  async logVisit(path: string) {
    try {
      // Obter usuário atual (se estiver logado)
      const { data: { user } } = await supabase.auth.getUser();
      
      // Obter informações do navegador
      const userAgent = navigator.userAgent;
      
      // Registrar visita
      const { error } = await supabase
        .from('site_visits')
        .insert({
          path,
          user_id: user?.id || null,
          user_agent: userAgent,
          // Não podemos obter o IP diretamente do cliente por questões de segurança
          // No servidor isso seria possível
          ip_address: null
        });
      
      if (error) {
        console.error('Erro ao registrar visita:', error);
      }
    } catch (error) {
      console.error('Erro ao registrar visita:', error);
    }
  },
  
  /**
   * Conta o número de acessos ao site por período
   */
  async countVisits(period: 'day' | 'week' | 'month' | 'year'): Promise<number> {
    try {
      const now = new Date();
      let startDate = new Date();
      
      // Definir o início do período
      switch (period) {
        case 'day':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      // Contar acessos
      const { count, error } = await supabase
        .from('site_visits')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate.toISOString())
        .lte('created_at', now.toISOString());
      
      if (error) {
        console.error(`Erro ao contar acessos (${period}):`, error);
        return 0;
      }
      
      return count || 0;
    } catch (error) {
      console.error(`Erro ao contar acessos (${period}):`, error);
      return 0;
    }
  }
}; 