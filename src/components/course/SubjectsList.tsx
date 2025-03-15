import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Subject as SubjectComponent } from "./components/Subject";
import { Subject } from "./types/subjects";
import { supabase } from "@/integrations/supabase/client";
import { extractIdFromFriendlyUrl } from "@/utils/slug-utils";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

interface SubjectsListProps {
  onSubjectsCountChange?: (count: number) => void;
}

export const SubjectsList = ({ onSubjectsCountChange }: SubjectsListProps) => {
  const { courseId } = useParams<{ courseId: string }>();
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCurso, setIsCurso] = useState(true);

  const toggleExpand = (subjectId: string) => {
    setExpandedSubject(expandedSubject === subjectId ? null : subjectId);
  };

  useEffect(() => {
    const fetchSubjects = async () => {
      setLoading(true);
      try {
        if (!courseId) {
          throw new Error("ID não fornecido");
        }
        
        // Extrair o ID real da URL amigável
        const realId = extractIdFromFriendlyUrl(courseId);
        console.log("ID real extraído:", realId);
        
        // Verificar se é um curso ou uma disciplina
        const { data: cursoData, error: cursoError } = await supabase
          .from('cursos')
          .select('*')
          .eq('id', realId)
          .maybeSingle();
        
        console.log("Dados do curso:", cursoData, "Erro:", cursoError);
        
        if (cursoData && !cursoError) {
          // É um curso, carregar suas disciplinas
          setIsCurso(true);
          console.log("É um curso, buscando disciplinas...");
          
          // Verificar se o curso tem disciplinas associadas
          if (cursoData.disciplinas_ids && cursoData.disciplinas_ids.length > 0) {
            console.log("Disciplinas do curso:", cursoData.disciplinas_ids);
            try {
              const { data: disciplinasData, error: disciplinasError } = await supabase
                .from('disciplinas')
                .select('*')
                .in('id', cursoData.disciplinas_ids);
                
              console.log("Disciplinas encontradas:", disciplinasData, "Erro:", disciplinasError);
              
              if (disciplinasData && !disciplinasError) {
                // Converter os dados das disciplinas para o formato esperado pelo componente
                const formattedSubjects: Subject[] = await Promise.all(disciplinasData.map(async disciplina => {
                  const subject: Subject = {
                    id: disciplina.id,
                    name: disciplina.titulo,
                    rating: parseInt(disciplina.descricao) || 0,
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
                        // Para cada aula, buscar os tópicos associados
                        const aulasComTopicos = await Promise.all(aulasData.map(async aula => {
                          let topicos = [];
                          
                          // Verificar se a aula tem tópicos associados
                          if (aula.topicos_ids && aula.topicos_ids.length > 0) {
                            console.log("Buscando tópicos para aula:", aula.titulo, aula.topicos_ids);
                            try {
                              const { data: topicosData, error: topicosError } = await supabase
                                .from('topicos')
                                .select('*')
                                .in('id', aula.topicos_ids);
                                
                              console.log("Tópicos encontrados:", topicosData, "Erro:", topicosError);
                              
                              if (topicosData && !topicosError) {
                                topicos = topicosData;
                              }
                            } catch (topicosError) {
                              console.error("Erro ao buscar tópicos:", topicosError);
                            }
                          }
                          
                          // Buscar questões associadas à aula para o caderno de questões
                          let questao = {
                            id: '1',
                            year: '2024',
                            institution: 'SELECON',
                            organization: 'Prefeitura Municipal',
                            role: 'Auditor',
                            content: 'Questão relacionada ao conteúdo da aula',
                            options: [
                              { id: 'a', text: 'Opção A', isCorrect: false },
                              { id: 'b', text: 'Opção B', isCorrect: true },
                              { id: 'c', text: 'Opção C', isCorrect: false },
                              { id: 'd', text: 'Opção D', isCorrect: false }
                            ],
                            comments: []
                          };
                          
                          if (aula.questoes_ids && aula.questoes_ids.length > 0) {
                            try {
                              const { data: questaoData, error: questaoError } = await supabase
                                .from('questoes')
                                .select('*')
                                .eq('id', aula.questoes_ids[0])
                                .single();
                                
                              if (questaoData && !questaoError) {
                                const options = questaoData.options as any[] || [];
                                
                                questao = {
                                  id: questaoData.id,
                                  year: questaoData.year,
                                  institution: questaoData.institution,
                                  organization: questaoData.organization,
                                  role: questaoData.role,
                                  content: questaoData.content,
                                  options: options.map((opt: any) => ({
                                    id: opt.id,
                                    text: opt.text,
                                    isCorrect: opt.isCorrect
                                  })),
                                  comments: []
                                };
                              }
                            } catch (questaoError) {
                              console.error("Erro ao buscar questão:", questaoError);
                            }
                          }
                          
                          return {
                            ...aula,
                            topicos,
                            questao
                          };
                        }));
                        
                        subject.lessons = aulasComTopicos.map(aula => ({
                          id: aula.id,
                          title: aula.titulo,
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
                const sortedSubjects = [...formattedSubjects].sort((a, b) => b.rating - a.rating);
                
                setSubjects(sortedSubjects);
                if (onSubjectsCountChange) onSubjectsCountChange(sortedSubjects.length);
              } else {
                setSubjects([]);
                if (onSubjectsCountChange) onSubjectsCountChange(0);
              }
            } catch (error) {
              console.error("Erro ao buscar disciplinas:", error);
              setSubjects([]);
              if (onSubjectsCountChange) onSubjectsCountChange(0);
            }
          } else {
            setSubjects([]);
            if (onSubjectsCountChange) onSubjectsCountChange(0);
          }
        } else {
          // Se não for um curso, verificar se é uma disciplina
          try {
            const { data: disciplinaData, error: disciplinaError } = await supabase
              .from('disciplinas')
              .select('*')
              .eq('id', realId)
              .maybeSingle();
            
            console.log("Dados da disciplina:", disciplinaData, "Erro:", disciplinaError);
            
            if (disciplinaData && !disciplinaError) {
              setIsCurso(false);
              
              // Mostrar apenas a disciplina atual
              const disciplina: Subject = {
                id: disciplinaData.id,
                name: disciplinaData.titulo,
                rating: parseInt(disciplinaData.descricao) || 0,
                lessons: [],
              };
              
              // Carregar as aulas da disciplina
              if (disciplinaData.aulas_ids && disciplinaData.aulas_ids.length > 0) {
                console.log("Buscando aulas:", disciplinaData.aulas_ids);
                try {
                  const { data: aulasData, error: aulasError } = await supabase
                    .from('aulas')
                    .select('*')
                    .in('id', disciplinaData.aulas_ids);
                    
                  console.log("Aulas encontradas:", aulasData, "Erro:", aulasError);
                  
                  if (aulasData && !aulasError) {
                    // Para cada aula, buscar os tópicos associados
                    const aulasComTopicos = await Promise.all(aulasData.map(async aula => {
                      let topicos = [];
                      
                      // Verificar se a aula tem tópicos associados
                      if (aula.topicos_ids && aula.topicos_ids.length > 0) {
                        console.log("Buscando tópicos para aula:", aula.titulo, aula.topicos_ids);
                        try {
                          const { data: topicosData, error: topicosError } = await supabase
                            .from('topicos')
                            .select('*')
                            .in('id', aula.topicos_ids);
                            
                          console.log("Tópicos encontrados:", topicosData, "Erro:", topicosError);
                          
                          if (topicosData && !topicosError) {
                            topicos = topicosData;
                          }
                        } catch (topicosError) {
                          console.error("Erro ao buscar tópicos:", topicosError);
                        }
                      }
                      
                      // Buscar questões associadas à aula para o caderno de questões
                      let questao = {
                        id: '1',
                        year: '2024',
                        institution: 'SELECON',
                        organization: 'Prefeitura Municipal',
                        role: 'Auditor',
                        content: 'Questão relacionada ao conteúdo da aula',
                        options: [
                          { id: 'a', text: 'Opção A', isCorrect: false },
                          { id: 'b', text: 'Opção B', isCorrect: true },
                          { id: 'c', text: 'Opção C', isCorrect: false },
                          { id: 'd', text: 'Opção D', isCorrect: false }
                        ],
                        comments: []
                      };
                      
                      if (aula.questoes_ids && aula.questoes_ids.length > 0) {
                        try {
                          const { data: questaoData, error: questaoError } = await supabase
                            .from('questoes')
                            .select('*')
                            .eq('id', aula.questoes_ids[0])
                            .single();
                            
                          if (questaoData && !questaoError) {
                            const options = questaoData.options as any[] || [];
                            
                            questao = {
                              id: questaoData.id,
                              year: questaoData.year,
                              institution: questaoData.institution,
                              organization: questaoData.organization,
                              role: questaoData.role,
                              content: questaoData.content,
                              options: options.map((opt: any) => ({
                                id: opt.id,
                                text: opt.text,
                                isCorrect: opt.isCorrect
                              })),
                              comments: []
                            };
                          }
                        } catch (questaoError) {
                          console.error("Erro ao buscar questão:", questaoError);
                        }
                      }
                      
                      return {
                        ...aula,
                        topicos,
                        questao
                      };
                    }));
                    
                    disciplina.lessons = aulasComTopicos.map(aula => ({
                      id: aula.id,
                      title: aula.titulo,
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
              
              setSubjects([disciplina]);
              if (onSubjectsCountChange) onSubjectsCountChange(1);
            } else {
              setSubjects([]);
              if (onSubjectsCountChange) onSubjectsCountChange(0);
            }
          } catch (error) {
            console.error("Erro ao buscar disciplina:", error);
            setSubjects([]);
            if (onSubjectsCountChange) onSubjectsCountChange(0);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar disciplinas:", error);
        setSubjects([]);
        if (onSubjectsCountChange) onSubjectsCountChange(0);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, [courseId, onSubjectsCountChange]);

  return (
    <>
      {loading ? (
        <div className="flex justify-center items-center p-10">
          <Spinner size="lg" />
        </div>
      ) : subjects.length > 0 ? (
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
      ) : (
        <div className="bg-white rounded-[10px] p-5 text-center mb-10">
          <p>Nenhuma disciplina encontrada.</p>
        </div>
      )}
    </>
  );
};
