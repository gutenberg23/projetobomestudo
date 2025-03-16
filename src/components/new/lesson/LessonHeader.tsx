"use client";

import React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface LessonHeaderProps {
  title: string;
  description?: string;
  duration?: number;
  isVideoSectionVisible?: boolean;
  isCompleted?: boolean;
  onToggleCompletion?: (event: React.MouseEvent) => void;
  toggleVideoSection?: () => void;
}

export const LessonHeader: React.FC<LessonHeaderProps> = ({
  title,
  description = "",
  duration,
  isVideoSectionVisible = false,
  isCompleted = false,
  onToggleCompletion = () => {},
  toggleVideoSection = () => {}
}) => {
  // Only render duration if it's a valid number greater than 0
  const shouldShowDuration = typeof duration === 'number' && duration > 0;
  
  return (
    <header className={`flex flex-col justify-center py-3 md:py-6 w-full bg-white ${isVideoSectionVisible ? 'border-b border-gray-100 rounded-t-xl' : 'rounded-xl'}`}>
      <div className="flex justify-between px-5 w-full min-h-[70px]">
        <div className="flex flex-wrap flex-1 shrink justify-between items-center basis-0 min-w-60">
          <div className="flex items-center gap-4 flex-1">
            {/* Checkbox */}
            <div 
              onClick={onToggleCompletion} 
              className={`flex shrink-0 self-stretch my-auto w-5 h-5 rounded cursor-pointer ${
                isCompleted ? "bg-[#5f2ebe] border-[#5f2ebe]" : "bg-white border border-gray-200"
              }`}
            >
              {isCompleted && (
                <svg viewBox="0 0 14 14" fill="none" className="w-4 h-4 m-auto">
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
            
            {/* Content */}
            <div className="flex flex-col flex-1 shrink justify-center self-stretch pr-5 my-auto basis-0 min-w-60 py-0">
              {/* Title */}
              <h2 
                onClick={toggleVideoSection}
                className="text-lg md:text-2xl font-bold leading-none text-slate-800 hover:text-[#5f2ebe] transition-colors mb-2 cursor-pointer"
              >
                {title}
              </h2>
              
              {/* Description */}
              {description && description.length > 0 ? (
                <p className="text-xs md:text-sm leading-none text-slate-500">
                  <span className="font-bold">No edital: </span>
                  <em>{description}</em>
                </p>
              ) : null}
              
              {/* Duration - only shown if valid */}
              {shouldShowDuration ? (
                <p className="text-xs text-slate-500 mt-1">
                  <span className="font-medium">Duração estimada: </span>
                  {duration} min
                </p>
              ) : null}
            </div>
          </div>

          {/* Toggle button */}
          {toggleVideoSection && (
            <div className="flex gap-2.5 items-center self-stretch p-2.5 my-auto text-xl font-light text-center text-fuchsia-500 whitespace-nowrap rounded-xl bg-[rgba(246,248,250,1)] w-[76px] max-md:flex max-sm:hidden">
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
          )}
        </div>
      </div>
    </header>
  );
};
