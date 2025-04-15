import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ActivityLogger } from '@/services/activity-logger';
import { SiteVisitLogger } from '@/services/site-visit-logger';

interface ActivityTrackerProps {
  children: React.ReactNode;
}

// Componente para rastrear atividades do usuário na aplicação
const ActivityTracker: React.FC<ActivityTrackerProps> = ({ children }) => {
  const location = useLocation();

  // Rastrear mudanças de rota/página
  useEffect(() => {
    // Handler para mudanças de rota
    const handleRouteChange = (url: string) => {
      // Ignorar rotas que não devem ser rastreadas
      if (url.startsWith('/api/')) {
        return;
      }

      // Extrair o nome da página da URL
      const pageName = url.split('?')[0] || '/';
      
      // Registrar visualização da página no sistema de atividades
      ActivityLogger.logPageView(pageName);
      
      // Registrar visita na nova tabela site_visits
      SiteVisitLogger.logVisit(pageName);
    };

    // Registrar a página atual no carregamento inicial
    handleRouteChange(location.pathname);

  }, [location.pathname]);

  return <>{children}</>;
};

export default ActivityTracker; 