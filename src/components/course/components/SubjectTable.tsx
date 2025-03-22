
import React from "react";
import { Subject, Topic } from "../types/editorialized";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, ChevronUp, Star, StarHalf } from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { ImportanceStars } from "./ImportanceStars";

interface SubjectTableProps {
  subject: Subject;
  onTopicChange: (subjectId: string | number, topicId: number, field: keyof Topic, value: any) => void;
  performanceGoal: number;
  isEditing?: boolean;
}

export const SubjectTable = ({ 
  subject, 
  onTopicChange, 
  performanceGoal,
  isEditing = false
}: SubjectTableProps) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  
  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  // Função para calcular se o tópico atingiu a meta de desempenho
  const hasMetPerformanceGoal = (topic: Topic) => {
    if (topic.exercisesDone === 0) return false;
    const performance = Math.round((topic.hits / topic.exercisesDone) * 100);
    return performance >= performanceGoal;
  };

  const renderReadOnlyTopic = (topic: Topic, index: number) => (
    <tr key={index} className="border-b border-gray-200">
      <td className="p-3 text-sm">
        <div className="flex items-center">
          <Checkbox 
            className="mr-2"
            checked={topic.isDone}
            disabled={true}
          />
          <span className={`${topic.isDone ? 'line-through text-gray-400' : ''}`}>
            {topic.topic}
          </span>
        </div>
      </td>
      <td className="p-3 text-sm text-center">
        <ImportanceStars importance={topic.importance} />
      </td>
      <td className="p-3 text-sm text-center">
        <span className="text-gray-800">{topic.difficulty}</span>
      </td>
      <td className="p-3 text-sm text-center">
        <Checkbox 
          className="mx-auto"
          checked={topic.isReviewed}
          disabled={true}
        />
      </td>
      <td className="p-3 text-sm text-center">
        <span>{topic.exercisesDone}</span>
      </td>
      <td className="p-3 text-sm text-center">
        <div className="flex justify-center gap-2">
          <span className="text-[#5f2ebe] font-bold">{topic.hits}</span>
          <span>/</span>
          <span className="text-[#ffac33] font-bold">{topic.errors}</span>
        </div>
      </td>
      <td className="p-3 text-sm text-center">
        <span className={`font-bold ${hasMetPerformanceGoal(topic) ? 'text-green-600' : 'text-red-600'}`}>
          {topic.exercisesDone ? Math.round((topic.hits / topic.exercisesDone) * 100) : 0}%
        </span>
      </td>
    </tr>
  );

  const renderEditableTopic = (topic: Topic, index: number) => (
    <tr key={index} className="border-b border-gray-200">
      <td className="p-3 text-sm">
        <div className="flex items-center">
          <Checkbox 
            className="mr-2"
            checked={topic.isDone}
            onCheckedChange={(checked) => 
              onTopicChange(subject.id, topic.id, 'isDone', checked === true)
            }
          />
          <span className={`${topic.isDone ? 'line-through text-gray-400' : ''}`}>
            {topic.topic}
          </span>
        </div>
      </td>
      <td className="p-3 text-sm text-center">
        <Select 
          value={topic.importance.toString()}
          onValueChange={(value) => onTopicChange(subject.id, topic.id, 'importance', parseInt(value))}
        >
          <SelectTrigger className="w-24 mx-auto">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="100">Muito Alta</SelectItem>
            <SelectItem value="75">Alta</SelectItem>
            <SelectItem value="50">Média</SelectItem>
            <SelectItem value="25">Baixa</SelectItem>
            <SelectItem value="0">Muito Baixa</SelectItem>
          </SelectContent>
        </Select>
      </td>
      <td className="p-3 text-sm text-center">
        <Select 
          value={topic.difficulty}
          onValueChange={(value) => onTopicChange(subject.id, topic.id, 'difficulty', value)}
        >
          <SelectTrigger className="w-24 mx-auto">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Muito Fácil">Muito Fácil</SelectItem>
            <SelectItem value="Fácil">Fácil</SelectItem>
            <SelectItem value="Médio">Médio</SelectItem>
            <SelectItem value="Difícil">Difícil</SelectItem>
            <SelectItem value="Muito Difícil">Muito Difícil</SelectItem>
          </SelectContent>
        </Select>
      </td>
      <td className="p-3 text-sm text-center">
        <Checkbox 
          className="mx-auto"
          checked={topic.isReviewed}
          onCheckedChange={(checked) => 
            onTopicChange(subject.id, topic.id, 'isReviewed', checked === true)
          }
        />
      </td>
      <td className="p-3 text-sm text-center">
        <Input 
          type="number" 
          min="0"
          value={topic.exercisesDone}
          onChange={(e) => onTopicChange(
            subject.id, 
            topic.id, 
            'exercisesDone', 
            Math.max(0, parseInt(e.target.value) || 0)
          )}
          className="w-16 mx-auto text-center"
        />
      </td>
      <td className="p-3 text-sm text-center">
        <div className="flex items-center justify-center gap-2">
          <Input 
            type="number" 
            min="0" 
            value={topic.hits}
            onChange={(e) => {
              const newHits = Math.max(0, parseInt(e.target.value) || 0);
              const newErrors = Math.max(0, topic.exercisesDone - newHits);
              
              onTopicChange(subject.id, topic.id, 'hits', newHits);
              onTopicChange(subject.id, topic.id, 'errors', newErrors);
            }}
            className="w-12 text-center text-[#5f2ebe]"
          />
          <span>/</span>
          <Input 
            type="number" 
            min="0" 
            value={topic.errors}
            onChange={(e) => {
              const newErrors = Math.max(0, parseInt(e.target.value) || 0);
              const newHits = Math.max(0, topic.exercisesDone - newErrors);
              
              onTopicChange(subject.id, topic.id, 'errors', newErrors);
              onTopicChange(subject.id, topic.id, 'hits', newHits);
            }}
            className="w-12 text-center text-[#ffac33]"
          />
        </div>
      </td>
      <td className="p-3 text-sm text-center">
        <span className={`font-bold ${hasMetPerformanceGoal(topic) ? 'text-green-600' : 'text-red-600'}`}>
          {topic.exercisesDone ? Math.round((topic.hits / topic.exercisesDone) * 100) : 0}%
        </span>
      </td>
    </tr>
  );

  return (
    <div className="bg-white rounded-[10px] mb-4 overflow-hidden">
      <div 
        className="p-4 cursor-pointer flex justify-between items-center border-b border-gray-200"
        onClick={handleToggle}
      >
        <h3 className="text-xl font-bold text-[#272f3c]">{subject.name}</h3>
        <div className="flex items-center">
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </div>
      </div>
      
      {isExpanded && (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-3 text-sm font-medium text-gray-700">Tópico</th>
                <th className="p-3 text-sm font-medium text-gray-700 text-center">Importância</th>
                <th className="p-3 text-sm font-medium text-gray-700 text-center">Dificuldade</th>
                <th className="p-3 text-sm font-medium text-gray-700 text-center">Revisado</th>
                <th className="p-3 text-sm font-medium text-gray-700 text-center">Exercícios</th>
                <th className="p-3 text-sm font-medium text-gray-700 text-center">Acertos/Erros</th>
                <th className="p-3 text-sm font-medium text-gray-700 text-center">Desempenho</th>
              </tr>
            </thead>
            <tbody>
              {subject.topics.map((topic, index) => 
                isEditing 
                  ? renderEditableTopic(topic, index) 
                  : renderReadOnlyTopic(topic, index)
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
