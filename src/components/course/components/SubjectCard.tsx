
import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, CheckCircle, XCircle, PieChart, Award } from "lucide-react";
import { renderDonutChart } from '../utils/donutChart';
import { calculateSubjectTotals } from '../utils/statsCalculations';
import { LessonItem } from './LessonItem';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SubjectCardProps {
  subject: any; 
  isExpanded: boolean;
  onToggle: () => void;
}

// Definições de tipo simplificadas para evitar profundidade excessiva de instanciação
interface LessonStats {
  total: number;
  hits: number;
  errors: number;
}

interface LessonData {
  id: string;
  titulo: string;
  concluida: boolean;
  questoesIds: string[];
  stats: LessonStats;
}

// Tipos simplificados sem referencias circulares
type SimpleObject = Record<string, any>;

export const SubjectCard: React.FC<SubjectCardProps> = ({
  subject,
  isExpanded,
  onToggle
}) => {
  const [lessons, setLessons] = useState<LessonData[]>([]);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const { user } = useAuth();
  
  // Buscar aulas da disciplina quando o componente for montado ou quando o card for expandido
  useEffect(() => {
    if (subject.id) {
      fetchLessons();
    }
  }, [subject.id]);
  
  // Função para buscar as aulas da disciplina
  const fetchLessons = async () => {
    if (!subject.id) return;
    
    // Se já temos aulas carregadas, não precisamos buscar novamente
    if (lessons.length > 0) return;
    
    setLoadingLessons(true);
    try {
      console.log('Buscando aulas para a disciplina:', subject.id);
      
      // Nota: Estamos usando uma abordagem alternativa, já que a estrutura do banco de dados
      // pode variar dependendo da implementação
      
      // Abordagem 1: Verificar se a disciplina tem um array de IDs de aulas
      if (subject.aulas_ids && Array.isArray(subject.aulas_ids) && subject.aulas_ids.length > 0) {
        await processAulasFromIds(subject.aulas_ids);
        return;
      }
      
      // Abordagem 2: Buscar a disciplina do banco para obter aulas_ids
      const disciplinaResponse = await supabase
        .from('disciplinas')
        .select('*')
        .eq('id', subject.id)
        .single();
      
      const disciplinaData = disciplinaResponse.data;
      const disciplinaError = disciplinaResponse.error;
      
      if (!disciplinaError && disciplinaData) {
        // Verificar se existe aulas_ids
        if (disciplinaData.aulas_ids && Array.isArray(disciplinaData.aulas_ids)) {
          await processAulasFromIds(disciplinaData.aulas_ids);
          return;
        }
      }
      
      // Abordagem 3: Buscar aulas que tenham referência à disciplina
      const aulasResponse = await supabase
        .from('aulas')
        .select('*')
        .eq('disciplina_id', subject.id);
      
      const aulasData = aulasResponse.data;
      const aulasError = aulasResponse.error;
      
      if (!aulasError && aulasData && aulasData.length > 0) {
        await processAulas(aulasData);
        return;
      }
      
      // Abordagem 4: Tentar com outro possível nome de coluna
      const aulasResponse2 = await supabase
        .from('aulas')
        .select('*')
        .eq('id_disciplina', subject.id);
      
      const aulasData2 = aulasResponse2.data;
      const aulasError2 = aulasResponse2.error;
      
      if (!aulasError2 && aulasData2 && aulasData2.length > 0) {
        await processAulas(aulasData2);
        return;
      }
      
      // Abordagem 5: Tentar com outro possível nome de coluna
      const aulasResponse3 = await supabase
        .from('aulas')
        .select('*')
        .eq('disciplina', subject.id);
      
      const aulasData3 = aulasResponse3.data;
      const aulasError3 = aulasResponse3.error;
      
      if (!aulasError3 && aulasData3 && aulasData3.length > 0) {
        await processAulas(aulasData3);
        return;
      }
      
      // Não foi possível encontrar aulas para esta disciplina
      console.log('Nenhuma aula encontrada para a disciplina:', subject.id);
      setLessons([]);
    } catch (error) {
      console.error('Erro ao processar dados das aulas:', error);
      setLessons([]);
    } finally {
      setLoadingLessons(false);
    }
  };
  
  // Processa aulas a partir de um array de IDs
  const processAulasFromIds = async (aulaIds: string[]) => {
    if (!aulaIds || aulaIds.length === 0) {
      setLessons([]);
      return;
    }
    
    const aulasResponse = await supabase
      .from('aulas')
      .select('*')
      .in('id', aulaIds);
    
    const aulasData = aulasResponse.data;
    const aulasError = aulasResponse.error;
    
    if (aulasError || !aulasData || aulasData.length === 0) {
      console.error('Erro ao buscar aulas por IDs:', aulasError);
      setLessons([]);
      return;
    }
    
    await processAulas(aulasData);
  };
  
  // Processa os dados das aulas e busca estatísticas
  const processAulas = async (aulasData: SimpleObject[]) => {
    // Preparar as aulas com dados básicos
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
    
    // Buscar dados de progresso do usuário
    if (user?.id) {
      try {
        // Buscar dados do progresso do curso
        const userProgressResponse = await supabase
          .from('user_course_progress')
          .select('subjects_data')
          .eq('user_id', user.id)
          .eq('course_id', subject.courseId || 'default')
          .single();
        
        const userProgressData = userProgressResponse.data;
        const progressError = userProgressResponse.error;
        
        if (!progressError && userProgressData && userProgressData.subjects_data) {
          const subjectData = userProgressData.subjects_data[subject.id];
          
          if (subjectData?.lessons) {
            // Atualizar status de conclusão das aulas
            for (const lesson of lessonsWithStats) {
              if (subjectData.lessons[lesson.id]?.completed) {
                lesson.concluida = true;
              }
            }
          }
        }
        
        // Se encontrou questões, buscar respostas do aluno
        for (const lesson of lessonsWithStats) {
          // Buscar questões da aula
          let questoesIds: string[] = [];
          
          // Verificar se a aula tem questões diretamente
          const aulaCompleta = aulasData.find(a => a.id === lesson.id);
          if (aulaCompleta) {
            if (aulaCompleta.questoes_ids && Array.isArray(aulaCompleta.questoes_ids)) {
              questoesIds = aulaCompleta.questoes_ids;
            }
          }
          
          // Se não encontrou questões diretamente, buscar na tabela de questões
          if (questoesIds.length === 0) {
            // Tentar com diferentes nomes de coluna
            const questoesResponse1 = await supabase
              .from('questoes')
              .select('id')
              .eq('aula_id', lesson.id);
            
            const questoesData1 = questoesResponse1.data;
            
            if (questoesData1 && questoesData1.length > 0) {
              questoesIds = questoesData1.map((q) => q.id);
            } else {
              const questoesResponse2 = await supabase
                .from('questoes')
                .select('id')
                .eq('id_aula', lesson.id);
              
              const questoesData2 = questoesResponse2.data;
              
              if (questoesData2 && questoesData2.length > 0) {
                questoesIds = questoesData2.map((q) => q.id);
              }
            }
          }
          
          // Se encontrou questões, buscar respostas do aluno
          if (questoesIds.length > 0) {
            // Buscar todas as respostas do aluno para estas questões, incluindo a data de criação
            const respostasResponse = await supabase
              .from('respostas_alunos')
              .select('questao_id, is_correta, created_at')
              .eq('aluno_id', user.id)
              .in('questao_id', questoesIds)
              .order('created_at', { ascending: false });
            
            const respostasData = respostasResponse.data;
            
            if (respostasData && respostasData.length > 0) {
              // Filtrar para considerar apenas a resposta mais recente de cada questão
              const respostasMaisRecentes = new Map<string, boolean>();
              
              // Percorre as respostas (já ordenadas por data decrescente)
              // e guarda apenas a primeira ocorrência (mais recente) de cada questão
              respostasData.forEach((resposta: SimpleObject) => {
                if (!respostasMaisRecentes.has(resposta.questao_id)) {
                  respostasMaisRecentes.set(resposta.questao_id, resposta.is_correta);
                }
              });
              
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
    // Inicializar estatísticas das aulas
    const lessonStats = {
      questionsTotal: 0,
      questionsCorrect: 0,
      questionsWrong: 0
    };
    
    // Calcular estatísticas das aulas
    lessons.forEach(lesson => {
      if (lesson.stats) {
        lessonStats.questionsTotal += (lesson.stats.total || 0);
        lessonStats.questionsCorrect += (lesson.stats.hits || 0);
        lessonStats.questionsWrong += (lesson.stats.errors || 0);
      }
      // Verificar se há estatísticas no formato direto
      if ('total' in lesson && 'hits' in lesson && 'errors' in lesson) {
        const total = Number((lesson as any).total) || 0;
        const hits = Number((lesson as any).hits) || 0;
        const errors = Number((lesson as any).errors) || 0;
        
        lessonStats.questionsTotal += total;
        lessonStats.questionsCorrect += hits;
        lessonStats.questionsWrong += errors;
      }
    });
    
    // Log para depuração das estatísticas das aulas
    console.log(`Estatísticas das aulas para ${subject.name || subject.titulo}:`, lessonStats);
    
    // Se o subject já tem estatísticas calculadas, usar diretamente
    if (subject.questionsTotal !== undefined && 
        subject.questionsCorrect !== undefined && 
        subject.questionsWrong !== undefined) {
      
      // Garantir que os valores são números válidos
      const questionsTotal = Number(subject.questionsTotal) || 0;
      const questionsCorrect = Number(subject.questionsCorrect) || 0;
      const questionsWrong = Number(subject.questionsWrong) || 0;
      
      // Log para depuração
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
    
    // Verificar se já existem estatísticas definidas no subject
    if (subject.progress !== undefined && 
        subject.questionsTotal !== undefined && 
        subject.questionsCorrect !== undefined && 
        subject.questionsWrong !== undefined) {
      
      // Garantir que os valores são números válidos
      const questionsTotal = Number(subject.questionsTotal) || 0;
      const questionsCorrect = Number(subject.questionsCorrect) || 0;
      const questionsWrong = Number(subject.questionsWrong) || 0;
      
      // Log para depuração
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
      
      // Combinar estatísticas dos tópicos com as das aulas
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
      // Combinar estatísticas do subject com as das aulas
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
    
    // Usar as estatísticas calculadas das aulas se existirem
    if (lessonStats.questionsTotal > 0) {
      return {
        progress: 0, // Não temos como calcular o progresso apenas com as aulas
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
