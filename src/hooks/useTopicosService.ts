import { useState, useEffect } from 'react';
import { supabaseAdmin } from '@/lib/admin/supabaseAdmin';

export interface UseTopicosServiceResult {
  topicos: string[];
  isLoading: boolean;
  error: string | null;
}

export function useTopicosService(
  disciplina: string | null,
  assuntos: string[],
  initialAssunto?: string
): UseTopicosServiceResult {
  const [topicos, setTopicos] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopicos = async () => {
      if (!disciplina || assuntos.length === 0) {
        setTopicos([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Usar o serviço do supabaseAdmin para buscar tópicos
        const { data, error } = await supabaseAdmin.buscarTopicos(disciplina, assuntos);

        if (error) {
          throw new Error(error.message || 'Erro ao buscar tópicos');
        }

        if (data) {
          // Extrair apenas os nomes dos tópicos
          const topicosList = data.map(topico => topico.nome || topico);
          setTopicos(topicosList);
        } else {
          setTopicos([]);
        }
      } catch (err) {
        console.error('Erro ao buscar tópicos:', err);
        setError(err instanceof Error ? err.message : 'Erro ao buscar tópicos');
        setTopicos([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopicos();
  }, [disciplina, assuntos, initialAssunto]);

  return { topicos, isLoading, error };
} 