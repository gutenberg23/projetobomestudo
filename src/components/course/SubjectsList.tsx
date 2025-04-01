import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Subject as SubjectComponent } from "./components/Subject";
import { Subject, Lesson } from "./types/subjects";
import { supabase } from "@/integrations/supabase/client";
import { extractIdFromFriendlyUrl } from "@/utils/slug-utils";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

interface SubjectsListProps {
  onSubjectsCountChange?: (count: number, data?: any[]) => void;
  courseId?: string;
}

export const SubjectsList = ({ onSubjectsCountChange, courseId: propCourseId }: SubjectsListProps) => {
  const { courseId: paramCourseId } = useParams<{ courseId: string }>();
  const effectiveCourseId = propCourseId || paramCourseId;
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCurso, setIsCurso] = useState(true);
  const [questoesCache, setQuestoesCache] = useState<Record<string, any>>({});
  const [dataFetched, setDataFetched] = useState(false);

  const toggleExpand = (subjectId: string) => {
    setExpandedSubject(expandedSubject === subjectId ? null : subjectId);
  };

  useEffect(() => {
    // Se já buscou os dados, não buscar novamente
    if (dataFetched) return;
    
    let isMounted = true;
    
    const fetchSubjects = async () => {
      if (!effectiveCourseId) return;
      
      try {
        setLoading(true);
        // Extrair o ID real da URL amigável
        const realId = extractIdFromFriendlyUrl(effectiveCourseId);
        console.log("ID real extraído:", realId);
        
        // Verificar se é um curso ou uma disciplina
        const { data: cursoData, error: cursoError } = await supabase
          .from('cursos')
          .select('*')
          .eq('id', realId)
          .maybeSingle();
        
        console.log("Dados do curso:", cursoData, "Erro:", cursoError);
        
        if (!cursoData || cursoError) {
          // Se não for um curso, verificar se é uma disciplina
          const { data: disciplinaData, error: disciplinaError } = await supabase
            .from('disciplinas')
            .select('*')
            .eq('id', realId)
            .maybeSingle();
          
          if (!disciplinaData || disciplinaError) {
            // Tentar buscar pelo ID original
            const { data: cursoOriginal } = await supabase
              .from('cursos')
              .select('*')
              .eq('id', effectiveCourseId)
              .maybeSingle();
              
            if (cursoOriginal) {
              // Processar curso usando ID original
              // ... código existente ...
            } else {
              throw new Error("Conteúdo não encontrado");
            }
          } else {
            // É uma disciplina
            setIsCurso(false);
            
            // ... código existente para processar disciplina ...
          }
        } else {
          // É um curso
          console.log("É um curso, buscando disciplinas...");
          setIsCurso(true);
          
          if (cursoData.disciplinas_ids && cursoData.disciplinas_ids.length > 0) {
            console.log("Disciplinas do curso:", cursoData.disciplinas_ids);
            
              const { data: disciplinasData, error: disciplinasError } = await supabase
                .from('disciplinas')
                .select('*')
                .in('id', cursoData.disciplinas_ids);
                
              console.log("Disciplinas encontradas:", disciplinasData, "Erro:", disciplinasError);
              
              if (disciplinasData && !disciplinasError) {
              // Converter os dados para o formato esperado pelo componente
              const formattedSubjects: Subject[] = await Promise.all(disciplinasData.map(async (disciplina) => {
                  const subject: Subject = {
                    id: disciplina.id,
                    name: disciplina.titulo,
                    rating: disciplina.descricao || "0",
                    lessons: [],
                  };
                  
                  // Carregar as aulas de cada disciplina
                  if (disciplina.aulas_ids && disciplina.aulas_ids.length > 0) {
                    console.log("Buscando aulas para disciplina:", disciplina.titulo, disciplina.aulas_ids);
                  
                    try {
                      const { data: aulasData, error: aulasError } = await supabase
                        .from('aulas')
                        .select('*')
                        .in('id', disciplina.aulas_ids);
                        
                      console.log("Aulas da disciplina:", aulasData, "Erro:", aulasError);
                      
                    if (aulasData && !aulasError) {
                      // Para cada aula, buscar os tópicos
                      const aulasComTopicos = await Promise.all(
                        aulasData.map(async (aula) => {
                          let questao = null;
                          
                          // Buscar questão associada à aula se houver
                          if (aula.questoes_ids && aula.questoes_ids.length > 0) {
                            try {
                              const questaoId = aula.questoes_ids[0];
                              
                              // Verificar se já temos no cache
                              if (questoesCache[questaoId]) {
                                questao = questoesCache[questaoId];
                              } else {
                                // Buscar questão - CORRIGIDO: usar .eq('id', questaoId) em vez de .id=eq.
                              const { data: questaoData, error: questaoError } = await supabase
                                .from('questoes')
                                .select('*')
                                  .eq('id', questaoId)
                                  .maybeSingle();
                                
                              if (questaoData && !questaoError) {
                                questao = {
                                  id: questaoData.id,
                                    titulo: "Questão de exemplo",
                                    texto: questaoData.content,
                                    // ... outros campos necessários
                                  };
                                  
                                  // Adicionar ao cache
                                  setQuestoesCache(prev => ({
                                    ...prev,
                                    [questaoId]: questao
                                  }));
                                }
                              }
                            } catch (questaoError) {
                              console.error("Erro ao buscar questão:", questaoError);
                            }
                          }
                          
                          // Buscar tópicos da aula
                          if (aula.topicos_ids && aula.topicos_ids.length > 0) {
                            console.log("Buscando tópicos para aula:", aula.titulo, aula.topicos_ids);
                            
                            const { data: topicosData, error: topicosError } = await supabase
                              .from('topicos')
                              .select('*')
                              .in('id', aula.topicos_ids);
                            
                            console.log("Tópicos encontrados:", topicosData, "Erro:", topicosError);
                            
                            if (topicosData && !topicosError) {
                              return {
                                ...aula,
                                topicos: topicosData,
                                questao: questao
                              };
                            }
                          }
                          
                          return {
                            ...aula,
                            topicos: [],
                            questao: questao
                          };
                        })
                      );
                        
                        subject.lessons = aulasComTopicos.map(aula => ({
                          id: aula.id,
                          title: aula.titulo,
                          duration: "0",
                          description: aula.descricao || '',
                          rating: 'V',
                          sections: aula.topicos.map(topico => ({
                            id: topico.id,
                            title: topico.nome,
                            isActive: false,
                            contentType: "video",
                            duration: 0,
                            videoUrl: topico.video_url,
                            textContent: "",
                            professorId: topico.professor_id,
                            professorNome: topico.professor_nome
                          })),
                          question: aula.questao
                        }));
                      }
                    } catch (aulasError) {
                      console.error("Erro ao buscar aulas:", aulasError);
                    }
                  }
                  
                  return subject;
                }));
                
                // Sort subjects by rating in descending order (highest to lowest)
                const sortedSubjects = [...formattedSubjects].sort((a, b) => {
                  const ratingA = a.rating ? Number(a.rating) : 0;
                  const ratingB = b.rating ? Number(b.rating) : 0;
                  return ratingB - ratingA;
                });
                
              if (isMounted) {
                setSubjects(sortedSubjects);
                if (onSubjectsCountChange) {
                  onSubjectsCountChange(sortedSubjects.length, disciplinasData);
                  console.log("SubjectsList - Enviando dados de disciplinas:", disciplinasData.length);
                }
                // Marcar que os dados foram buscados
                setDataFetched(true);
              }
            }
          }
        }
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        if (isMounted) {
        toast.error("Erro ao carregar dados");
        setSubjects([]);
        if (onSubjectsCountChange) onSubjectsCountChange(0);
        }
      } finally {
        if (isMounted) {
        setLoading(false);
        }
      }
    };
    
    fetchSubjects();
    
    return () => {
      isMounted = false;
    };
  }, [effectiveCourseId, dataFetched, questoesCache]);
  
  // Reseta o dataFetched se o courseId mudar
  useEffect(() => {
    setDataFetched(false);
  }, [effectiveCourseId]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Spinner />
      </div>
    );
  }
  
  if (subjects.length === 0) {
    return (
      <div className="bg-white rounded-[10px] p-4 mb-10 text-center">
        <p className="text-gray-500">Nenhuma disciplina encontrada para este curso.</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-[10px] mb-10">
      {subjects.map((subject) => (
        <SubjectComponent
          key={subject.id}
          subject={subject}
          isExpanded={expandedSubject === subject.id}
          onToggle={() => toggleExpand(subject.id)}
          isCurso={isCurso}
        />
      ))}
    </div>
  );
};
