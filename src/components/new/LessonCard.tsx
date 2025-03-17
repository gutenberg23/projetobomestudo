"use client";

import React, { useState, useRef, useEffect } from "react";
import type { Lesson, Question, QuestionOption } from "./types";
import ItensDaAula from "./ItensDaAula";
import { QuestionCard } from "./QuestionCard";
import { LessonHeader } from "./lesson/LessonHeader";
import { VideoContentLayout } from "./lesson/VideoContentLayout";
import { useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { extractIdFromFriendlyUrl } from "@/utils/slug-utils";
import { Json } from "@/integrations/supabase/types";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { useQuestions } from "@/hooks/useQuestions";

interface LessonCardProps {
  lesson: Lesson;
  question?: Question;
}

export const LessonCard: React.FC<LessonCardProps> = ({
  lesson,
  question
}) => {
  const [selectedSection, setSelectedSection] = useState<string>(lesson.sections && lesson.sections.length > 0 ? lesson.sections[0].id : "");
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  const [isVideoSectionVisible, setIsVideoSectionVisible] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);
  const [disabledOptions, setDisabledOptions] = useState<string[]>([]);
  const [hasHorizontalScroll, setHasHorizontalScroll] = useState(false);
  const [isLessonCompleted, setIsLessonCompleted] = useState(false);
  const sectionsContainerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLElement>(null);
  const [videoHeight, setVideoHeight] = useState<number>(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();

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

  const convertToQuestionOptions = (options: any): QuestionOption[] => {
    if (!options) return [];
    let optionsArray: any[] = [];
    if (Array.isArray(options)) {
      optionsArray = options;
    } else if (typeof options === 'object') {
      optionsArray = Object.values(options);
    } else {
      return [];
    }
    return optionsArray.map(opt => {
      if (typeof opt === 'string') {
        return {
          id: `opt-${Math.random().toString(36).substring(2, 9)}`,
          text: opt,
          isCorrect: false
        };
      }
      return {
        id: typeof opt.id === 'string' ? opt.id : `opt-${Math.random().toString(36).substring(2, 9)}`,
        text: typeof opt.text === 'string' ? opt.text : opt.text || '',
        isCorrect: Boolean(opt.isCorrect)
      };
    });
  };

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

  const handleOptionSelect = (optionId: string) => {
    setSelectedOptionId(optionId);
  };

  const handleCommentSubmit = (comment: string) => {
    console.log("Comentário enviado:", comment);
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
          />
          <ItensDaAula
            setShowQuestions={handleQuestionButtonClick}
            showQuestions={showQuestions}
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