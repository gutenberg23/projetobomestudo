
import React, { useState } from 'react';
import { Check, Clock, Star, ChevronDown, ChevronUp, BookOpen, FilePen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { ImportanceStars } from './ImportanceStars';
import { Subject, Topic, SupabaseAula, PerformanceData } from '../types/editorialized';

interface SubjectCardProps {
  subject: Subject;
  totalTopics: number;
  completedTopics: number;
  performance: PerformanceData;
  onClick?: (id: string | number) => void;
  updateTopicProgress?: (subjectId: string | number, topicId: number, field: keyof Topic, value: any) => void;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({
  subject,
  totalTopics,
  completedTopics,
  performance,
  onClick,
  updateTopicProgress
}) => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  
  // Calcular a porcentagem de conclusão
  const completionPercentage = totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0;
  
  // Função para navegar para o link do conteúdo
  const navigateToContent = (link: string) => {
    if (link) {
      navigate(link);
    }
  };
  
  // Função para formatar a porcentagem
  const formatPercentage = (value: number) => {
    return `${Math.round(value)}%`;
  };
  
  // Função para marcar um tópico como concluído
  const markTopicAsDone = (topicId: number) => {
    if (updateTopicProgress) {
      updateTopicProgress(subject.id, topicId, 'isDone', true);
    }
  };
  
  // Função para marcar um tópico como revisado
  const markTopicAsReviewed = (topicId: number) => {
    if (updateTopicProgress) {
      updateTopicProgress(subject.id, topicId, 'isReviewed', true);
    }
  };
  
  // Função para calcular estatísticas de um tópico
  const calculateTopicStats = (topic: Topic) => {
    const totalAttempts = topic.hits + topic.errors;
    const hitRate = totalAttempts > 0 ? (topic.hits / totalAttempts) * 100 : 0;
    
    return {
      totalAttempts,
      hitRate
    };
  };
  
  // Ordenar tópicos por importância (decrescente)
  const sortedTopics = [...subject.topics].sort((a, b) => b.importance - a.importance);

  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300"
      data-testid="subject-card"
    >
      {/* Cabeçalho do card */}
      <div 
        className="px-6 py-5 cursor-pointer flex justify-between items-center"
        onClick={() => onClick && onClick(subject.id)}
      >
        <div>
          <h3 className="text-lg font-semibold text-[#272f3c]">{subject.name}</h3>
          <p className="text-sm text-[#67748a]">{subject.rating}</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="text-right">
            <span className="text-sm font-medium text-[#67748a]">
              {completedTopics}/{totalTopics} concluídos
            </span>
            <div className="flex items-center space-x-2">
              <Progress value={completionPercentage} className="w-20 h-2" />
              <span className="text-xs text-[#67748a]">
                {formatPercentage(completionPercentage)}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="p-0 h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
          >
            {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </Button>
        </div>
      </div>
      
      {/* Lista de tópicos (expandível) */}
      {expanded && (
        <div className="border-t border-gray-100">
          {/* Cabeçalho */}
          <div className="grid grid-cols-12 py-2 px-6 bg-gray-50 text-xs font-medium text-[#67748a]">
            <div className="col-span-6">Tópico</div>
            <div className="col-span-2 text-center">Importância</div>
            <div className="col-span-2 text-center">Desempenho</div>
            <div className="col-span-2 text-center">Ações</div>
          </div>
          
          {/* Lista de tópicos */}
          {sortedTopics.map((topic) => {
            const { totalAttempts, hitRate } = calculateTopicStats(topic);
            
            return (
              <div 
                key={`${subject.id}-${topic.id}`}
                className={`grid grid-cols-12 py-3 px-6 border-b border-gray-100 items-center ${
                  topic.isDone ? 'bg-green-50' : topic.isReviewed ? 'bg-blue-50' : ''
                }`}
              >
                <div className="col-span-6">
                  <div 
                    className="flex items-center cursor-pointer group"
                    onClick={() => navigateToContent(topic.link)}
                  >
                    {topic.isDone ? (
                      <Check size={16} className="mr-2 text-green-500 flex-shrink-0" />
                    ) : topic.isReviewed ? (
                      <Clock size={16} className="mr-2 text-blue-500 flex-shrink-0" />
                    ) : (
                      <BookOpen size={16} className="mr-2 text-gray-400 flex-shrink-0" />
                    )}
                    <span className={`text-sm group-hover:text-primary transition-colors ${
                      topic.isDone ? 'text-green-700' : 
                      topic.isReviewed ? 'text-blue-700' : 'text-[#272f3c]'
                    }`}>
                      {topic.name}
                    </span>
                  </div>
                </div>
                
                <div className="col-span-2 text-center">
                  <ImportanceStars value={topic.importance} max={100} size="sm" />
                </div>
                
                <div className="col-span-2 text-center">
                  {totalAttempts > 0 ? (
                    <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium" style={{
                      backgroundColor: hitRate >= 70 ? 'rgba(16, 185, 129, 0.1)' : 
                                        hitRate >= 50 ? 'rgba(245, 158, 11, 0.1)' : 
                                        'rgba(239, 68, 68, 0.1)',
                      color: hitRate >= 70 ? 'rgb(16, 185, 129)' : 
                             hitRate >= 50 ? 'rgb(245, 158, 11)' : 
                             'rgb(239, 68, 68)'
                    }}>
                      {formatPercentage(hitRate)}
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">Sem dados</span>
                  )}
                </div>
                
                <div className="col-span-2 flex justify-center space-x-1">
                  {!topic.isDone && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-green-600 hover:text-green-800 hover:bg-green-50"
                      onClick={() => markTopicAsDone(topic.id)}
                      title="Marcar como concluído"
                    >
                      <Check size={16} />
                    </Button>
                  )}
                  
                  {!topic.isReviewed && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                      onClick={() => markTopicAsReviewed(topic.id)}
                      title="Marcar como revisado"
                    >
                      <FilePen size={16} />
                    </Button>
                  )}
                  
                  {topic.link && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-purple-600 hover:text-purple-800 hover:bg-purple-50"
                      onClick={() => navigateToContent(topic.link)}
                      title="Visualizar conteúdo"
                    >
                      <BookOpen size={16} />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
          
          {/* Resumo de desempenho */}
          <div className="p-4 bg-gray-50">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <h4 className="text-xs font-medium text-[#67748a] mb-2">Taxa de Acerto</h4>
                <div className="flex items-center">
                  <div className="w-full mr-4">
                    <Progress 
                      value={performance.hitRate} 
                      className="h-2.5" 
                      indicatorClassName={`${
                        performance.hitRate >= 70 ? 'bg-green-500' : 
                        performance.hitRate >= 50 ? 'bg-yellow-500' : 
                        'bg-red-500'
                      }`} 
                    />
                  </div>
                  <span className="text-sm font-medium">
                    {formatPercentage(performance.hitRate)}
                  </span>
                </div>
              </div>
              
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <h4 className="text-xs font-medium text-[#67748a] mb-2">Progresso</h4>
                <div className="flex items-center">
                  <div className="w-full mr-4">
                    <Progress 
                      value={completionPercentage} 
                      className="h-2.5" 
                      indicatorClassName="bg-primary" 
                    />
                  </div>
                  <span className="text-sm font-medium">
                    {formatPercentage(completionPercentage)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
