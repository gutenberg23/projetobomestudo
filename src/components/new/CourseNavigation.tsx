
import React from "react";
import { Book, FileText, Activity } from "lucide-react";

export const CourseNavigation: React.FC = () => {
  return (
    <nav className="bg-[rgba(246,248,250,1)] flex min-h-[92px] w-full items-center gap-5 text-[17px] text-slate-500 px-2.5 overflow-x-auto
      [&::-webkit-scrollbar]:w-2
      [&::-webkit-scrollbar]:h-2
      [&::-webkit-scrollbar-track]:bg-slate-100
      [&::-webkit-scrollbar-track]:rounded-full
      [&::-webkit-scrollbar-thumb]:bg-slate-300
      [&::-webkit-scrollbar-thumb]:rounded-full
      [&::-webkit-scrollbar-thumb]:hover:bg-slate-400
    ">
      <button className="flex items-center gap-2.5 px-5 py-4 rounded-[10px] hover:bg-white transition-colors whitespace-nowrap">
        <Book className="w-6 h-6" />
        <span>Todas as Disciplinas</span>
      </button>

      <button className="flex items-center gap-2.5 px-5 py-4 rounded-[10px] hover:bg-white transition-colors whitespace-nowrap">
        <FileText className="w-6 h-6" />
        <span>Edital Verticalizado</span>
      </button>

      <button className="flex items-center gap-2.5 px-5 py-4 rounded-[10px] hover:bg-white transition-colors whitespace-nowrap">
        <Activity className="w-6 h-6" />
        <span>Simulados</span>
      </button>
    </nav>
  );
};

