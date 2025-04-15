import { useState, useEffect } from 'react';
import { DashboardData } from '../types';
import { loadDashboardData } from '../services';
import { dashboardData as dadosEstaticos } from '../data';

export const useDashboardData = () => {
  const [data, setData] = useState<DashboardData>(dadosEstaticos);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const dadosReais = await loadDashboardData();
        setData(dadosReais);
      } catch (err) {
        console.error('Erro ao carregar dados do dashboard:', err);
        setError('Não foi possível carregar os dados do dashboard. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
}; 