"use client";

import React, { useState, useRef, useEffect } from "react";
import type { Lesson } from "./types";
import ItensDaAula from "./ItensDaAula";
import { QuestionCard } from "./QuestionCard";
import { LessonHeader } from "./lesson/LessonHeader";
import { VideoContentLayout } from "./lesson/VideoContentLayout";
import { useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { extractIdFromFriendlyUrl } from "@/utils/slug-utils";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { useQuestions } from "@/hooks/useQuestions";

interface LessonCardProps {
  lesson: Lesson;
}

export const LessonCard: React.FC<LessonCardProps> = ({
  lesson
}) => {
  const [selectedSection, setSelectedSection] = useState<string>(lesson.sections && lesson.sections.length > 0 ? lesson.sections[0].id : "");
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  const [isVideoSectionVisible, setIsVideoSectionVisible] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);
  const [disabledOptions, setDisabledOptions] = useState<string[]>([]);
  const [hasHorizontalScroll, setHasHorizontalScroll] = useState(false);
  const [isLessonCompleted, setIsLessonCompleted] = useState(false);
  const [topicData, setTopicData] = useState<any>(null);
  const sectionsContainerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLElement>(null);
  const [videoHeight, setVideoHeight] = useState<number>(0);
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const [forceUpdate, setForceUpdate] = useState(0);

  // Usar o novo hook useQuestions
  const { 
    questions: currentSectionQuestions, 
    isLoading: isLoadingQuestions, 
    refetch: fetchQuestionsForSection 
  } = useQuestions();

  useEffect(() => {
    const updateLayout = () => {
      checkScroll();
    };
    updateLayout();
    const timeoutId = setTimeout(updateLayout, 100);
    window.addEventListener('resize', updateLayout);
    return () => {
      window.removeEventListener('resize', updateLayout);
      clearTimeout(timeoutId);
    };
  }, [isVideoSectionVisible]);

  useEffect(() => {
    const allSectionsCompleted = lesson.sections.every(section => completedSections.includes(section.id));
    setIsLessonCompleted(allSectionsCompleted);
  }, [completedSections, lesson.sections]);

  useEffect(() => {
    if (showQuestions && selectedSection) {
      fetchQuestionsForSection(selectedSection);
    }
  }, [selectedSection, showQuestions]);

  useEffect(() => {
    if (!user || !courseId || !lesson.id) return;

    const loadCompletedSections = async () => {
      try {
        const realCourseId = extractIdFromFriendlyUrl(courseId);
        
        // Buscar progresso do usuário
        const { data: userProgress, error: progressError } = await supabase
          .from('user_course_progress')
          .select('subjects_data')
          .eq('user_id', user.id)
          .eq('course_id', realCourseId)
          .maybeSingle();
          
        if (progressError && progressError.code !== 'PGRST116') {
          console.error('Erro ao buscar progresso do usuário:', progressError);
          return;
        }
        
        if (userProgress?.subjects_data) {
          const subjectsData = userProgress.subjects_data;
          
          // Verificar se há seções completadas para esta aula
          if (
            typeof subjectsData === 'object' && 
            !Array.isArray(subjectsData) && 
            subjectsData.completed_sections && 
            subjectsData.completed_sections[lesson.id]
          ) {
            // Carregar as seções completadas
            const savedCompletedSections = subjectsData.completed_sections[lesson.id];
            if (Array.isArray(savedCompletedSections)) {
              setCompletedSections(savedCompletedSections);
              
              // Verificar se todas as seções estão completas
              const allSectionsCompleted = lesson.sections.every(section => 
                savedCompletedSections.includes(section.id)
              );
              setIsLessonCompleted(allSectionsCompleted);
            }
          }
        }
      } catch (error) {
        console.error('Erro ao carregar seções completadas:', error);
      }
    };
    
    loadCompletedSections();
  }, [user, courseId, lesson.id, lesson.sections]);

  useEffect(() => {
    if (!user || !courseId || !lesson.id) return;
    
    const saveCompletedSectionsToDatabase = async () => {
      try {
        const realCourseId = extractIdFromFriendlyUrl(courseId);
        
        // Fetch existing progress
        const { data: existingProgress, error: fetchError } = await supabase
          .from('user_course_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('course_id', realCourseId)
          .maybeSingle();
        
        if (fetchError && fetchError.code !== 'PGRST116') {
          console.error('Error fetching user progress:', fetchError);
          return;
        }
        
        // Prepare the subjects_data object
        let subjectsData = existingProgress?.subjects_data || {};
        
        if (typeof subjectsData !== 'object' || Array.isArray(subjectsData)) {
          subjectsData = {};
        }
        
        if (!subjectsData.completed_sections) {
          subjectsData.completed_sections = {};
        }
        
        // Update the completed sections for this lesson
        subjectsData.completed_sections[lesson.id] = completedSections;
        
        // Save to database
        if (existingProgress) {
          // Update existing record
          const { error: updateError } = await supabase
            .from('user_course_progress')
            .update({
              subjects_data: subjectsData,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingProgress.id);
          
          if (updateError) {
            console.error('Error updating user progress:', updateError);
            toast.error('Erro ao salvar progresso');
          } else {
            console.log('Progress updated successfully');
          }
        } else {
          // Insert new record
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
            console.error('Error inserting user progress:', insertError);
            toast.error('Erro ao salvar progresso');
          } else {
            console.log('Progress inserted successfully');
          }
        }
      } catch (error) {
        console.error('Error saving completed sections:', error);
        toast.error('Erro ao salvar progresso');
      }
    };
    
    // Debounce the save operation to avoid too many database calls
    const timeoutId = setTimeout(() => {
      saveCompletedSectionsToDatabase();
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [completedSections, user, courseId, lesson.id]);

  useEffect(() => {
    const fetchTopicData = async () => {
      if (!selectedSection) return;
      
      try {
        console.log('Buscando dados do tópico com ID:', selectedSection);
        
        const { data, error } = await supabase
          .from('topicos')
          .select('*')
          .eq('id', selectedSection)
          .single();
        
        if (error) {
          console.error('Erro ao buscar dados do tópico:', error);
          return;
        }
        
        console.log('Dados do tópico carregados:', data);
        console.log('URLs dos recursos:', {
          pdf: data?.pdf_url,
          mapa: data?.mapa_url,
          resumo: data?.resumo_url,
          musica: data?.musica_url
        });
        
        // Mapear explicitamente a propriedade abrir_em_nova_guia para abrirEmNovaGuia no objeto currentSection
        if (lesson.sections && lesson.sections.length > 0 && data) {
          const currentSection = lesson.sections.find(section => section.id === selectedSection);
          if (currentSection) {
            currentSection.abrirEmNovaGuia = data.abrir_em_nova_guia === true;
            console.log('Valor de abrir_em_nova_guia carregado do banco:', data.abrir_em_nova_guia);
            console.log('Valor mapeado para abrirEmNovaGuia:', currentSection.abrirEmNovaGuia);
            setForceUpdate(prev => prev + 1); // Forçar re-renderização
          }
        }
        
        setTopicData(data);
      } catch (error) {
        console.error('Erro ao buscar dados do tópico:', error);
      }
    };
    
    fetchTopicData();
  }, [selectedSection]);

  const checkScroll = () => {
    if (sectionsContainerRef.current) {
      const {
        scrollWidth,
        clientWidth
      } = sectionsContainerRef.current;
      setHasHorizontalScroll(scrollWidth > clientWidth);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setHasHorizontalScroll(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSectionClick = (sectionId: string) => {
    console.log("Seção selecionada:", sectionId);
    setSelectedSection(sectionId);
  };

  const handleQuestionButtonClick = () => {
    console.log("Botão de questões clicado para a seção:", selectedSection);
    if (!showQuestions) {
      fetchQuestionsForSection(selectedSection);
    }
    setShowQuestions(!showQuestions);
  };

  const toggleCompletion = (sectionId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setCompletedSections(prev => prev.includes(sectionId) ? prev.filter(id => id !== sectionId) : [...prev, sectionId]);
  };

  const toggleLessonCompletion = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (isLessonCompleted) {
      setCompletedSections([]);
    } else {
      setCompletedSections(lesson.sections.map(section => section.id));
    }
  };

  const toggleVideoSection = () => {
    setIsVideoSectionVisible(!isVideoSectionVisible);
    if (!isVideoSectionVisible && cardRef.current) {
      cardRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const toggleOptionDisabled = (optionId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setDisabledOptions(prev => prev.includes(optionId) ? prev.filter(id => id !== optionId) : [...prev, optionId]);
  };

  return (
    <article ref={cardRef} className="mb-4 bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
      <LessonHeader
        title={lesson.title}
        description={lesson.description}
        duration={lesson.duration}
        isCompleted={isLessonCompleted}
        onToggleCompletion={toggleLessonCompletion}
        isVideoSectionVisible={isVideoSectionVisible}
        toggleVideoSection={toggleVideoSection}
      />

      {isVideoSectionVisible && (
        <div className="mt-4">
          <VideoContentLayout
            sections={lesson.sections}
            selectedSection={selectedSection}
            completedSections={completedSections}
            hasHorizontalScroll={hasHorizontalScroll}
            videoHeight={videoHeight}
            setVideoHeight={setVideoHeight}
            onSectionClick={handleSectionClick}
            onToggleCompletion={toggleCompletion}
            forceUpdate={forceUpdate}
          />
          <ItensDaAula
            setShowQuestions={handleQuestionButtonClick}
            showQuestions={showQuestions}
            pdfUrl={topicData?.pdf_url}
            mapaUrl={topicData?.mapa_url}
            resumoUrl={topicData?.resumo_url}
            musicaUrl={topicData?.musica_url}
          />
          {showQuestions && (
            <div className="mt-4 px-[20px]">
              {isLoadingQuestions ? (
                <div className="flex justify-center items-center py-8">
                  <Spinner size="md" className="fill-[#5f2ebe]" />
                </div>
              ) : currentSectionQuestions.length > 0 ? (
                currentSectionQuestions.map((q, index) => (
                  <QuestionCard
                    key={`${q.id}-${index}`}
                    question={q}
                    disabledOptions={disabledOptions}
                    onToggleDisabled={toggleOptionDisabled}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-[#67748a] px-0">
                  <p className="text-lg font-medium mb-2">Nenhuma questão encontrada</p>
                  <p>Este tópico não possui questões cadastradas no banco de dados.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </article>
  );
};