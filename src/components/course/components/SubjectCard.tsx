
import React from 'react';
import { Topic, Subject } from '@/components/course/types/editorialized';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, TrendingDown, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { DifficultyBadge } from './DifficultyBadge';
import { ImportanceStars } from './ImportanceStars';

export interface SubjectCardProps {
  subject: Subject;
  isExpanded?: boolean;
  onToggle?: () => void;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({ subject, isExpanded = false, onToggle }) => {
  const totalTopics = subject.topics.length;
  const completedTopics = subject.topics.filter(topic => topic.isDone).length;
  const completionRate = totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0;

  const calculateSubjectPerformance = () => {
    let totalHits = 0;
    let totalErrors = 0;
    subject.topics.forEach(topic => {
      totalHits += topic.hits;
      totalErrors += topic.errors;
    });
    const totalExercises = totalHits + totalErrors;
    const hitRate = totalExercises > 0 ? (totalHits / totalExercises) * 100 : 0;
    return hitRate;
  };

  const subjectPerformance = calculateSubjectPerformance();

  const getPerformanceColor = (performance: number) => {
    if (performance >= 70) return 'text-green-500';
    if (performance >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  const performanceColor = getPerformanceColor(subjectPerformance);

  return (
    <div className="border rounded-lg shadow-sm bg-white">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-lg font-semibold">{subject.name}</span>
          <Badge variant="secondary">{subject.rating}</Badge>
        </div>
        {onToggle && (
          <button onClick={onToggle} className="text-gray-500 hover:text-gray-700">
            {isExpanded ? <TrendingDown className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
          </button>
        )}
      </div>
      {isExpanded && (
        <div className="border-t">
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-600">Progresso</span>
                  <span className="text-sm text-gray-500">{completedTopics}/{totalTopics}</span>
                </div>
                <Progress value={completionRate} className="h-2" />
              </div>
              <div className="text-right">
                <span className={`font-bold text-xl ${performanceColor}`}>{subjectPerformance.toFixed(1)}%</span>
                <span className="text-sm text-gray-500 ml-1">Performance</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subject.topics.map(topic => (
                <div key={topic.id} className="flex items-center justify-between p-3 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    {topic.isDone ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Circle className="w-5 h-5 text-gray-300" />}
                    <span className="text-sm font-medium">{topic.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DifficultyBadge difficulty={topic.difficulty} />
                    <ImportanceStars value={topic.importance} max={5} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
