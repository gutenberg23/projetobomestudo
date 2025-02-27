
"use client";

import React, { useState, useRef, useEffect } from "react";
import type { Lesson } from "./types";
import { Question } from "./types";
import { renderDonutChart } from "../course/utils/donutChart";
import { LessonHeader } from "./lesson/LessonHeader";
import { VideoSection } from "./lesson/VideoSection";
import { ContentSection } from "./lesson/ContentSection";

interface LessonCardProps {
  lesson: Lesson;
  question: Question;
  onProgressUpdate?: (completedSections: number, totalSections: number) => void;
  onQuestionsUpdate?: (answered: number, correct: number) => void;
}

export const LessonCard: React.FC<LessonCardProps> = ({
  lesson,
  question,
  onProgressUpdate,
  onQuestionsUpdate
}) => {
  const [selectedSection, setSelectedSection] = useState(lesson.sections[0].id);
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  const [isVideoSectionVisible, setIsVideoSectionVisible] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);
  const [disabledOptions, setDisabledOptions] = useState<string[]>([]);
  const [hasHorizontalScroll, setHasHorizontalScroll] = useState(false);
  const [isLessonCompleted, setIsLessonCompleted] = useState(false);
  const sectionsContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLElement>(null);
  const [videoHeight, setVideoHeight] = useState<number>(0);

  useEffect(() => {
    const updateLayout = () => {
      if (videoRef.current) {
        setVideoHeight(videoRef.current.offsetHeight);
      }
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
    const allSectionsCompleted = lesson.sections.every(section =>
      completedSections.includes(section.id)
    );
    setIsLessonCompleted(allSectionsCompleted);

    if (onProgressUpdate) {
      onProgressUpdate(completedSections.length, lesson.sections.length);
    }
  }, [completedSections, lesson.sections, onProgressUpdate]);

  useEffect(() => {
    if (onQuestionsUpdate) {
      const answeredQuestions = disabledOptions.length;
      const correctAnswers = disabledOptions.filter(optionId => 
        question.options.find(opt => opt.id === optionId)?.isCorrect
      ).length;
      onQuestionsUpdate(answeredQuestions, correctAnswers);
    }
  }, [disabledOptions, question.options, onQuestionsUpdate]);

  const checkScroll = () => {
    if (sectionsContainerRef.current) {
      const { scrollWidth, clientWidth } = sectionsContainerRef.current;
      setHasHorizontalScroll(scrollWidth > clientWidth);
    }
  };

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

  return (
    <article ref={cardRef} className="mb-5 w-full bg-white rounded-xl border border-gray-100 border-solid">
      <header className={`flex flex-col justify-center py-3 md:py-6 w-full bg-white ${isVideoSectionVisible ? 'border-b border-gray-100 rounded-t-xl' : 'rounded-xl'}`}>
        <LessonHeader
          title={lesson.title}
          description={lesson.description}
          isLessonCompleted={isLessonCompleted}
          toggleLessonCompletion={toggleLessonCompletion}
          toggleVideoSection={toggleVideoSection}
        />
      </header>

      {isVideoSectionVisible && (
        <div ref={videoRef} className="bg-white pb-5 rounded-lg">
          <VideoSection
            selectedSection={selectedSection}
            sections={lesson.sections}
            completedSections={completedSections}
            hasHorizontalScroll={hasHorizontalScroll}
            videoHeight={videoHeight}
            handleSectionClick={handleSectionClick}
            toggleCompletion={toggleCompletion}
          />
          <ContentSection
            showQuestions={showQuestions}
            setShowQuestions={setShowQuestions}
            question={question}
            disabledOptions={disabledOptions}
            onToggleDisabled={toggleOptionDisabled}
          />
        </div>
      )}
    </article>
  );
};
