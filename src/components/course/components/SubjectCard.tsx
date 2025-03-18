import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from "lucide-react";
import { renderDonutChart } from '../utils/donutChart';
import { calculateSubjectTotals } from '../utils/statsCalculations';
import { LessonItem } from './LessonItem';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { PostgrestSingleResponse, PostgrestResponse } from '@supabase/supabase-js';

interface SubjectCardProps {
  subject: any; 
  isExpanded: boolean;
  onToggle: () => void;
}

interface LessonData {
  id: string;
  titulo: string;
  concluida: boolean;
  questoesIds: string[];
  stats: {
    total: number;
    hits: number;
    errors: number;
  };
}

interface DisciplinaData {
  id: string;
  titulo: string;
  aulas_ids?: string[];
  [key: string]: any;
}

interface AulaData {
  id: string;
  titulo: string;
  disciplina_id?: string;
  id_disciplina?: string;
  disciplina?: string;
  questoes_ids?: string[];
  [key: string]: any;
}

interface QuestaoData {
  id: string;
  [key: string]: any;
}

interface RespostaData {
  is_correta: boolean;
  [key: string]: any;
}

interface UserProgressData {
  subjects_data: {
    [subjectId: string]: {
      lessons?: {
        [lessonId: string]: {
          completed: boolean;
          [key: string]: any;
        };
      };
      [key: string]: any;
    };
  };
  [key: string]: any;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({
  subject,
  isExpanded,
  onToggle
}) => {
  const [lessons, setLessons] = useState<LessonData[]>([]);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const { user } = useAuth();
  
  // Buscar aulas da disciplina quando o card for expandido
  useEffect(() => {
    if (isExpanded && subject.id) {
      fetchLessons();
    }
  }, [isExpanded, subject.id]);
  
  // Função para buscar as aulas da disciplina
  const fetchLessons = async () => {
    if (!subject.id) return;
    
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
      const disciplinaResponse: PostgrestSingleResponse<DisciplinaData> = await supabase
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
      const aulasResponse: PostgrestResponse<AulaData> = await supabase
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
      const aulasResponse2: PostgrestResponse<AulaData> = await supabase
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
      const aulasResponse3: PostgrestResponse<AulaData> = await supabase
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
    
    const aulasResponse: PostgrestResponse<AulaData> = await supabase
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
  const processAulas = async (aulasData: AulaData[]) => {
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
        const userProgressResponse: PostgrestSingleResponse<UserProgressData> = await supabase
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
        
        // Buscar estatísticas de questões para cada aula
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
            const questoesResponse1: PostgrestResponse<QuestaoData> = await supabase
              .from('questoes')
              .select('id')
              .eq('aula_id', lesson.id);
            
            const questoesData1 = questoesResponse1.data;
            
            if (questoesData1 && questoesData1.length > 0) {
              questoesIds = questoesData1.map((q) => q.id);
            } else {
              const questoesResponse2: PostgrestResponse<QuestaoData> = await supabase
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
            const respostasResponse: PostgrestResponse<RespostaData> = await supabase
              .from('respostas_alunos')
              .select('is_correta')
              .eq('aluno_id', user.id)
              .in('questao_id', questoesIds);
            
            const respostasData = respostasResponse.data;
            
            if (respostasData && respostasData.length > 0) {
              const total = respostasData.length;
              const hits = respostasData.filter((r: RespostaData) => r.is_correta).length;
              
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
    // Calcular estatísticas baseadas nas aulas carregadas
    const lessonStats = {
      questionsTotal: 0,
      questionsCorrect: 0,
      questionsWrong: 0
    };
    
    // Somar estatísticas de todas as aulas
    lessons.forEach(lesson => {
      lessonStats.questionsTotal += lesson.stats.total;
      lessonStats.questionsCorrect += lesson.stats.hits;
      lessonStats.questionsWrong += lesson.stats.errors;
    });
    
    // Verificar se já existem estatísticas definidas no subject
    if (subject.progress !== undefined && 
        subject.questionsTotal !== undefined && 
        subject.questionsCorrect !== undefined && 
        subject.questionsWrong !== undefined) {
      return {
        progress: subject.progress,
        questionsTotal: subject.questionsTotal,
        questionsCorrect: subject.questionsCorrect,
        questionsWrong: subject.questionsWrong,
        aproveitamento: subject.questionsTotal > 0 
          ? Math.round((subject.questionsCorrect / subject.questionsTotal) * 100) 
          : 0
      };
    }
    
    if (subject.topics) {
      const stats = calculateSubjectTotals(subject.topics);
      return {
        progress: stats.totalTopics > 0 
          ? Math.round((stats.completedTopics / stats.totalTopics) * 100) 
          : 0,
        questionsTotal: stats.exercisesDone,
        questionsCorrect: stats.hits,
        questionsWrong: stats.errors,
        aproveitamento: stats.exercisesDone > 0 
          ? Math.round((stats.hits / stats.exercisesDone) * 100) 
          : 0
      };
    }
    
    if (subject.stats) {
      return {
        progress: subject.stats.totalTopics > 0 
          ? Math.round((subject.stats.completedTopics / subject.stats.totalTopics) * 100) 
          : 0,
        questionsTotal: subject.stats.exercisesDone || 0,
        questionsCorrect: subject.stats.hits || 0,
        questionsWrong: subject.stats.errors || 0,
        aproveitamento: subject.stats.exercisesDone > 0 
          ? Math.round((subject.stats.hits / subject.stats.exercisesDone) * 100) 
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
      <div className="p-4 cursor-pointer" onClick={onToggle}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex items-center justify-center">
              {renderDonutChart(stats.progress)}
              <span className="absolute text-xs font-medium">{stats.progress}%</span>
            </div>
            <span className="font-medium text-[rgba(38,47,60,1)]">{subject.name || subject.titulo}</span>
          </div>
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>
      
      {isExpanded && (
        <div className="px-4 pb-4 space-y-2">
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="bg-white p-2 rounded">
              <div className="text-gray-600">Aprov. (%)</div>
              <div className="font-semibold">{stats.aproveitamento}%</div>
            </div>
            <div className="bg-white p-2 rounded">
              <div className="text-green-600">Acertos</div>
              <div className="font-semibold text-green-600">{stats.questionsCorrect}</div>
            </div>
            <div className="bg-white p-2 rounded">
              <div className="text-red-600">Erros</div>
              <div className="font-semibold text-red-600">{stats.questionsWrong}</div>
            </div>
          </div>
          
          {/* Seção de aulas */}
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2 text-[rgba(38,47,60,1)]">Aulas</h4>
            
            {loadingLessons ? (
              <div className="text-center py-2 text-gray-500 text-sm">
                Carregando aulas...
              </div>
            ) : lessons.length > 0 ? (
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
              <div className="text-center py-2 text-gray-500 text-sm">
                Nenhuma aula disponível para esta disciplina.
              </div>
            )}
          </div>
        </div>
      )}
    </div>;
};
