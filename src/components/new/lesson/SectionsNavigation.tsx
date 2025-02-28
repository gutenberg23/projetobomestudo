
"use client";

import React from "react";
import type { Section } from "../types";

interface SectionsNavigationProps {
  sections: Section[];
  selectedSection: string;
  completedSections: string[];
  hasHorizontalScroll: boolean;
  videoHeight: number;
  onSectionClick: (sectionId: string) => void;
  onToggleCompletion: (sectionId: string, event: React.MouseEvent) => void;
}

export const SectionsNavigation: React.FC<SectionsNavigationProps> = ({
  sections,
  selectedSection,
  completedSections,
  hasHorizontalScroll,
  videoHeight,
  onSectionClick,
  onToggleCompletion
}) => {
  return (
    <div
      style={{
        height: hasHorizontalScroll ? 'auto' : `${videoHeight}px`,
        maxHeight: hasHorizontalScroll ? '80px' : `${videoHeight}px`
      }}
      className={`
        ${hasHorizontalScroll ? 'overflow-x-auto md:overflow-y-hidden pb-4 overflow-y-auto' : 'overflow-y-auto'} 
        pr-2
        [&::-webkit-scrollbar]:w-2
        [&::-webkit-scrollbar]:h-2
        [&::-webkit-scrollbar-track]:bg-slate-100
        [&::-webkit-scrollbar-track]:rounded-full
        [&::-webkit-scrollbar-thumb]:bg-slate-300
        [&::-webkit-scrollbar-thumb]:rounded-full
        [&::-webkit-scrollbar-thumb]:hover:bg-slate-400
      `}
    >
      <ul className={`flex gap-2 ${hasHorizontalScroll ? 'flex-col md:flex-row' : 'flex-col'}`}>
        {sections.map(section => (
          <li key={section.id} className={hasHorizontalScroll ? 'md:min-w-[300px] md:flex-shrink-0' : ''}>
            <button
              onClick={() => onSectionClick(section.id)}
              className={`flex justify-between items-center px-4 py-3 w-full text-base font-medium text-left rounded-xl border border-solid min-h-[50px] ${
                selectedSection === section.id
                  ? "bg-fuchsia-100 border-fuchsia-500 text-fuchsia-500"
                  : "bg-white border-gray-100 text-slate-800"
              }`}
            >
              <div className="flex flex-1 shrink gap-3 items-center self-stretch my-auto w-full basis-0 min-w-60">
                <div
                  onClick={e => onToggleCompletion(section.id, e)}
                  className={`flex shrink-0 self-stretch my-auto w-5 h-5 rounded cursor-pointer ${
                    completedSections.includes(section.id)
                      ? "bg-[#F11CE3] border-[#F11CE3]"
                      : "bg-white border border-gray-200"
                  }`}
                >
                  {completedSections.includes(section.id) && (
                    <svg
                      viewBox="0 0 14 14"
                      fill="none"
                      className="w-4 h-4 m-auto"
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
                <span className="self-stretch my-auto leading-none text-sm">
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
