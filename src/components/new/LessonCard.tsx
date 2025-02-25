
"use client";
import React, { useState, useRef, useEffect } from "react";
import type { Lesson } from "./types";
import { ChevronDown, ChevronUp } from "lucide-react";
import ItensDaAula from "./ItensDaAula";
import { QuestionCard } from "./QuestionCard";
import { Question } from "./types";

interface LessonCardProps {
  lesson: Lesson;
  question: Question;
}

export const LessonCard: React.FC<LessonCardProps> = ({ lesson, question }) => {
  const [selectedSection, setSelectedSection] = useState(lesson.sections[0].id);
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  const [isVideoSectionVisible, setIsVideoSectionVisible] = useState(true);
  const [showQuestions, setShowQuestions] = useState(false);
  const [disabledOptions, setDisabledOptions] = useState<string[]>([]);
  const [hasHorizontalScroll, setHasHorizontalScroll] = useState(false);
  const sectionsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkScroll = () => {
      if (sectionsContainerRef.current) {
        const { scrollWidth, clientWidth } = sectionsContainerRef.current;
        setHasHorizontalScroll(scrollWidth > clientWidth);
      }
    };

    checkScroll();
    window.addEventListener('resize', checkScroll);

    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const handleSectionClick = (sectionId: string) => {
    setSelectedSection(sectionId);
  };

  const toggleCompletion = (sectionId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setCompletedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const toggleVideoSection = () => {
    setIsVideoSectionVisible(!isVideoSectionVisible);
  };

  const toggleOptionDisabled = (optionId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setDisabledOptions((prev) =>
      prev.includes(optionId)
        ? prev.filter((id) => id !== optionId)
        : [...prev, optionId]
    );
  };

  const extendedSections = [
    ...lesson.sections,
    ...lesson.sections.map(section => ({
      ...section,
      id: section.id + "_extra",
      title: section.title + " (Extra)",
    }))
  ];

  return (
    <article className="mt-5 w-full bg-white rounded-xl border border-gray-100 border-solid">
      <header className="flex flex-col justify-center py-8 w-full bg-white rounded-xl border-b border-gray-100">
        <div className="flex justify-between px-10 w-full min-h-[90px]">
          <div className="flex flex-wrap flex-1 shrink justify-between items-center basis-0 min-w-60">
            <div className="flex flex-col flex-1 shrink justify-center self-stretch py-1 pr-5 my-auto basis-0 min-w-60">
              <h2 className="text-3xl font-bold leading-none text-slate-800">
                {lesson.title}
              </h2>
              <p className="mt-5 text-xl leading-6 text-slate-500">
                <span>No edital: </span>
                <em>{lesson.description}</em>
              </p>
            </div>

            <div className="flex gap-2.5 items-center self-stretch p-2.5 my-auto text-xl font-light text-center text-fuchsia-500 whitespace-nowrap rounded-xl bg-slate-50 w-[76px] max-md:flex max-sm:hidden">
              <div className="overflow-hidden gap-2.5 self-stretch px-2.5 py-2.5 my-auto w-14 bg-white rounded-xl border border-fuchsia-500 border-solid min-h-[42px] relative flex items-center justify-center">
                <button
                  onClick={toggleVideoSection}
                  className="w-full h-full flex items-center justify-center hover:bg-slate-50 rounded-full transition-colors"
                >
                  {isVideoSectionVisible ? (
                    <ChevronUp className="w-6 h-6 text-slate-600" />
                  ) : (
                    <ChevronDown className="w-6 h-6 text-slate-600" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {isVideoSectionVisible && (
        <div className="bg-white pb-5">
          <div className={`flex px-10 mt-5 ${hasHorizontalScroll ? 'flex-col' : 'flex-row'}`}>
            <div className={`${hasHorizontalScroll ? 'w-full' : 'w-2/3'} pr-5`}>
              <div className="aspect-video bg-slate-200 rounded-xl mb-5">
                <div className="w-full h-full flex items-center justify-center text-slate-500">
                  Vídeo da aula: {extendedSections.find(s => s.id === selectedSection)?.title}
                </div>
              </div>
            </div>

            <div className={`${hasHorizontalScroll ? 'w-full' : 'w-1/3'}`}>
              <div 
                ref={sectionsContainerRef}
                className={`${hasHorizontalScroll ? 'overflow-x-auto' : 'overflow-y-auto h-[400px]'} pr-2`}
              >
                <ul className={`flex gap-2.5 ${hasHorizontalScroll ? 'flex-row' : 'flex-col'}`}>
                  {extendedSections.map((section) => (
                    <li key={section.id} className={hasHorizontalScroll ? 'min-w-[300px]' : ''}>
                      <button
                        onClick={() => handleSectionClick(section.id)}
                        className={`flex justify-between items-center p-5 w-full text-base font-medium text-left rounded-xl border border-solid min-h-[60px] ${
                          selectedSection === section.id
                            ? "bg-fuchsia-100 border-fuchsia-500 text-fuchsia-500"
                            : "bg-white border-gray-100 text-slate-800"
                        }`}
                      >
                        <div className="flex flex-1 shrink gap-4 items-center self-stretch my-auto w-full basis-0 min-w-60">
                          <div
                            onClick={(e) => toggleCompletion(section.id, e)}
                            className={`flex shrink-0 gap-2.5 self-stretch my-auto w-5 h-5 rounded border border-solid cursor-pointer ${
                              completedSections.includes(section.id)
                                ? "bg-fuchsia-500 border-fuchsia-500"
                                : selectedSection === section.id
                                ? "bg-fuchsia-100 border-fuchsia-500"
                                : "bg-white border-gray-100"
                            }`}
                          >
                            {completedSections.includes(section.id) && (
                              <svg
                                viewBox="0 0 14 14"
                                fill="white"
                                className="w-4 h-4 m-auto"
                              >
                                <path d="M11.083 2.917L4.375 9.625 1.917 7.167" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            )}
                          </div>
                          <span className="self-stretch my-auto">{section.title}</span>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <ItensDaAula setShowQuestions={setShowQuestions} showQuestions={showQuestions} />
          {showQuestions && (
            <div className="px-10">
              <QuestionCard 
                question={question} 
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
