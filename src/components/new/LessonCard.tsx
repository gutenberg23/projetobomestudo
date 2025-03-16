
"use client";

import React, { useState, useRef, useEffect } from "react";
import type { Lesson, Question } from "./types";
import ItensDaAula from "./ItensDaAula";
import { QuestionCard } from "./QuestionCard";
import { LessonHeader } from "./lesson/LessonHeader";
import { VideoContentLayout } from "./lesson/VideoContentLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Json } from "@/integrations/supabase/types";
import { Spinner } from "@/components/ui/spinner";

interface LessonCardProps {
  lesson: Lesson;
  question?: Question;
}

export const LessonCard: React.FC<LessonCardProps> = ({
  lesson,
  question
}) => {
  const [selectedSection, setSelectedSection] = useState<string>(
    lesson.sections && lesson.sections.length > 0 ? lesson.sections[0].id : ""
  );
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  const [isVideoSectionVisible, setIsVideoSectionVisible] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);
  const [disabledOptions, setDisabledOptions] = useState<string[]>([]);
  const [hasHorizontalScroll, setHasHorizontalScroll] = useState(false);
  const [isLessonCompleted, setIsLessonCompleted] = useState(false);
  const sectionsContainerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLElement>(null);
  const [videoHeight, setVideoHeight] = useState<number>(0);
  const [currentSectionQuestions, setCurrentSectionQuestions] = useState<Question[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

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

  const fetchQuestionsForSection = async (sectionId: string) => {
    setIsLoadingQuestions(true);
    try {
      const currentSection = lesson.sections.find(section => section.id === sectionId);
      
      if (!currentSection) {
        setCurrentSectionQuestions([]);
        return;
      }
      
      console.log("Buscando tópico:", sectionId);
      const { data: topicoData, error: topicoError } = await supabase
        .from('topicos')
        .select('*')
        .eq('id', sectionId)
        .single();
        
      if (topicoError) {
        console.error("Erro ao buscar tópico:", topicoError);
        toast.error("Erro ao buscar questões do tópico");
        setCurrentSectionQuestions([]);
        return;
      }
      
      console.log("Dados do tópico:", topicoData);
      
      // Verifica e extrai os IDs das questões de forma segura
      if (!topicoData.questoes_ids || 
          (Array.isArray(topicoData.questoes_ids) && topicoData.questoes_ids.length === 0)) {
        console.log("Tópico não tem questões vinculadas");
        setCurrentSectionQuestions([]);
        return;
      }
      
      // Certifica que questoes_ids é um array de strings
      let questoesIds: string[] = [];
      if (Array.isArray(topicoData.questoes_ids)) {
        questoesIds = topicoData.questoes_ids.map(id => String(id));
      } else if (typeof topicoData.questoes_ids === 'object') {
        questoesIds = Object.values(topicoData.questoes_ids).map(id => String(id));
      } else if (typeof topicoData.questoes_ids === 'string') {
        questoesIds = [topicoData.questoes_ids];
      }
      
      if (questoesIds.length === 0) {
        console.log("Não foi possível extrair IDs de questões válidos");
        setCurrentSectionQuestions([]);
        return;
      }
      
      console.log("Buscando questões com IDs:", questoesIds);
      const { data: questoesData, error: questoesError } = await supabase
        .from('questoes')
        .select('*')
        .in('id', questoesIds);
        
      if (questoesError) {
        console.error("Erro ao buscar questões:", questoesError);
        toast.error("Erro ao carregar questões");
        setCurrentSectionQuestions([]);
        return;
      }
      
      console.log("Questões encontradas:", questoesData);
      
      if (questoesData && questoesData.length > 0) {
        const formattedQuestions = questoesData.map(q => ({
          id: q.id,
          year: q.year || "",
          institution: q.institution || "",
          organization: q.organization || "",
          role: q.role || "",
          content: q.content || "",
          options: q.options ? 
            (Array.isArray(q.options) ? q.options : 
            (typeof q.options === 'object' ? Object.values(q.options) : [])) 
            : [],
          comments: []
        }));
        
        setCurrentSectionQuestions(formattedQuestions);
      } else {
        setCurrentSectionQuestions([]);
      }
    } catch (error) {
      console.error("Erro ao buscar questões:", error);
      toast.error("Erro ao carregar questões");
      setCurrentSectionQuestions([]);
    } finally {
      setIsLoadingQuestions(false);
    }
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
    setCompletedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId) 
        : [...prev, sectionId]
    );
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
    setDisabledOptions(prev => 
      prev.includes(optionId) 
        ? prev.filter(id => id !== optionId) 
        : [...prev, optionId]
    );
  };

  const handleOptionSelect = (optionId: string) => {
    setSelectedOptionId(optionId);
  };

  const handleCommentSubmit = (comment: string) => {
    console.log("Comentário enviado:", comment);
  };

  return (
    <article ref={cardRef} className="mb-5 w-full bg-white rounded-xl border border-gray-100 border-solid">
      <LessonHeader 
        title={lesson.title}
        description={lesson.description}
        isVideoSectionVisible={isVideoSectionVisible}
        isLessonCompleted={isLessonCompleted}
        toggleLessonCompletion={toggleLessonCompletion}
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
            <div className="mt-4">
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
                <div className="text-center py-8 text-[#67748a]">
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
