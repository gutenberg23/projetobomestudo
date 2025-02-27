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
    setCompletedSections(prev => prev.includes(sectionId) ? prev.filter(id => id !== sectionId) : [...prev, sectionId]);
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
    setDisabledOptions(prev => prev.includes(optionId) ? prev.filter(id => id !== optionId) : [...prev, optionId]);
  };
  return <article ref={cardRef} className="mb-5 w-full bg-white rounded-xl border border-gray-100 border-solid">
      <header className={`flex flex-col justify-center py-3 md:py-6 w-full bg-white ${isVideoSectionVisible ? 'border-b border-gray-100 rounded-t-xl' : 'rounded-xl'}`}>
        <div className="flex justify-between px-5 w-full min-h-[70px]">
          <div className="flex flex-wrap flex-1 shrink justify-between items-center basis-0 min-w-60">
            <div className="flex items-center gap-4 flex-1">
              <div onClick={toggleLessonCompletion} className={`flex shrink-0 self-stretch my-auto w-5 h-5 rounded cursor-pointer ${isLessonCompleted ? "bg-[#F11CE3] border-[#F11CE3]" : "bg-white border border-gray-200"}`}>
                {isLessonCompleted && <svg viewBox="0 0 14 14" fill="none" className="w-4 h-4 m-auto">
                    <path d="M11.083 2.917L4.375 9.625 1.917 7.167" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>}
              </div>
              <div onClick={toggleVideoSection} className="flex flex-col flex-1 shrink justify-center self-stretch pr-5 my-auto basis-0 min-w-60 cursor-pointer py-0">
                <h2 className="text-lg md:text-2xl font-bold leading-none text-slate-800 hover:text-[#F11CE3] transition-colors">
                  {lesson.title}
                </h2>
                <p className="text-xs md:text-sm leading-none text-slate-500">
                  <span className="font-semibold">No edital: </span>
                  <em>{lesson.description}</em>
                </p>
              </div>
            </div>

            <div className="flex gap-2.5 items-center self-stretch p-2.5 my-auto text-xl font-light text-center text-fuchsia-500 whitespace-nowrap rounded-xl bg-slate-50 w-[76px] max-md:flex max-sm:hidden">
              <div className="overflow-hidden gap-2.5 self-stretch px-2.5 py-2.5 my-auto w-14 bg-white rounded-xl border border-fuchsia-500 border-solid min-h-[42px] relative flex items-center justify-center">
                <button onClick={toggleVideoSection} className="w-full h-full flex items-center justify-center hover:bg-slate-50 rounded-full transition-colors">
                  {isVideoSectionVisible ? <ChevronUp className="w-6 h-6 text-slate-600" /> : <ChevronDown className="w-6 h-6 text-slate-600" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {isVideoSectionVisible && <div className="bg-white pb-5 rounded-lg">
          <div className={`flex px-5 mt-5 ${hasHorizontalScroll ? 'flex-col' : 'flex-row'}`}>
            <div className={`${hasHorizontalScroll ? 'w-full' : 'w-2/3'} pr-0 md:pr-5`}>
              <div ref={videoRef} className="aspect-video bg-slate-200 rounded-xl">
                <div className="w-full h-full flex items-center justify-center text-slate-500">
                  Vídeo da aula: {lesson.sections.find(s => s.id === selectedSection)?.title}
                </div>
              </div>
            </div>

            <div className={`${hasHorizontalScroll ? 'w-full mt-4' : 'w-1/3'}`}>
              <div ref={sectionsContainerRef} style={{
            height: hasHorizontalScroll ? 'auto' : `${videoHeight}px`
          }} className={`
                  ${hasHorizontalScroll ? 'overflow-x-auto pb-4' : 'overflow-y-auto'} 
                  pr-2
                  [&::-webkit-scrollbar]:w-2
                  [&::-webkit-scrollbar]:h-2
                  [&::-webkit-scrollbar-track]:bg-slate-100
                  [&::-webkit-scrollbar-track]:rounded-full
                  [&::-webkit-scrollbar-thumb]:bg-slate-300
                  [&::-webkit-scrollbar-thumb]:rounded-full
                  [&::-webkit-scrollbar-thumb]:hover:bg-slate-400
                `}>
                <ul className={`flex gap-2 ${hasHorizontalScroll ? 'flex-row' : 'flex-col'}`}>
                  {lesson.sections.map(section => <li key={section.id} className={hasHorizontalScroll ? 'min-w-[300px]' : ''}>
                      <button onClick={() => handleSectionClick(section.id)} className={`flex justify-between items-center px-4 py-3 w-full text-base font-medium text-left rounded-xl border border-solid min-h-[50px] ${selectedSection === section.id ? "bg-fuchsia-100 border-fuchsia-500 text-fuchsia-500" : "bg-white border-gray-100 text-slate-800"}`}>
                        <div className="flex flex-1 shrink gap-3 items-center self-stretch my-auto w-full basis-0 min-w-60">
                          <div onClick={e => toggleCompletion(section.id, e)} className={`flex shrink-0 gap-2.5 self-stretch my-auto w-5 h-5 rounded border border-solid cursor-pointer ${completedSections.includes(section.id) ? "bg-fuchsia-500 border-fuchsia-500" : selectedSection === section.id ? "bg-fuchsia-100 border-fuchsia-500" : "bg-white border-gray-100"}`}>
                            {completedSections.includes(section.id) && <svg viewBox="0 0 14 14" fill="white" className="w-4 h-4 m-auto">
                                <path d="M11.083 2.917L4.375 9.625 1.917 7.167" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>}
                          </div>
                          <span className="self-stretch my-auto leading-none text-sm">
                            {section.title}
                          </span>
                        </div>
                      </button>
                    </li>)}
                </ul>
              </div>
            </div>
          </div>
          <div className="px-5">
            <div className="mt-8">
              <ItensDaAula setShowQuestions={setShowQuestions} showQuestions={showQuestions} />
            </div>
            {showQuestions && <div className="mt-8">
                <QuestionCard question={question} disabledOptions={disabledOptions} onToggleDisabled={toggleOptionDisabled} />
              </div>}
          </div>
        </div>}
    </article>;
};