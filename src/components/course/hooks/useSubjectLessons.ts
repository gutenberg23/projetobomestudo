
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { LessonData, SimpleAula } from '../types/subjectCard';

interface UseSubjectLessonsProps {
  subjectId: string;
  courseId?: string;
}

export const useSubjectLessons = ({ subjectId, courseId = 'default' }: UseSubjectLessonsProps) => {
  const [lessons, setLessons] = useState<LessonData[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (subjectId) {
      fetchLessons();
    }
  }, [subjectId]);

  const fetchLessons = async () => {
    if (!subjectId) return;

    if (lessons.length > 0) return;

    setLoading(true);
    try {
      console.log('Buscando aulas para a disciplina:', subjectId);

      // Buscar aulas_ids na tabela disciplinas
      const { data: disciplinaData } = await supabase
        .from('disciplinas')
        .select('*')
        .eq('id', subjectId)
        .single();

      if (disciplinaData) {
        const aulas_ids = disciplinaData.aulas_ids || [];
        if (Array.isArray(aulas_ids) && aulas_ids.length > 0) {
          await fetchAulasByIds(aulas_ids.map(String));
          return;
        }
      }

      // Tentar buscar por disciplina_id
      const { data: aulasData } = await supabase
        .from('aulas')
        .select('*')
        .eq('disciplina_id', subjectId);

      if (aulasData && aulasData.length > 0) {
        await processAulas(aulasData.map(aula => ({
          id: String(aula.id),
          titulo: String(aula.titulo),
          questoes_ids: aula.questoes_ids ? aula.questoes_ids.map(String) : []
        })));
        return;
      }

      // Tentar buscar por id_disciplina
      const { data: aulasData2 } = await supabase
        .from('aulas')
        .select('*')
        .eq('id_disciplina', subjectId);

      if (aulasData2 && aulasData2.length > 0) {
        await processAulas(aulasData2.map(aula => ({
          id: String(aula.id),
          titulo: String(aula.titulo),
          questoes_ids: aula.questoes_ids ? aula.questoes_ids.map(String) : []
        })));
        return;
      }

      // Tentar buscar por disciplina
      const { data: aulasData3 } = await supabase
        .from('aulas')
        .select('*')
        .eq('disciplina', subjectId);

      if (aulasData3 && aulasData3.length > 0) {
        await processAulas(aulasData3.map(aula => ({
          id: String(aula.id),
          titulo: String(aula.titulo),
          questoes_ids: aula.questoes_ids ? aula.questoes_ids.map(String) : []
        })));
        return;
      }

      console.log('Nenhuma aula encontrada para a disciplina:', subjectId);
      setLessons([]);
    } catch (error) {
      console.error('Erro ao processar dados das aulas:', error);
      setLessons([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAulasByIds = async (aulaIds: string[]) => {
    if (!aulaIds || aulaIds.length === 0) {
      setLessons([]);
      return;
    }

    const { data: aulasData, error } = await supabase
      .from('aulas')
      .select('*')
      .in('id', aulaIds);

    if (error || !aulasData || aulasData.length === 0) {
      console.error('Erro ao buscar aulas por IDs:', error);
      setLessons([]);
      return;
    }

    const simpleAulas = aulasData.map(aula => ({
      id: String(aula.id),
      titulo: String(aula.titulo),
      questoes_ids: aula.questoes_ids ? aula.questoes_ids.map(String) : []
    }));

    await processAulas(simpleAulas);
  };

  const processAulas = async (aulasData: SimpleAula[]) => {
    const lessonsWithStats = aulasData.map((aula) => ({
      id: aula.id,
      titulo: aula.titulo,
      concluida: false,
      questoesIds: aula.questoes_ids || [],
      stats: {
        total: 0,
        hits: 0,
        errors: 0
      }
    }));

    if (user?.id) {
      try {
        // Buscar progresso do usuário
        const { data: userProgressRaw } = await supabase
          .from('user_course_progress')
          .select('subjects_data')
          .eq('user_id', user.id)
          .eq('course_id', courseId)
          .single();

        if (userProgressRaw?.subjects_data) {
          let subjects_data;
          
          if (typeof userProgressRaw.subjects_data === 'string') {
            try {
              subjects_data = JSON.parse(userProgressRaw.subjects_data);
            } catch (e) {
              subjects_data = {};
            }
          } else {
            subjects_data = userProgressRaw.subjects_data;
          }

          const subjectData = subjects_data[subjectId];

          if (subjectData?.lessons) {
            for (const lesson of lessonsWithStats) {
              if (subjectData.lessons[lesson.id]?.completed) {
                lesson.concluida = true;
              }
            }
          }
        }

        // Processar questões para cada aula
        for (const lesson of lessonsWithStats) {
          let questoesIds: string[] = [];

          const aulaCompleta = aulasData.find(a => a.id === lesson.id);
          if (aulaCompleta && aulaCompleta.questoes_ids && aulaCompleta.questoes_ids.length > 0) {
            questoesIds = aulaCompleta.questoes_ids.map(String);
          }

          // Se não encontrou questoes_ids na aula, tenta buscar na tabela questoes
          if (questoesIds.length === 0) {
            const { data: questoesData1 } = await supabase
              .from('questoes')
              .select('id')
              .eq('aula_id', lesson.id);

            if (questoesData1 && questoesData1.length > 0) {
              questoesIds = questoesData1.map(q => String(q.id));
            } else {
              const { data: questoesData2 } = await supabase
                .from('questoes')
                .select('id')
                .eq('id_aula', lesson.id);

              if (questoesData2 && questoesData2.length > 0) {
                questoesIds = questoesData2.map(q => String(q.id));
              }
            }
          }

          // Se encontrou questoesIds, buscar dados de respostas para calcular estatísticas
          if (questoesIds.length > 0) {
            const { data: respostasData } = await supabase
              .from('respostas_alunos')
              .select('questao_id, is_correta, created_at')
              .eq('aluno_id', user.id)
              .in('questao_id', questoesIds)
              .order('created_at', { ascending: false });

            if (respostasData && respostasData.length > 0) {
              const respostasMaisRecentes = new Map<string, boolean>();

              for (const resposta of respostasData) {
                if (!respostasMaisRecentes.has(String(resposta.questao_id))) {
                  respostasMaisRecentes.set(String(resposta.questao_id), !!resposta.is_correta);
                }
              }

              const total = respostasMaisRecentes.size;
              const hits = Array.from(respostasMaisRecentes.values()).filter(Boolean).length;

              lesson.stats = {
                total,
                hits,
                errors: total - hits
              };
            }
          }
        }
      } catch (error) {
        console.error('Erro ao buscar dados de progresso do usuário:', error);
      }
    }

    setLessons(lessonsWithStats);
  };

  return { lessons, loading };
};
