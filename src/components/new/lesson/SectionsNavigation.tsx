"use client";

import React, { useEffect, useState } from "react";
import type { Section } from "../types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useParams } from "react-router-dom";
import { extractIdFromFriendlyUrl } from "@/utils/slug-utils";
import { toast } from "@/components/ui/use-toast";
import { Json } from "@/integrations/supabase/types";

// Definindo a interface para a estrutura de dados subjects_data
interface CompletedSections {
  [lessonId: string]: string[];
}

interface SubjectsData {
  completed_sections?: CompletedSections;
  [key: string]: any;
}

interface UserCourseProgress {
  id: string;
  user_id: string;
  course_id: string;
  subjects_data: SubjectsData;
  performance_goal?: number;
  exam_date?: string;
  created_at: string;
  updated_at: string;
}

interface SectionsNavigationProps {
  sections: Section[];
  selectedSection: string;
  completedSections?: string[];
  hasHorizontalScroll?: boolean;
  videoHeight?: number;
  onSectionClick: (sectionId: string) => void;
  onToggleCompletion?: (sectionId: string, event: React.MouseEvent) => void;
  lessonId?: string;
}

export const SectionsNavigation: React.FC<SectionsNavigationProps> = ({
  sections,
  selectedSection,
  completedSections = [],
  hasHorizontalScroll = false,
  videoHeight = 400,
  onSectionClick,
  onToggleCompletion = () => {},
  lessonId
}) => {
  const { user } = useAuth();
  const { courseId } = useParams<{ courseId: string }>();
  const [localCompletedSections, setLocalCompletedSections] = React.useState<string[]>(completedSections);
  const [isSaving, setIsSaving] = useState(false);

  // Função para garantir que estamos usando números válidos para os cálculos
  const ensureValidNumber = (value: any): number => {
    // Se o valor for undefined, null ou NaN, retornar 0
    if (value === undefined || value === null) return 0;
    const num = Number(value);
    return !isNaN(num) ? num : 0;
  };

  // Carregar os tópicos concluídos do banco de dados quando o componente for montado
  useEffect(() => {
    if (!user || !courseId || !lessonId) return;

    const loadCompletedSections = async () => {
      try {
        const realCourseId = extractIdFromFriendlyUrl(courseId);

        const { data: existingProgress, error: fetchError } = await supabase
          .from('user_course_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('course_id', realCourseId)
          .maybeSingle();

        if (fetchError && fetchError.code !== 'PGRST116') {
          console.error('Erro ao buscar progresso do usuário:', fetchError);
          return;
        }

        // Verificar se existingProgress existe e tem a estrutura esperada
        const progress = existingProgress as UserCourseProgress | null;
        
        if (progress?.subjects_data) {
          const subjectsData = progress.subjects_data as SubjectsData;
          
          if (subjectsData.completed_sections && subjectsData.completed_sections[lessonId]) {
            const savedCompletedSections = subjectsData.completed_sections[lessonId];
            if (Array.isArray(savedCompletedSections) && savedCompletedSections.length > 0) {
              setLocalCompletedSections(savedCompletedSections);
              console.log('Tópicos concluídos carregados do banco de dados:', savedCompletedSections);
              
              // Disparar evento para atualizar os componentes que exibem o progresso
              const totalSections = await getTotalSectionsForCourse(realCourseId);
              const totalCompleted = getTotalCompletedSections(subjectsData);
              
              document.dispatchEvent(new CustomEvent('sectionsUpdated', {
                detail: { 
                  courseId: realCourseId,
                  totalCompleted,
                  totalSections
                }
              }));
            }
          }
        }
      } catch (error) {
        console.error('Erro ao carregar tópicos concluídos:', error);
      }
    };

    loadCompletedSections();
  }, [user, courseId, lessonId]);

  // Função para obter o total de seções para todas as aulas do curso
  const getTotalSectionsForCourse = async (realCourseId: string): Promise<number> => {
    try {
      // Buscar o curso pelo ID
      const { data: cursoData, error: cursoError } = await supabase
        .from('cursos')
        .select('aulas_ids')
        .eq('id', realCourseId)
        .single();
      
      if (cursoError) {
        console.error('Erro ao buscar aulas do curso:', cursoError);
        return sections.length; // Fallback para o número atual de seções
      }
      
      // Se não houver aulas, retorna apenas o número atual de seções
      if (!cursoData?.aulas_ids || !cursoData.aulas_ids.length) {
        return sections.length;
      }
      
      // Buscar todas as aulas do curso para contar suas seções
      const { data: aulasData, error: aulasError } = await supabase
        .from('aulas')
        .select('id, topicos_ids')
        .in('id', cursoData.aulas_ids);
      
      if (aulasError) {
        console.error('Erro ao buscar detalhes das aulas:', aulasError);
        return sections.length;
      }
      
      // Contar o total de tópicos em todas as aulas
      let totalTopicos = 0;
      
      // Para a aula atual, usamos o número de seções fornecido
      if (lessonId) {
        totalTopicos += sections.length;
      }
      
      // Para as outras aulas, precisamos contar os tópicos
      for (const aula of aulasData || []) {
        // Se for a aula atual, pulamos pois já contamos acima
        if (aula.id === lessonId) continue;
        
        if (aula.topicos_ids && Array.isArray(aula.topicos_ids)) {
          totalTopicos += aula.topicos_ids.length;
        }
      }
      
      console.log(`Total de tópicos para o curso ${realCourseId}: ${totalTopicos}`);
      return totalTopicos > 0 ? totalTopicos : sections.length;
    } catch (error) {
      console.error('Erro ao calcular o total de seções:', error);
      return sections.length; // Fallback para o número atual de seções
    }
  };

  // Função para obter o total de seções concluídas para todas as aulas
  const getTotalCompletedSections = (subjectsData: SubjectsData): number => {
    if (!subjectsData.completed_sections) return 0;
    
    let total = 0;
    
    // Percorrer todas as aulas com seções concluídas
    Object.values(subjectsData.completed_sections).forEach(sectionIds => {
      // Verificar se sectionIds é um array antes de usar o length
      if (Array.isArray(sectionIds)) {
        total += sectionIds.length;
      }
    });
    
    return total;
  };

  // Atualizar o estado local quando as props mudarem
  useEffect(() => {
    if (completedSections.length > 0 && JSON.stringify(completedSections) !== JSON.stringify(localCompletedSections)) {
      setLocalCompletedSections(completedSections);
    }
  }, [completedSections]);

  // Salvar os tópicos concluídos no banco de dados quando o estado local mudar
  useEffect(() => {
    if (!user || !courseId || !lessonId || isSaving) return;
    if (localCompletedSections.length === 0 && completedSections.length === 0) return;

    const saveCompletedSections = async () => {
      setIsSaving(true);
      
      try {
        const realCourseId = extractIdFromFriendlyUrl(courseId);

        const { data: existingProgress, error: fetchError } = await supabase
          .from('user_course_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('course_id', realCourseId)
          .maybeSingle();

        if (fetchError && fetchError.code !== 'PGRST116') {
          console.error('Erro ao buscar progresso do usuário:', fetchError);
          setIsSaving(false);
          return;
        }

        const progress = existingProgress as UserCourseProgress | null;
        let subjectsData: SubjectsData = progress?.subjects_data || {};

        // Garantir que subjectsData é um objeto
        if (typeof subjectsData !== 'object' || Array.isArray(subjectsData)) {
          subjectsData = {};
        }

        // Garantir que completed_sections existe
        if (!subjectsData.completed_sections) {
          subjectsData.completed_sections = {};
        }

        // Salvar os tópicos concluídos
        subjectsData.completed_sections[lessonId] = localCompletedSections;

        const totalSections = await getTotalSectionsForCourse(realCourseId);
        const totalCompleted = getTotalCompletedSections(subjectsData);

        console.log('Salvando progresso:', { 
          totalCompleted, 
          totalSections, 
          localCompletedSections 
        });

        // Disparar evento antes de salvar no banco
        document.dispatchEvent(new CustomEvent('sectionsUpdated', {
          detail: { 
            courseId: realCourseId,
            totalCompleted,
            totalSections,
            timestamp: new Date().getTime()
          }
        }));

        if (progress) {
          const { error: updateError } = await supabase
            .from('user_course_progress')
            .update({
              subjects_data: subjectsData,
              updated_at: new Date().toISOString()
            })
            .eq('id', progress.id);

          if (updateError) {
            console.error('Erro ao atualizar progresso do usuário:', updateError);
          } else {
            console.log('Progresso atualizado com sucesso em SectionsNavigation');
          }
        } else {
          const { error: insertError } = await supabase
            .from('user_course_progress')
            .insert({
              user_id: user.id,
              course_id: realCourseId,
              subjects_data: subjectsData,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (insertError) {
            console.error('Erro ao inserir progresso do usuário:', insertError);
          } else {
            console.log('Progresso inserido com sucesso em SectionsNavigation');
          }
        }
      } catch (error) {
        console.error('Erro ao salvar tópicos concluídos:', error);
      } finally {
        setIsSaving(false);
      }
    };

    // Use um debounce para evitar muitas chamadas ao banco de dados
    const timeoutId = setTimeout(() => {
      saveCompletedSections();
    }, 300); // Reduzido para 300ms para atualização mais rápida
    
    return () => clearTimeout(timeoutId);
  }, [localCompletedSections, user, courseId, lessonId, isSaving, completedSections]);

  // Função para alternar o estado de conclusão de um tópico
  const handleToggleCompletion = (sectionId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (!user) {
      toast({
        title: "Atenção",
        description: "Você precisa estar logado para marcar tópicos como concluídos.",
        variant: "destructive"
      });
      return;
    }
    
    setLocalCompletedSections(prev => {
      const newSections = prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId];
        
      console.log(`Tópico ${sectionId} ${prev.includes(sectionId) ? 'desmarcado' : 'marcado'}, 
        total: ${newSections.length}`);
      
      // Disparar evento imediatamente para atualização rápida da UI
      if (user && courseId && lessonId) {
        setTimeout(async () => {
          const realCourseId = extractIdFromFriendlyUrl(courseId);
          
          // Buscar os dados atuais para realizar a contagem
          const { data: progress } = await supabase
            .from('user_course_progress')
            .select('*')
            .eq('user_id', user.id)
            .eq('course_id', realCourseId)
            .maybeSingle();
            
          if (progress?.subjects_data) {
            const subjectsData = progress.subjects_data as SubjectsData;
            
            // Atualizar temporariamente para contar
            if (typeof subjectsData === 'object' && !Array.isArray(subjectsData)) {
              if (!subjectsData.completed_sections) {
                subjectsData.completed_sections = {};
              }
              subjectsData.completed_sections[lessonId] = newSections;
              
              const totalSections = await getTotalSectionsForCourse(realCourseId);
              const totalCompleted = getTotalCompletedSections(subjectsData);
              
              // Disparar eventos para atualização em tempo real da UI
              document.dispatchEvent(new CustomEvent('sectionsUpdated', {
                detail: { 
                  courseId: realCourseId,
                  totalCompleted,
                  totalSections,
                  timestamp: new Date().getTime()
                }
              }));
              
              // Disparar outro evento mais genérico para outros componentes que precisam atualizar
              document.dispatchEvent(new CustomEvent('topicCompleted', {
                detail: {
                  courseId: realCourseId,
                  sectionId,
                  isCompleted: newSections.includes(sectionId)
                }
              }));
            }
          }
        }, 100);
      }
        
      return newSections;
    });
    
    // Chamar a função de callback original
    onToggleCompletion(sectionId, event);
  };

  return (
    <div
      style={{
        height: hasHorizontalScroll ? "auto" : `${videoHeight}px`,
        maxHeight: hasHorizontalScroll ? "80px" : `${videoHeight}px`
      }}
      className={`
        ${hasHorizontalScroll
          ? "overflow-x-auto md:overflow-y-hidden pb-4 overflow-y-auto"
          : "overflow-y-auto"} 
        pr-2
        [&::-webkit-scrollbar]:w-1.5
        [&::-webkit-scrollbar]:h-1.5
        [&::-webkit-scrollbar-track]:bg-slate-100
        [&::-webkit-scrollbar-track]:rounded-full
        [&::-webkit-scrollbar-thumb]:bg-slate-300
        [&::-webkit-scrollbar-thumb]:rounded-full
        [&::-webkit-scrollbar-thumb]:hover:bg-slate-400
      `}
    >
      <ul
        className={`flex gap-2 ${
          hasHorizontalScroll ? "flex-row md:flex-row" : "flex-col"
        }`}
      >
        {sections.map((section) => (
          <li
            key={section.id}
            className={
              hasHorizontalScroll
                ? "min-w-[180px] sm:min-w-[240px] md:min-w-[300px] flex-shrink-0"
                : ""
            }
          >
            <button
              onClick={() => onSectionClick(section.id)}
              className={`flex justify-between items-center px-3 sm:px-4 py-2 sm:py-3 w-full text-sm sm:text-base font-medium text-left rounded-xl border border-solid min-h-[50px] ${
                selectedSection === section.id
                  ? "bg-purple-50 border-[#5f2ebe] text-[#5f2ebe]"
                  : "bg-white border-gray-100 text-slate-800"
              }`}
            >
              <div className="flex flex-1 shrink gap-2 sm:gap-3 items-center self-stretch my-auto w-full basis-0 min-w-0">
                <div
                  onClick={(e) => handleToggleCompletion(section.id, e)}
                  className={`flex shrink-0 self-stretch my-auto w-4 h-4 sm:w-5 sm:h-5 rounded cursor-pointer ${
                    localCompletedSections.includes(section.id)
                      ? "bg-[#5f2ebe] border-[#5f2ebe]"
                      : "bg-white border border-gray-200"
                  }`}
                >
                  {localCompletedSections.includes(section.id) && (
                    <svg
                      viewBox="0 0 14 14"
                      fill="none"
                      className="w-3 h-3 sm:w-4 sm:h-4 m-auto"
                    >
                      <path
                        d="M11.083 2.917L4.375 9.625 1.917 7.167"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
                <span className="self-stretch my-auto leading-tight text-xs sm:text-sm truncate font-light">
                  {section.title}
                </span>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
