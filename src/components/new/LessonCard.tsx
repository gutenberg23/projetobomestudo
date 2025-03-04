
"use client";

import React, { useState, useRef, useEffect } from "react";
import type { Lesson } from "./types";
import ItensDaAula from "./ItensDaAula";
import { QuestionCard } from "./QuestionCard";
import { Question } from "./types";
import { LessonHeader } from "./lesson/LessonHeader";
import { VideoContentLayout } from "./lesson/VideoContentLayout";

interface LessonCardProps {
  lesson: Lesson;
  question: Question;
}

export const LessonCard: React.FC<LessonCardProps> = ({
  lesson,
  question
}) => {
  const [selectedSection, setSelectedSection] = useState(lesson.sections[0].id);
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  const [isVideoSectionVisible, setIsVideoSectionVisible] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);
  const [disabledOptions, setDisabledOptions] = useState<string[]>([]);
  const [hasHorizontalScroll, setHasHorizontalScroll] = useState(false);
  const [isLessonCompleted, setIsLessonCompleted] = useState(false);
  const sectionsContainerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLElement>(null);
  const [videoHeight, setVideoHeight] = useState<number>(0);

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
    setSelectedSection(sectionId);
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

  return (
    <article ref={cardRef} className="mb-5 w-full bg-white rounded-xl border border-gray-100 border-solid overflow-hidden">
      <LessonHeader 
        title={lesson.title}
        description={lesson.description}
        isVideoSectionVisible={isVideoSectionVisible}
        isLessonCompleted={isLessonCompleted}
        toggleLessonCompletion={toggleLessonCompletion}
        toggleVideoSection={toggleVideoSection}
      />

      {isVideoSectionVisible && (
        <div className="bg-white pb-5 rounded-lg overflow-hidden">
          <VideoContentLayout 
            selectedSection={selectedSection}
            sections={lesson.sections}
            completedSections={completedSections}
            hasHorizontalScroll={hasHorizontalScroll}
            videoHeight={videoHeight}
            setVideoHeight={setVideoHeight}
            onSectionClick={handleSectionClick}
            onToggleCompletion={toggleCompletion}
          />
          
          <div className="px-3 sm:px-5">
            <div className="mt-6 sm:mt-8">
              <ItensDaAula 
                setShowQuestions={setShowQuestions} 
                showQuestions={showQuestions} 
              />
            </div>
            
            {showQuestions && (
              <div className="mt-6 sm:mt-8">
                <QuestionCard 
                  question={question} 
                  disabledOptions={disabledOptions} 
                  onToggleDisabled={toggleOptionDisabled} 
                />
              </div>
            )}
          </div>
        </div>
      )}
    </article>
  );
};
