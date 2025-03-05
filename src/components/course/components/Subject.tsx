import React from 'react';
import { ChevronDown, ChevronUp } from "lucide-react";
import { Subject as SubjectType } from '../types/subjects';
import { SubjectLessons } from './SubjectLessons';
interface SubjectProps {
  subject: SubjectType;
  isExpanded: boolean;
  onToggle: () => void;
}
export const Subject: React.FC<SubjectProps> = ({
  subject,
  isExpanded,
  onToggle
}) => {
  return <div className="border-b border-[rgba(246,248,250,1)]">
      <div onClick={onToggle} className="flex min-h-[90px] w-full items-stretch justify-between px-4 cursor-pointer md:px-[15px] my-0">
        <div className="flex min-w-60 w-full items-center justify-between my-0">
          <h2 className="text-xl md:text-[28px] text-[rgba(38,47,60,1)] leading-none w-full mr-5 py-1 font-bold">
            {subject.name}
          </h2>
          <div className="flex items-center gap-4">
            <div className="bg-[rgba(246,248,250,1)] flex items-center gap-2.5 text-xl text-[rgba(241,28,227,1)] text-center w-[76px] p-2.5 rounded-[10px]">
              <div className="bg-white border min-h-[42px] w-14 px-2.5 py-[9px] rounded-[10px] border-[#5f2ebe]">
                {subject.rating}
              </div>
            </div>
            {isExpanded ? <ChevronUp className="w-6 h-6 text-slate-400" /> : <ChevronDown className="w-6 h-6 text-slate-400" />}
          </div>
        </div>
      </div>
      {isExpanded && <SubjectLessons lessons={subject.lessons} />}
    </div>;
};