"use client";

import React, { useState, useRef, useEffect } from "react";
import type { Lesson, Question } from "./types";
import ItensDaAula from "./ItensDaAula";
import { QuestionCard } from "./QuestionCard";
import { LessonHeader } from "./lesson/LessonHeader";
import { VideoContentLayout } from "./lesson/VideoContentLayout";

interface LessonCardProps {
  lesson: Lesson;
}

export const LessonCard: React.FC<LessonCardProps> = ({
  lesson
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
  
  // Estados para gerenciar a questão
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
    // Verifica se todas as seções estão completas
    const allSectionsCompleted = lesson.sections.every(section => completedSections.includes(section.id));
    setIsLessonCompleted(allSectionsCompleted);
  }, [completedSections, lesson.sections]);

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
      // Se a aula está completa, remove todas as seções da lista de completadas
      setCompletedSections([]);
    } else {
      // Se a aula não está completa, adiciona todas as seções à lista de completadas
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
    // Implementar lógica para enviar comentário
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
            setShowQuestions={setShowQuestions} 
            showQuestions={showQuestions} 
          />
          {showQuestions && lesson.question && (
            <div className="mt-4">
              <QuestionCard
                question={lesson.question}
                disabledOptions={disabledOptions}
                onToggleDisabled={toggleOptionDisabled}
              />
            </div>
          )}
        </div>
      )}
    </article>
  );
};
