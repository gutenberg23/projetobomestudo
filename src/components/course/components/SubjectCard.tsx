
import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, CheckCircle, XCircle, PieChart, Award } from "lucide-react";
import { renderDonutChart } from '../utils/donutChart';
import { calculateSubjectTotals } from '../utils/statsCalculations';
import { LessonItem } from './LessonItem';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  SimpleDisciplina, 
  SimpleAula, 
  SimpleQuestao, 
  SimpleResposta, 
  SimpleUserProgress,
  LessonData,
  SubjectCardProps
} from '../types/subjectCard';

export const SubjectCard: React.FC<SubjectCardProps> = ({
  subject,
  isExpanded,
  onToggle
}) => {
  const [lessons, setLessons] = useState<LessonData[]>([]);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const { user } = useAuth();
  
  useEffect(() => {
    if (subject.id) {
      fetchLessons();
    }
  }, [subject.id]);
  
  const fetchLessons = async () => {
    if (!subject.id) return;
    
    if (lessons.length > 0) return;
    
    setLoadingLessons(true);
    try {
      console.log('Buscando aulas para a disciplina:', subject.id);
      
      if (subject.aulas_ids && Array.isArray(subject.aulas_ids) && subject.aulas_ids.length > 0) {
        await processAulasFromIds(subject.aulas_ids);
        return;
      }
      
      // Query disciplinas table
      const { data: disciplinaData, error: disciplinaError } = await supabase
        .from('disciplinas')
        .select('*')
        .eq('id', subject.id)
        .single();
      
      if (!disciplinaError && disciplinaData) {
        const disciplina: SimpleDisciplina = {
          id: disciplinaData.id,
          titulo: disciplinaData.titulo,
          aulas_ids: Array.isArray(disciplinaData.aulas_ids) ? disciplinaData.aulas_ids : undefined
        };
        
        if (disciplina.aulas_ids && Array.isArray(disciplina.aulas_ids)) {
          await processAulasFromIds(disciplina.aulas_ids);
          return;
        }
      }
      
      // Query aulas with disciplina_id
      const { data: aulasData, error: aulasError } = await supabase
        .from('aulas')
        .select('*')
        .eq('disciplina_id', subject.id);
      
      if (!aulasError && aulasData && aulasData.length > 0) {
        const simpleAulas: SimpleAula[] = aulasData.map(aula => ({
          id: aula.id,
          titulo: aula.titulo,
          questoes_ids: aula.questoes_ids
        }));
        
        await processAulas(simpleAulas);
        return;
      }
      
      // Query aulas with id_disciplina
      const { data: aulasData2, error: aulasError2 } = await supabase
        .from('aulas')
        .select('*')
        .eq('id_disciplina', subject.id);
      
      if (!aulasError2 && aulasData2 && aulasData2.length > 0) {
        const simpleAulas: SimpleAula[] = aulasData2.map(aula => ({
          id: aula.id,
          titulo: aula.titulo,
          questoes_ids: aula.questoes_ids
        }));
        
        await processAulas(simpleAulas);
        return;
      }
      
      // Query aulas with disciplina
      const { data: aulasData3, error: aulasError3 } = await supabase
        .from('aulas')
        .select('*')
        .eq('disciplina', subject.id);
      
      if (!aulasError3 && aulasData3 && aulasData3.length > 0) {
        const simpleAulas: SimpleAula[] = aulasData3.map(aula => ({
          id: aula.id,
          titulo: aula.titulo,
          questoes_ids: aula.questoes_ids
        }));
        
        await processAulas(simpleAulas);
        return;
      }
      
      console.log('Nenhuma aula encontrada para a disciplina:', subject.id);
      setLessons([]);
    } catch (error) {
      console.error('Erro ao processar dados das aulas:', error);
      setLessons([]);
    } finally {
      setLoadingLessons(false);
    }
  };
  
  const processAulasFromIds = async (aulaIds: string[]) => {
    if (!aulaIds || aulaIds.length === 0) {
      setLessons([]);
      return;
    }
    
    const { data: aulasData, error: aulasError } = await supabase
      .from('aulas')
      .select('*')
      .in('id', aulaIds);
    
    if (aulasError || !aulasData || aulasData.length === 0) {
      console.error('Erro ao buscar aulas por IDs:', aulasError);
      setLessons([]);
      return;
    }
    
    const simpleAulas: SimpleAula[] = aulasData.map(aula => ({
      id: aula.id,
      titulo: aula.titulo,
      questoes_ids: aula.questoes_ids
    }));
    
    await processAulas(simpleAulas);
  };
  
  const processAulas = async (aulasData: SimpleAula[]) => {
    const lessonsWithStats: LessonData[] = aulasData.map((aula) => ({
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
        const { data: userProgressData, error: progressError } = await supabase
          .from('user_course_progress')
          .select('subjects_data')
          .eq('user_id', user.id)
          .eq('course_id', subject.courseId || 'default')
          .single();
        
        if (!progressError && userProgressData) {
          const subjects_data = userProgressData.subjects_data || {};
          const subjectData = subjects_data[subject.id];
          
          if (subjectData?.lessons) {
            for (const lesson of lessonsWithStats) {
              if (subjectData.lessons[lesson.id]?.completed) {
                lesson.concluida = true;
              }
            }
          }
        }
        
        for (const lesson of lessonsWithStats) {
          let questoesIds: string[] = [];
          
          const aulaCompleta = aulasData.find(a => a.id === lesson.id);
          if (aulaCompleta) {
            if (aulaCompleta.questoes_ids && Array.isArray(aulaCompleta.questoes_ids)) {
              questoesIds = aulaCompleta.questoes_ids;
            }
          }
          
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
                if (!respostasMaisRecentes.has(resposta.questao_id)) {
                  respostasMaisRecentes.set(resposta.questao_id, resposta.is_correta);
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
  
  const getSubjectStats = () => {
    const lessonStats = {
      questionsTotal: 0,
      questionsCorrect: 0,
      questionsWrong: 0
    };
    
    lessons.forEach(lesson => {
      if (lesson.stats) {
        lessonStats.questionsTotal += (lesson.stats.total || 0);
        lessonStats.questionsCorrect += (lesson.stats.hits || 0);
        lessonStats.questionsWrong += (lesson.stats.errors || 0);
      }
      
      if ('total' in lesson && 'hits' in lesson && 'errors' in lesson) {
        const total = Number((lesson as any).total) || 0;
        const hits = Number((lesson as any).hits) || 0;
        const errors = Number((lesson as any).errors) || 0;
        
        lessonStats.questionsTotal += total;
        lessonStats.questionsCorrect += hits;
        lessonStats.questionsWrong += errors;
      }
    });
    
    console.log(`Estatísticas das aulas para ${subject.name || subject.titulo}:`, lessonStats);
    
    if (subject.questionsTotal !== undefined && 
        subject.questionsCorrect !== undefined && 
        subject.questionsWrong !== undefined) {
      
      const questionsTotal = Number(subject.questionsTotal) || 0;
      const questionsCorrect = Number(subject.questionsCorrect) || 0;
      const questionsWrong = Number(subject.questionsWrong) || 0;
      
      console.log(`Usando estatísticas do subject para ${subject.name || subject.titulo}:`, {
        questionsTotal,
        questionsCorrect,
        questionsWrong
      });
      
      return {
        progress: subject.progress || 0,
        questionsTotal: questionsTotal,
        questionsCorrect: questionsCorrect,
        questionsWrong: questionsWrong,
        aproveitamento: questionsTotal > 0 
          ? Math.round((questionsCorrect / questionsTotal) * 100) 
          : 0
      };
    }
    
    if (subject.progress !== undefined && 
        subject.questionsTotal !== undefined && 
        subject.questionsCorrect !== undefined && 
        subject.questionsWrong !== undefined) {
      
      const questionsTotal = Number(subject.questionsTotal) || 0;
      const questionsCorrect = Number(subject.questionsCorrect) || 0;
      const questionsWrong = Number(subject.questionsWrong) || 0;
      
      console.log(`Usando estatísticas do subject para ${subject.name || subject.titulo}:`, {
        questionsTotal,
        questionsCorrect,
        questionsWrong
      });
      
      return {
        progress: subject.progress,
        questionsTotal: questionsTotal,
        questionsCorrect: questionsCorrect,
        questionsWrong: questionsWrong,
        aproveitamento: questionsTotal > 0 
          ? Math.round((questionsCorrect / questionsTotal) * 100) 
          : 0
      };
    }
    
    if (subject.topics) {
      const stats = calculateSubjectTotals(subject.topics);
      
      const combinedStats = {
        totalTopics: stats.totalTopics,
        completedTopics: stats.completedTopics,
        exercisesDone: stats.exercisesDone + lessonStats.questionsTotal,
        hits: stats.hits + lessonStats.questionsCorrect,
        errors: stats.errors + lessonStats.questionsWrong
      };
      
      return {
        progress: combinedStats.totalTopics > 0 
          ? Math.round((combinedStats.completedTopics / combinedStats.totalTopics) * 100) 
          : 0,
        questionsTotal: combinedStats.exercisesDone,
        questionsCorrect: combinedStats.hits,
        questionsWrong: combinedStats.errors,
        aproveitamento: combinedStats.exercisesDone > 0 
          ? Math.round((combinedStats.hits / combinedStats.exercisesDone) * 100) 
          : 0
      };
    }
    
    if (subject.stats) {
      const combinedStats = {
        totalTopics: subject.stats.totalTopics || 0,
        completedTopics: subject.stats.completedTopics || 0,
        exercisesDone: (subject.stats.exercisesDone || 0) + lessonStats.questionsTotal,
        hits: (subject.stats.hits || 0) + lessonStats.questionsCorrect,
        errors: (subject.stats.errors || 0) + lessonStats.questionsWrong
      };
      
      return {
        progress: combinedStats.totalTopics > 0 
          ? Math.round((combinedStats.completedTopics / combinedStats.totalTopics) * 100) 
          : 0,
        questionsTotal: combinedStats.exercisesDone,
        questionsCorrect: combinedStats.hits,
        questionsWrong: combinedStats.errors,
        aproveitamento: combinedStats.exercisesDone > 0 
          ? Math.round((combinedStats.hits / combinedStats.exercisesDone) * 100) 
          : 0
      };
    }
    
    if (lessonStats.questionsTotal > 0) {
      return {
        progress: 0,
        questionsTotal: lessonStats.questionsTotal,
        questionsCorrect: lessonStats.questionsCorrect,
        questionsWrong: lessonStats.questionsWrong,
        aproveitamento: Math.round((lessonStats.questionsCorrect / lessonStats.questionsTotal) * 100)
      };
    }
    
    return {
      progress: 0,
      questionsTotal: 0,
      questionsCorrect: 0,
      questionsWrong: 0,
      aproveitamento: 0
    };
  };
  
  const stats = getSubjectStats();
  
  return <div className="bg-[rgba(246,248,250,1)] rounded-[10px]">
      <div className="p-3 cursor-pointer" onClick={onToggle}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative flex items-center justify-center">
              {renderDonutChart(stats.aproveitamento, '#5f2ebe', 'rgba(38,47,60,0.1)')}
              <span className="absolute text-xs font-medium text-[rgba(38,47,60,1)]">{stats.aproveitamento}%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-sm text-[rgba(38,47,60,1)]">{subject.name || subject.titulo}</span>
            </div>
          </div>
          <div className="flex items-center">
            <button 
              onClick={onToggle}
              className="text-[rgba(38,47,60,0.6)] hover:text-[#5f2ebe] transition-colors"
            >
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>
      </div>
      
      {isExpanded && (
        <div className="px-3 pb-3">
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="bg-white p-2 rounded text-center">
              <div className="text-xs text-[#5f2ebe] flex items-center justify-center gap-1 mb-1">
                <Award className="w-3.5 h-3.5" />
                <span>Aproveitamento</span>
              </div>
              <div className="font-semibold text-sm text-[#5f2ebe]">{stats.aproveitamento}%</div>
            </div>
            <div className="bg-white p-2 rounded text-center">
              <div className="text-xs text-[#5f2ebe] flex items-center justify-center gap-1 mb-1">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Acertos</span>
              </div>
              <div className="font-semibold text-sm text-[#5f2ebe]">{stats.questionsCorrect}</div>
            </div>
            <div className="bg-white p-2 rounded text-center">
              <div className="text-xs text-[#ffac33] flex items-center justify-center gap-1 mb-1">
                <XCircle className="w-3.5 h-3.5" />
                <span>Erros</span>
              </div>
              <div className="font-semibold text-sm text-[#ffac33]">{stats.questionsWrong}</div>
            </div>
          </div>
          
          <div>
            {loadingLessons ? (
              <div className="text-center py-3">
                <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-[#5f2ebe] border-r-transparent"></div>
                <div className="mt-1 text-xs text-[rgba(38,47,60,1)]">Carregando aulas...</div>
              </div>
            ) : (
              <>
                {lessons.length > 0 ? (
                  <div className="space-y-2">
                    {lessons.map((lesson) => (
                      <LessonItem 
                        key={lesson.id}
                        title={lesson.titulo}
                        isCompleted={lesson.concluida}
                        stats={{
                          total: lesson.stats.total,
                          hits: lesson.stats.hits,
                          errors: lesson.stats.errors
                        }}
                        questoesIds={lesson.questoesIds}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-3 text-[rgba(38,47,60,0.6)]">
                    Nenhuma aula encontrada para esta disciplina.
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>;
};
