import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Lesson {
  id: string;
  title: string;
  description?: string;
  sections: Section[];
}

export interface Section {
  id: string;
  title: string;
  videoUrl: string;
  isActive: boolean;
  professorId?: string;
  professorNome?: string;
  contentType: "video" | "text" | "quiz" | "assignment" | "discussion" | "other";
  abrirEmNovaGuia?: boolean;
}

// Interface para o tipo de tópico do banco de dados
interface TopicoDatabase {
  id: string;
  nome: string;
  video_url: string;
  professor_id: string;
  professor_nome: string;
  abrir_em_nova_guia?: boolean;
}

export const useFetchSubjectInfo = (subjectId?: string) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Extrair a função fetchSubjectInfo para ser exportada
  const fetchSubjectInfo = async (subjId: string): Promise<string[]> => {
    try {
      if (!subjId) {
        return [];
      }
      
      // Buscar aulas relacionadas ao assunto
      const { data, error } = await supabase
        .from('disciplinas')
        .select('aulas_ids')
        .eq('id', subjId)
        .single();
        
      if (error) {
        console.error('Erro ao buscar aulas da disciplina:', error);
        return [];
      }
      
      // Retornar o array de IDs na ordem correta
      return Array.isArray(data?.aulas_ids) ? data.aulas_ids : [];
    } catch (error) {
      console.error('Erro ao buscar informações do assunto:', error);
      return [];
    }
  };

  // Buscar aulas e tópicos
  useEffect(() => {
    if (subjectId) {
      fetchLessonsData();
    }
  }, [subjectId]);

  const fetchLessonsData = async () => {
    if (!subjectId) {
      setLoading(false);
      setLessons([]);
      return;
    }

    try {
      setLoading(true);
      
      // Buscar aulas relacionadas ao assunto usando a função extraída
      const aulasIds = await fetchSubjectInfo(subjectId);
      
      if (aulasIds.length === 0) {
        setLessons([]);
        setLoading(false);
        return;
      }
      
      // Buscar detalhes das aulas
      const { data: aulasData, error: aulasError } = await supabase
        .from('aulas')
        .select('*')
        .in('id', aulasIds);
        
      if (aulasError) {
        throw aulasError;
      }

      // Ordenar as aulas de acordo com a ordem em aulasIds
      const aulasOrdenadas = aulasIds
        .map(id => aulasData?.find(aula => aula.id === id))
        .filter((aula): aula is NonNullable<typeof aula> => aula != null);
      
      // Transformar os dados em um formato adequado para o componente
      const formattedLessons = await Promise.all(aulasOrdenadas.map(async (aula) => {
        let sections: Section[] = [];
        
        if (aula.topicos_ids && aula.topicos_ids.length > 0) {
          const { data: topicosData, error: topicosError } = await supabase
            .from('topicos')
            .select('*')
            .in('id', aula.topicos_ids);
            
          if (topicosError) {
            console.error('Erro ao buscar tópicos:', topicosError);
          } else {
            // Log de todos os tópicos retornados do banco
            
            sections = aula.topicos_ids
              .map((id: string) => topicosData?.find((topico: TopicoDatabase) => topico.id === id))
              .filter((topico: any): topico is NonNullable<typeof topico> => topico != null)
              .map((topico: TopicoDatabase) => {
                // Logs detalhados para verificar os valores exatos
                
                // Verificar também se existe a propriedade no objeto
                
                // Verificar a propriedade 'abrir_em_nova_aba' (possível erro de nome)
                
                // Converter abrir_em_nova_guia para boolean de forma mais segura
                let abrirEmNovaGuia = false;
                
                // Obter o valor de qualquer uma das propriedades que possa existir
                const abrirEmNovaGuiaValue = topico.abrir_em_nova_guia !== undefined 
                  ? topico.abrir_em_nova_guia 
                  : (topico as any).abrir_em_nova_aba;
                
                // Conversões para diferentes tipos de valores
                if (abrirEmNovaGuiaValue === true) {
                  abrirEmNovaGuia = true;
                } else if (String(abrirEmNovaGuiaValue).toLowerCase() === 'true') {
                  abrirEmNovaGuia = true;
                } else if (Number(abrirEmNovaGuiaValue) === 1) {
                  abrirEmNovaGuia = true;
                }
                
                
                const section = {
                  id: topico.id,
                  title: topico.nome,
                  videoUrl: topico.video_url || '',
                  isActive: false, // Será atualizado pelo progresso do usuário
                  professorId: topico.professor_id,
                  professorNome: topico.professor_nome,
                  contentType: "video" as const,
                  abrirEmNovaGuia: topico.abrir_em_nova_guia === true ? true : false
                };
                
                return section;
              });
          }
        }
        
        return {
          id: aula.id,
          title: aula.titulo,
          description: aula.descricao,
          sections: sections
        };
      }));
      
      setLessons(formattedLessons);
    } catch (error) {
      console.error('Erro ao buscar aulas:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
      setLessons([]);
    } finally {
      setLoading(false);
    }
  };

  return { lessons, loading, error, fetchSubjectInfo };
};
