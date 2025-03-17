import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Subject, Topic } from '../types/editorialized';
import { extractIdFromFriendlyUrl } from '@/utils/slug-utils';
import { useAuth } from "@/contexts/AuthContext";

export const useEditorializedData = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { toast } = useToast();
  const { user } = useAuth();
  const userId = user?.id || 'guest';
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (courseId) {
      fetchEditorializedData();
    }
  }, [courseId]);

  const fetchEditorializedData = async () => {
    if (!courseId) return;
    
    setLoading(true);
    console.log("Iniciando carregamento de dados do edital verticalizado");
    console.log("Usuário atual:", userId);
    
    try {
      const realId = extractIdFromFriendlyUrl(courseId);
      console.log("ID do curso:", realId);
      
      // Primeiro, buscamos o curso para verificar se ele existe
      const { data: cursoData, error: cursoError } = await supabase
        .from('cursos')
        .select('id, titulo, disciplinas_ids')
        .eq('id', realId)
        .maybeSingle();
        
      if (cursoError) {
        console.error('Erro ao buscar curso:', cursoError);
        throw new Error('Erro ao buscar dados do curso');
      }
      
      if (!cursoData) {
        console.log('Curso não encontrado:', realId);
        toast({
          title: "Curso não encontrado",
          description: "O curso solicitado não foi encontrado no sistema.",
          variant: "destructive"
        });
        setSubjects([]);
        setLoading(false);
        return;
      }
      
      console.log("Dados do curso encontrados:", cursoData);
      console.log("IDs das disciplinas no curso:", cursoData.disciplinas_ids);
      
      // Verificar se usuário está logado
      if (userId !== 'guest') {
        console.log("Usuário logado, buscando dados de progresso");
        // Buscar dados do progresso por disciplina através da tabela user_course_progress
        const { data: subjectProgressData, error: subjectProgressError } = await supabase
          .from('user_course_progress')
          .select('*')
          .eq('user_id', userId)
          .eq('course_id', realId)
          .maybeSingle();
        
        if (subjectProgressError) {
          console.error('Erro ao buscar dados de progresso:', subjectProgressError);
        } else {
          console.log("Dados de progresso encontrados:", subjectProgressData);
        }
        
        if (!subjectProgressError && subjectProgressData && subjectProgressData.subjects_data) {
          try {
            // Tentar converter os dados do JSON para o formato Subject[]
            const parsedData = JSON.parse(JSON.stringify(subjectProgressData.subjects_data));
            console.log("Dados de disciplinas do banco:", parsedData);
            console.log("É array?", Array.isArray(parsedData));
            console.log("Tamanho:", parsedData.length);
            
            if (Array.isArray(parsedData) && parsedData.length > 0) {
              console.log("Usando dados de disciplinas do banco");
              setSubjects(parsedData as Subject[]);
              setLoading(false);
              return;
            } else {
              console.log("Dados do banco não são um array válido ou estão vazios");
            }
          } catch (e) {
            console.error('Erro ao converter dados JSON:', e);
          }
        } else {
          console.log("Nenhum dado de progresso encontrado no banco ou ocorreu um erro");
        }
      } else {
        // Se o usuário não está logado, não podemos mostrar dados personalizados
        console.log("Usuário não está logado, não podemos mostrar dados personalizados");
        toast({
          title: "Login necessário",
          description: "Faça login para acessar o conteúdo personalizado.",
          variant: "default"
        });
        setSubjects([]);
        setLoading(false);
        return;
      }
      
      // Se não encontrou no banco, buscar dados do edital verticalizado
      console.log("Buscando dados do edital verticalizado");
      // Agora buscamos o edital verticalizado
      const { data: editalData, error: editalError } = await supabase
        .from('cursoverticalizado')
        .select('*')
        .eq('curso_id', cursoData.id.toString())
        .maybeSingle();

      if (editalError && editalError.code !== 'PGRST116') { // PGRST116 é o código para "não encontrado"
        console.error('Erro ao buscar edital:', editalError);
        throw editalError;
      }
      
      console.log("Dados do edital:", editalData);
      
      // Se não encontrou edital verticalizado, não mostrar nada
      if (!editalData) {
        console.log('Nenhum edital verticalizado encontrado para este curso');
        setSubjects([]);
        setLoading(false);
        return;
      }
      
      let disciplinasIds: string[] = [];
      
      if (editalData.disciplinas_ids && editalData.disciplinas_ids.length > 0) {
        disciplinasIds = editalData.disciplinas_ids;
        console.log("Usando IDs de disciplinas do edital:", disciplinasIds);
      } else {
        // Se o edital não tem disciplinas, não mostrar nada
        console.log('Edital verticalizado encontrado, mas sem disciplinas');
        setSubjects([]);
        setLoading(false);
        return;
      }
      
      if (disciplinasIds.length === 0) {
        console.log('Nenhuma disciplina encontrada para o curso:', realId);
        setSubjects([]);
        setLoading(false);
        return;
      }
      
      console.log('Disciplinas IDs para busca:', disciplinasIds);
      console.log('Total de disciplinas a buscar:', disciplinasIds.length);

      // Buscar as disciplinas associadas ao edital ou ao curso
      let disciplinasData: any[] = [];
      
      // Primeiro, tentar buscar nas disciplinas verticalizadas
      const { data: disciplinasVerticalizadasData, error: disciplinasVerticalizadasError } = await supabase
        .from('disciplinaverticalizada')
        .select('*')
        .in('id', disciplinasIds);

      if (disciplinasVerticalizadasError) {
        console.error('Erro ao buscar disciplinas verticalizadas:', disciplinasVerticalizadasError);
      } else {
        console.log("Disciplinas verticalizadas encontradas:", disciplinasVerticalizadasData);
        console.log("Total de disciplinas verticalizadas:", disciplinasVerticalizadasData?.length || 0);
      }

      if (!disciplinasVerticalizadasError && disciplinasVerticalizadasData && disciplinasVerticalizadasData.length > 0) {
        disciplinasData = disciplinasVerticalizadasData;
        console.log("Usando disciplinas verticalizadas");
      } else {
        console.log("Buscando disciplinas normais");
        // Se não encontrou nas disciplinas verticalizadas, buscar nas disciplinas normais
        const { data: disciplinasNormaisData, error: disciplinasNormaisError } = await supabase
          .from('disciplinas')
          .select('*')
          .in('id', disciplinasIds);
          
        if (disciplinasNormaisError) {
          console.error('Erro ao buscar disciplinas:', disciplinasNormaisError);
          throw disciplinasNormaisError;
        } else {
          console.log("Disciplinas normais encontradas:", disciplinasNormaisData);
          console.log("Total de disciplinas normais:", disciplinasNormaisData?.length || 0);
        }
        
        if (disciplinasNormaisData) {
          disciplinasData = disciplinasNormaisData;
          console.log("Usando disciplinas normais");
        }
      }
      
      console.log('Total de disciplinas encontradas:', disciplinasData?.length || 0);
      console.log('Disciplinas encontradas:', disciplinasData);

      const formattedSubjects: Subject[] = (disciplinasData || []).map((disciplina) => {
        // Determinar se é uma disciplina verticalizada ou normal
        const isVerticalizada = 'topicos' in disciplina;
        
        return {
          id: disciplina.id,
          name: disciplina.titulo,
          rating: disciplina.descricao || "", // Adicionando o valor de rating (antigo campo descrição)
          topics: isVerticalizada && Array.isArray(disciplina.topicos) 
            ? disciplina.topicos.map((topico: string, topicIndex: number) => {
                return {
                  id: topicIndex,
                  name: topico,
                  topic: topico,
                  isDone: false,
                  isReviewed: false,
                  importance: (Array.isArray(disciplina.importancia) && disciplina.importancia[topicIndex] 
                    ? disciplina.importancia[topicIndex] 
                    : 0.5) as 1 | 2 | 3 | 4 | 5,
                  difficulty: "Médio",
                  exercisesDone: 0,
                  hits: 0,
                  errors: 0,
                  performance: 0
                };
              }) 
            : [] // Se não for disciplina verticalizada ou não tiver tópicos, retornar array vazio
        };
      });

      console.log('Disciplinas formatadas:', formattedSubjects);
      console.log('Total de disciplinas formatadas:', formattedSubjects.length);
      
      setSubjects(formattedSubjects);
      
      // Se o usuário estiver logado, salvar também no banco de dados
      if (userId !== 'guest') {
        await saveUserDataToDatabase(realId, formattedSubjects);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do edital:', error);
      toast({
        title: "Erro ao carregar edital",
        description: "Não foi possível carregar os dados do edital verticalizado.",
        variant: "destructive"
      });
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  // Função para salvar os dados do usuário no banco de dados
  const saveUserDataToDatabase = async (courseRealId: string, subjectsData: Subject[]) => {
    if (userId === 'guest') return;
    
    try {
      // Verificar se já existe um registro para este usuário e curso
      const { data: existingProgress, error: checkProgressError } = await supabase
        .from('user_course_progress')
        .select('id, performance_goal, exam_date')
        .eq('user_id', userId)
        .eq('course_id', courseRealId)
        .maybeSingle();
      
      if (checkProgressError && checkProgressError.code !== 'PGRST116') { // PGRST116 é o código para "não encontrado"
        console.error('Erro ao verificar progresso existente:', checkProgressError);
      } else {
        // Atualizar ou inserir dados de progresso completos
        if (existingProgress) {
          // Atualizar registro existente
          const { error: updateError } = await supabase
            .from('user_course_progress')
            .update({
              subjects_data: subjectsData,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingProgress.id);
          
          if (updateError) {
            console.error('Erro ao atualizar progresso no banco:', updateError);
          } else {
            console.log('Progresso atualizado com sucesso no banco de dados');
          }
        } else {
          // Criar novo registro
          const { error: insertError } = await supabase
            .from('user_course_progress')
            .insert({
              user_id: userId,
              course_id: courseRealId,
              subjects_data: subjectsData,
              performance_goal: 85, // Valor padrão de 85%
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          
          if (insertError) {
            console.error('Erro ao inserir progresso no banco:', insertError);
          } else {
            console.log('Novo progresso inserido com sucesso no banco de dados');
          }
        }
      }
    } catch (error) {
      console.error('Erro ao salvar dados no banco:', error);
    }
  };

  const updateTopicProgress = async (
    subjectId: string | number,
    topicId: number,
    field: keyof Topic,
    value: any
  ) => {
    try {
      setSubjects(prevSubjects => {
        const updatedSubjects = prevSubjects.map(subject => {
          if (subject.id === subjectId) {
            return {
              ...subject,
              topics: subject.topics.map(topic => {
                if (topic.id === topicId) {
                  return { ...topic, [field]: value };
                }
                return topic;
              })
            };
          }
          return subject;
        });
        
        // Se o usuário estiver logado, salvar no banco de dados
        if (userId !== 'guest' && courseId) {
          const realId = extractIdFromFriendlyUrl(courseId);
          saveUserDataToDatabase(realId, updatedSubjects);
        }
        
        return updatedSubjects;
      });
    } catch (error) {
      console.error('Erro ao atualizar progresso:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o progresso.",
        variant: "destructive"
      });
    }
  };

  return {
    subjects,
    loading,
    updateTopicProgress
  };
};
