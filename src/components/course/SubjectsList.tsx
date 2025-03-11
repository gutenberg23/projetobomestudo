
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Subject as SubjectComponent } from "./components/Subject";
import { Subject } from "./types/subjects";
import { supabase } from "@/integrations/supabase/client";
import { extractIdFromFriendlyUrl } from "@/utils/slug-utils";
import { toast } from "sonner";

export const SubjectsList = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCurso, setIsCurso] = useState(true);

  const toggleExpand = (subjectName: string) => {
    setExpandedSubject(expandedSubject === subjectName ? null : subjectName);
  };

  useEffect(() => {
    const fetchSubjects = async () => {
      if (!courseId) return;
      
      setLoading(true);

      try {
        // Extrair o ID real da URL amigável
        const realId = extractIdFromFriendlyUrl(courseId);
        
        // Verificar se é um curso ou uma disciplina
        let { data: cursoData, error: cursoError } = await supabase
          .from('cursos')
          .select('*')
          .ilike('id', `%${realId}%`)
          .single();
        
        if (cursoError) {
          // Se não for um curso, verificar se é uma disciplina
          const { data: disciplinaData, error: disciplinaError } = await supabase
            .from('disciplinas')
            .select('*')
            .ilike('id', `%${realId}%`)
            .single();
          
          if (disciplinaError) {
            throw new Error("Conteúdo não encontrado");
          }
          
          setIsCurso(false);
          
          // Mostrar apenas a disciplina atual
          const disciplina: Subject = {
            name: disciplinaData.titulo,
            rating: 10,
            lessons: [],
          };
          
          // Carregar as aulas da disciplina
          if (disciplinaData.aulas_ids && disciplinaData.aulas_ids.length > 0) {
            const { data: aulasData } = await supabase
              .from('aulas')
              .select('*')
              .in('id', disciplinaData.aulas_ids);
              
            if (aulasData) {
              disciplina.lessons = aulasData.map(aula => ({
                id: aula.id,
                title: aula.titulo,
                description: aula.descricao || '',
                rating: 'V',
                sections: [
                  { id: '1', title: 'Introdução', isActive: true },
                  { id: '2', title: 'Desenvolvimento', isActive: false },
                  { id: '3', title: 'Conclusão', isActive: false },
                ],
                question: {
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
                }
              }));
            }
          }
          
          setSubjects([disciplina]);
        } else {
          // É um curso, carregar suas disciplinas
          setIsCurso(true);
          
          // Verificar se o curso tem disciplinas associadas
          if (cursoData.disciplinas_ids && cursoData.disciplinas_ids.length > 0) {
            const { data: disciplinasData } = await supabase
              .from('disciplinas')
              .select('*')
              .in('id', cursoData.disciplinas_ids);
              
            if (disciplinasData) {
              // Converter os dados das disciplinas para o formato esperado pelo componente
              const formattedSubjects: Subject[] = await Promise.all(disciplinasData.map(async disciplina => {
                const subject: Subject = {
                  name: disciplina.titulo,
                  rating: 10,
                  lessons: [],
                };
                
                // Carregar as aulas de cada disciplina
                if (disciplina.aulas_ids && disciplina.aulas_ids.length > 0) {
                  const { data: aulasData } = await supabase
                    .from('aulas')
                    .select('*')
                    .in('id', disciplina.aulas_ids);
                    
                  if (aulasData) {
                    subject.lessons = aulasData.map(aula => ({
                      id: aula.id,
                      title: aula.titulo,
                      description: aula.descricao || '',
                      rating: 'V',
                      sections: [
                        { id: '1', title: 'Introdução', isActive: true },
                        { id: '2', title: 'Desenvolvimento', isActive: false },
                        { id: '3', title: 'Conclusão', isActive: false },
                      ],
                      question: {
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
                      }
                    }));
                  }
                }
                
                return subject;
              }));
              
              setSubjects(formattedSubjects);
            } else {
              setSubjects([]);
            }
          } else {
            setSubjects([]);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar disciplinas:", error);
        toast.error("Erro ao carregar disciplinas");
        setSubjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, [courseId]);

  if (loading) {
    return (
      <div className="bg-white rounded-[10px] mb-10 p-8 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#5f2ebe] border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <p className="mt-3 text-gray-500">Carregando disciplinas...</p>
      </div>
    );
  }

  if (subjects.length === 0) {
    return (
      <div className="bg-white rounded-[10px] mb-10 p-8 text-center">
        <p className="text-gray-500">Nenhuma disciplina encontrada para este {isCurso ? "curso" : "conteúdo"}.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[10px] mb-10">
      {subjects.map(subject => (
        <SubjectComponent
          key={subject.name}
          subject={subject}
          isExpanded={expandedSubject === subject.name}
          onToggle={() => toggleExpand(subject.name)}
        />
      ))}
    </div>
  );
};
