
import React, { useState } from "react";
import { Subject, Topic } from "../types/editorialized";
import { CheckCircle2, AlertCircle, ExternalLink } from "lucide-react";
import { ImportanceStars } from "./ImportanceStars";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";

interface SubjectTableProps {
  subject: Subject;
  performanceGoal: number;
  onTopicChange: (subjectId: string | number, topicId: number, field: keyof Topic, value: any) => void;
}

export const SubjectTable: React.FC<SubjectTableProps> = ({ subject, performanceGoal, onTopicChange }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!subject.topics || subject.topics.length === 0) {
    return null;
  }

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-5">
      <div 
        className="flex justify-between items-center p-4 cursor-pointer" 
        onClick={toggleExpanded}
      >
        <h3 className="text-lg font-medium text-[#272f3c]">{subject.name}</h3>
        <div className="text-sm font-medium text-[#67748a]">
          {subject.topics.length} tópicos
        </div>
      </div>

      {isExpanded && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] border-collapse">
            <thead>
              <tr className="bg-[#f6f8fa] border-y border-[#e9ecef]">
                <th className="py-3 px-4 text-left text-sm font-medium text-[#272f3c]">Tópico</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-[#272f3c]">Importância</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-[#272f3c]">Questões</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-[#272f3c]">Desempenho</th>
                <th className="py-3 px-4 text-center text-sm font-medium text-[#272f3c]">Feito</th>
                <th className="py-3 px-4 text-center text-sm font-medium text-[#272f3c]">Revisado</th>
                <th className="py-3 px-4 text-center text-sm font-medium text-[#272f3c]">Link</th>
              </tr>
            </thead>
            <tbody>
              {subject.topics.map((topic, index) => {
                const performance = topic.hits + topic.errors > 0 
                  ? Math.round((topic.hits / (topic.hits + topic.errors)) * 100) 
                  : 0;
                
                const isPerformanceGood = performance >= performanceGoal;
                
                return (
                  <tr key={index} className="border-b border-[#e9ecef] hover:bg-[#f6f8fa]">
                    <td className="py-3 px-4 text-sm text-[#272f3c]">
                      {topic.topic}
                    </td>
                    <td className="py-3 px-4">
                      <ImportanceStars importance={topic.importance} />
                    </td>
                    <td className="py-3 px-4 text-sm text-[#67748a]">
                      {topic.exercisesDone > 0 ? (
                        <span>
                          {topic.hits}/{topic.exercisesDone} ({topic.hits > 0 ? 
                            `${Math.round((topic.hits / topic.exercisesDone) * 100)}%` : 
                            '0%'})
                        </span>
                      ) : (
                        <span>Nenhuma questão feita</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={performance} 
                          className="h-2 w-[100px]" 
                          indicatorClassName={isPerformanceGood ? "bg-green-500" : "bg-amber-500"}
                        />
                        <span className="text-xs text-[#67748a]">{performance}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Checkbox 
                        id={`done-${subject.id}-${topic.id}`}
                        checked={topic.isDone}
                        onCheckedChange={(checked) => 
                          onTopicChange(subject.id, topic.id, 'isDone', Boolean(checked))
                        }
                        className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                      />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Checkbox 
                        id={`reviewed-${subject.id}-${topic.id}`}
                        checked={topic.isReviewed}
                        onCheckedChange={(checked) => 
                          onTopicChange(subject.id, topic.id, 'isReviewed', Boolean(checked))
                        }
                        className="data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
                      />
                    </td>
                    <td className="py-3 px-4 text-center">
                      {topic.link ? (
                        <a 
                          href={topic.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-[#5f2ebe] hover:text-[#5f2ebe]/80"
                        >
                          <ExternalLink size={16} />
                        </a>
                      ) : (
                        <span className="text-[#67748a] text-xs">Sem link</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
