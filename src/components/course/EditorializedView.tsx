
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";

type Subject = {
  id: number;
  name: string;
  topics: {
    id: number;
    name: string;
    topic: string;
    isDone: boolean;
    isReviewed: boolean;
    importance: 1 | 2 | 3 | 4 | 5;
    difficulty: "Muito Difícil" | "Difícil" | "Médio" | "Fácil" | "Muito Fácil";
    exercisesDone: number;
    hits: number;
    errors: number;
    performance: number;
  }[];
};

const subjects: Subject[] = [
  {
    id: 1,
    name: "Língua Portuguesa",
    topics: [
      {
        id: 0,
        name: "Ortografia.",
        topic: "Conceitos básicos de ortografia e suas aplicações.",
        isDone: true,
        isReviewed: false,
        importance: 5,
        difficulty: "Muito Difícil",
        exercisesDone: 10,
        hits: 8,
        errors: 2,
        performance: 80,
      },
      {
        id: 1,
        name: "Morfologia. Classes de palavras: substantivos, adjetivos, artigos, numerais, advérbios e interjeições.",
        topic: "Estudo das classes gramaticais e suas funções na construção do texto.",
        isDone: false,
        isReviewed: false,
        importance: 3,
        difficulty: "Fácil",
        exercisesDone: 5,
        hits: 3,
        errors: 2,
        performance: 60,
      }
    ]
  },
  {
    id: 2,
    name: "Direito Constitucional",
    topics: [
      {
        id: 0,
        name: "Aplicabilidade das Normas Constitucionais.",
        topic: "Análise dos tipos de normas constitucionais e sua aplicação prática.",
        isDone: true,
        isReviewed: false,
        importance: 4,
        difficulty: "Médio",
        exercisesDone: 15,
        hits: 12,
        errors: 3,
        performance: 80,
      }
    ]
  }
];

const ImportanceStars = ({ level, onChange }: { level: number; onChange?: (value: number) => void }) => {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          className={cn(
            "text-[#F11CE3] transition-opacity",
            star <= level ? "opacity-100" : "opacity-20",
            onChange && "hover:opacity-100"
          )}
        >
          ★
        </button>
      ))}
    </div>
  );
};

export const EditorializedView = () => {
  const [localSubjects, setLocalSubjects] = useState<Subject[]>(subjects);
  const [performanceGoal, setPerformanceGoal] = useState<number>(70);

  const handleInputChange = (
    subjectId: number,
    topicId: number,
    field: 'isDone' | 'isReviewed' | 'importance' | 'difficulty' | 'exercisesDone' | 'hits',
    value: any
  ) => {
    setLocalSubjects(prevSubjects => 
      prevSubjects.map(subject => {
        if (subject.id === subjectId) {
          return {
            ...subject,
            topics: subject.topics.map(topic => {
              if (topic.id === topicId) {
                return {
                  ...topic,
                  [field]: value
                };
              }
              return topic;
            })
          };
        }
        return subject;
      })
    );
  };

  const calculateErrors = (exercisesDone: number, hits: number) => {
    return exercisesDone - hits;
  };

  const calculatePerformance = (hits: number, exercisesDone: number) => {
    if (exercisesDone === 0) return 0;
    return Math.round((hits / exercisesDone) * 100);
  };

  const calculateSubjectTotals = (topics: Subject['topics']) => {
    return topics.reduce((acc, topic) => ({
      exercisesDone: acc.exercisesDone + topic.exercisesDone,
      hits: acc.hits + topic.hits,
      errors: acc.errors + calculateErrors(topic.exercisesDone, topic.hits),
      completedTopics: acc.completedTopics + (topic.isDone ? 1 : 0),
      totalTopics: acc.totalTopics + 1
    }), {
      exercisesDone: 0,
      hits: 0,
      errors: 0,
      completedTopics: 0,
      totalTopics: 0
    });
  };

  const calculateOverallStats = () => {
    return localSubjects.reduce((acc, subject) => {
      const subjectTotals = calculateSubjectTotals(subject.topics);
      return {
        totalExercises: acc.totalExercises + subjectTotals.exercisesDone,
        totalHits: acc.totalHits + subjectTotals.hits,
        totalErrors: acc.totalErrors + subjectTotals.errors,
        completedTopics: acc.completedTopics + subjectTotals.completedTopics,
        totalTopics: acc.totalTopics + subjectTotals.totalTopics
      };
    }, {
      totalExercises: 0,
      totalHits: 0,
      totalErrors: 0,
      completedTopics: 0,
      totalTopics: 0
    });
  };

  const overallStats = calculateOverallStats();
  const overallProgress = Math.round((overallStats.completedTopics / overallStats.totalTopics) * 100) || 0;
  const overallPerformance = Math.round((overallStats.totalHits / overallStats.totalExercises) * 100) || 0;

  return (
    <div className="bg-white rounded-[10px] p-5">
      <div className="mb-8 p-5 border rounded-lg bg-gray-50">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Resumo Geral</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Meta de Aproveitamento:</span>
            <Input
              type="number"
              min="1"
              max="100"
              value={performanceGoal}
              onChange={(e) => setPerformanceGoal(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
              className="w-20 text-center"
            />
            <span className="text-sm text-gray-600">%</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-white rounded-lg shadow">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Evolução Geral</span>
              <span className="font-semibold">{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="h-2" />
          </div>
          <div className="p-4 bg-white rounded-lg shadow">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Aulas Concluídas</span>
                <span className="font-semibold">{overallStats.completedTopics}/{overallStats.totalTopics}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Questões Feitas</span>
                <span className="font-semibold">{overallStats.totalExercises}</span>
              </div>
            </div>
          </div>
          <div className="p-4 bg-white rounded-lg shadow">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Acertos</span>
                <span className="font-semibold text-green-600">{overallStats.totalHits}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Erros</span>
                <span className="font-semibold text-red-600">{overallStats.totalErrors}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Aproveitamento</span>
                <span className="font-semibold">{overallPerformance}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {localSubjects.map((subject) => {
        const subjectTotals = calculateSubjectTotals(subject.topics);
        const subjectProgress = Math.round((subjectTotals.completedTopics / subjectTotals.totalTopics) * 100);
        const subjectPerformance = calculatePerformance(subjectTotals.hits, subjectTotals.exercisesDone);

        return (
          <div key={subject.id} className="mb-8 last:mb-0">
            <div className="flex items-center justify-between bg-[#9747FF] text-white p-3 rounded-t-lg">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-white/20 rounded" />
                <h2 className="text-lg font-semibold">{subject.name}</h2>
              </div>
              <div className="flex items-center gap-3">
                <Progress value={subjectProgress} className="w-24 h-2 bg-white/20" />
                <span className="text-sm">{subjectProgress}%</span>
              </div>
            </div>
            <div className="border border-gray-200 rounded-b-lg overflow-x-auto">
              <table className="w-full min-w-[1200px]">
                <thead className="bg-gray-50">
                  <tr className="text-sm text-gray-600">
                    <th className="py-3 px-4 text-left font-medium w-8">#</th>
                    <th className="py-3 px-4 text-left font-medium">Conclusão</th>
                    <th className="py-3 px-4 text-left font-medium">Tópicos</th>
                    <th className="py-3 px-4 text-left font-medium">Importância do Assunto</th>
                    <th className="py-3 px-4 text-left font-medium">Dificuldade</th>
                    <th className="py-3 px-4 text-center font-medium">Total Exercícios feitos</th>
                    <th className="py-3 px-4 text-center font-medium">Acertos</th>
                    <th className="py-3 px-4 text-center font-medium">Erros</th>
                    <th className="py-3 px-4 text-center font-medium">Aproveitamento</th>
                    <th className="py-3 px-4 text-center font-medium">Revisão</th>
                  </tr>
                </thead>
                <tbody>
                  {subject.topics.map((topic) => (
                    <tr key={topic.id} className="border-t border-gray-200">
                      <td className="py-3 px-4">{topic.id}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={topic.isDone}
                            onChange={(e) => handleInputChange(subject.id, topic.id, 'isDone', e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 text-[#F11CE3] focus:ring-[#F11CE3]"
                          />
                        </div>
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <p className="text-sm text-gray-600">{topic.topic}</p>
                      </td>
                      <td className="py-3 px-4">
                        <ImportanceStars 
                          level={topic.importance} 
                          onChange={(value) => handleInputChange(subject.id, topic.id, 'importance', value)}
                        />
                      </td>
                      <td className="py-3 px-4">
                        <Select 
                          value={topic.difficulty}
                          onValueChange={(value) => 
                            handleInputChange(subject.id, topic.id, 'difficulty', value)
                          }
                        >
                          <SelectTrigger className="w-[140px]">
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
                      <td className="py-3 px-4 text-center">
                        <input
                          type="number"
                          min="0"
                          value={topic.exercisesDone}
                          onChange={(e) => handleInputChange(subject.id, topic.id, 'exercisesDone', parseInt(e.target.value))}
                          className="w-20 text-center border rounded p-1"
                        />
                      </td>
                      <td className="py-3 px-4 text-center">
                        <input
                          type="number"
                          min="0"
                          max={topic.exercisesDone}
                          value={topic.hits}
                          onChange={(e) => handleInputChange(subject.id, topic.id, 'hits', parseInt(e.target.value))}
                          className="w-20 text-center border rounded p-1"
                        />
                      </td>
                      <td className="py-3 px-4 text-center">{calculateErrors(topic.exercisesDone, topic.hits)}</td>
                      <td className={cn(
                        "py-3 px-4 text-center",
                        calculatePerformance(topic.hits, topic.exercisesDone) < performanceGoal ? "bg-[#FFDEE2]" : "bg-[#F2FCE2]"
                      )}>
                        {calculatePerformance(topic.hits, topic.exercisesDone)}%
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={topic.isReviewed}
                            onChange={(e) => handleInputChange(subject.id, topic.id, 'isReviewed', e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 text-[#F11CE3] focus:ring-[#F11CE3]"
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t border-gray-200 bg-gray-50 font-medium">
                    <td colSpan={5} className="py-3 px-4 text-right">Totais:</td>
                    <td className="py-3 px-4 text-center">{subjectTotals.exercisesDone}</td>
                    <td className="py-3 px-4 text-center">{subjectTotals.hits}</td>
                    <td className="py-3 px-4 text-center">{subjectTotals.errors}</td>
                    <td className={cn(
                      "py-3 px-4 text-center",
                      subjectPerformance < performanceGoal ? "bg-[#FFDEE2]" : "bg-[#F2FCE2]"
                    )}>
                      {subjectPerformance}%
                    </td>
                    <td className="py-3 px-4"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
};

