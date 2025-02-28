
import React, { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { ImportanceStars } from "./ImportanceStars";
import { Subject, Topic } from "../types/editorialized";
import { cn } from "@/lib/utils";

interface SubjectTableProps {
  subject: Subject;
  performanceGoal: number;
  onTopicChange: (subjectId: number, topicId: number, field: keyof Topic, value: any) => void;
}

export const SubjectTable = ({ subject, performanceGoal, onTopicChange }: SubjectTableProps) => {
  const [isOpen, setIsOpen] = useState(true);

  const handleToggleOpen = () => {
    setIsOpen(!isOpen);
  };

  const handleCheck = (subjectId: number, topicId: number, field: 'isDone' | 'isReviewed') => {
    onTopicChange(subjectId, topicId, field, !subject.topics[topicId][field]);
  };

  const handleToggleOpen2 = (event: React.MouseEvent) => {
    if (
      !(event.target instanceof HTMLInputElement) &&
      !(event.target instanceof SVGElement) &&
      !(event.target as HTMLElement).classList.contains('importance-stars')
    ) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="bg-white rounded-lg mb-6 overflow-hidden">
      <div 
        className="flex justify-between items-center p-4 cursor-pointer bg-[#f6f8fa]"
        onClick={handleToggleOpen2}
      >
        <h3 className="text-lg font-semibold text-[#262f3c]">{subject.name}</h3>
        <span className="text-[#ea2be2] text-sm font-medium">
          {isOpen ? "Ocultar" : "Mostrar"} {subject.topics.length} tópicos
        </span>
      </div>

      {isOpen && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50">
              <tr className="text-sm text-gray-600">
                <th className="py-3 px-4 text-left font-medium">Tópico</th>
                <th className="py-3 px-4 text-center font-medium">Importância</th>
                <th className="py-3 px-4 text-center font-medium">Dificuldade</th>
                <th className="py-3 px-4 text-center font-medium">Conteúdo</th>
                <th className="py-3 px-4 text-center font-medium">Revisão</th>
                <th className="py-3 px-4 text-center font-medium">Exercícios</th>
                <th className="py-3 px-4 text-center font-medium">Aproveitamento</th>
              </tr>
            </thead>
            <tbody>
              {subject.topics.map((topic, topicIndex) => (
                <tr key={topicIndex} className="border-t border-gray-200">
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-medium text-[#262f3c]">
                        {topic.name}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {topic.topic}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex justify-center importance-stars">
                      <ImportanceStars 
                        importance={topic.importance} 
                        onChange={(value) => onTopicChange(subject.id, topicIndex, 'importance', value)}
                      />
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span 
                      className={cn(
                        "text-sm py-1 px-2 rounded-full",
                        {
                          "bg-green-100 text-green-800": topic.difficulty === "Fácil",
                          "bg-yellow-100 text-yellow-800": topic.difficulty === "Médio",
                          "bg-red-100 text-red-800": topic.difficulty === "Difícil" || topic.difficulty === "Muito Difícil",
                        }
                      )}
                    >
                      {topic.difficulty}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex justify-center">
                      <Checkbox 
                        checked={topic.isDone} 
                        className={`${topic.isDone ? 'border-[#ea2be2] bg-[#ea2be2] text-white' : 'border-gray-300'}`}
                        onCheckedChange={() => handleCheck(subject.id, topicIndex, 'isDone')}
                      />
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex justify-center">
                      <Checkbox 
                        checked={topic.isReviewed} 
                        className={`${topic.isReviewed ? 'border-[#ea2be2] bg-[#ea2be2] text-white' : 'border-gray-300'}`}
                        onCheckedChange={() => handleCheck(subject.id, topicIndex, 'isReviewed')}
                      />
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">{topic.exercisesDone}</td>
                  <td className={cn(
                    "py-3 px-4 text-center",
                    topic.performance < performanceGoal ? "bg-[#FFDEE2]" : "bg-[#F2FCE2]"
                  )}>
                    {topic.performance}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
