"use client";

import React, { useState } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ChevronDown, ChevronUp } from "lucide-react";

export const ProgressPanel = () => {
  const [expandedSubject, setExpandedSubject] = React.useState<string | null>(null);

  // Calculate progress based on subjects array from SubjectsList
  const totalSections = subjects.reduce((total, subject) => 
    total + subject.lessons.reduce((lessonTotal, lesson) => 
      lessonTotal + lesson.sections.length, 0), 0);
  
  const totalCompletedSections = subjects.reduce((total, subject) => 
    total + subject.lessons.reduce((lessonTotal, lesson) => {
      // Note: This needs to be connected to the actual completed sections state
      // For now, we'll use a placeholder value
      return lessonTotal + 0;
    }, 0), 0);

  const progressPercentage = Math.round((totalCompletedSections / totalSections) * 100);

  // Calculate total questions and correct answers from all subjects
  const totalQuestions = subjects.reduce((total, subject) => 
    total + subject.lessons.reduce((lessonTotal, lesson) => 
      lessonTotal + 1, 0), 0); // Change 1 to actual question count when available

  const totalCorrectAnswers = 0; // This needs to be connected to actual correct answers

  const calculatePerformance = (hits: number, total: number) => {
    return total > 0 ? Math.round((hits / total) * 100) : 0;
  };
  
  const subjects = [{
    name: "Língua Portuguesa",
    rating: 10,
    progress: 75,
    questionsTotal: 100,
    questionsCorrect: 75,
    questionsWrong: 25
  }, {
    name: "Matemática",
    rating: 10,
    progress: 60,
    questionsTotal: 80,
    questionsCorrect: 48,
    questionsWrong: 32
  }, {
    name: "Direito Constitucional",
    rating: 10,
    progress: 90,
    questionsTotal: 120,
    questionsCorrect: 108,
    questionsWrong: 12
  }, {
    name: "Direito Administrativo",
    rating: 9,
    progress: 45,
    questionsTotal: 90,
    questionsCorrect: 40,
    questionsWrong: 50
  }, {
    name: "Direito Tributário",
    rating: 9,
    progress: 30,
    questionsTotal: 70,
    questionsCorrect: 21,
    questionsWrong: 49
  }, {
    name: "Administração Pública",
    rating: 9,
    progress: 55,
    questionsTotal: 85,
    questionsCorrect: 47,
    questionsWrong: 38
  }, {
    name: "Administração Geral",
    rating: 8,
    progress: 40,
    questionsTotal: 75,
    questionsCorrect: 30,
    questionsWrong: 45
  }, {
    name: "Legislação Específica",
    rating: 8,
    progress: 25,
    questionsTotal: 60,
    questionsCorrect: 15,
    questionsWrong: 45
  }, {
    name: "Direito Econômico",
    rating: 8,
    progress: 35,
    questionsTotal: 65,
    questionsCorrect: 23,
    questionsWrong: 42
  }, {
    name: "Raciocínio Lógico",
    rating: 7,
    progress: 50,
    questionsTotal: 70,
    questionsCorrect: 35,
    questionsWrong: 35
  }];

  const renderDonutChart = (percentage: number, size: number = 42) => {
    const data = [
      { name: 'Progress', value: percentage },
      { name: 'Remaining', value: 100 - percentage }
    ];
    const COLORS = ['rgba(241,28,227,1)', '#E0E0E0'];

    return (
      <div style={{ width: size, height: size }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              innerRadius={size * 0.35}
              outerRadius={size * 0.45}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-[10px] space-y-4 p-5">
      <h2 className="text-2xl font-bold text-[rgba(38,47,60,1)]">
        Meu Progresso
      </h2>

      <div className="flex items-center gap-4">
        <div className="bg-[rgba(246,248,250,1)] flex items-center gap-2.5 px-5 py-4 rounded-[10px]">
          <span className="text-xl text-[rgba(241,28,227,1)]">
            <div className="bg-white border min-h-[42px] w-14 flex items-center justify-center px-2.5 py-[9px] rounded-[10px] border-[rgba(241,28,227,1)] text-center">
              {progressPercentage}%
            </div>
          </span>
        </div>
        <div className="flex-1">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Aulas assistidas: {totalCompletedSections}/{totalSections}</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full">
            <div 
              className="h-full bg-[rgba(241,28,227,1)] rounded-full" 
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-sm text-gray-600 mb-2">Questões respondidas</div>
          <div className="bg-[rgba(246,248,250,1)] p-4 rounded-[10px] text-center">
            <div className="text-2xl font-bold text-[rgba(38,47,60,1)]">{totalCorrectAnswers}</div>
            <div className="text-sm text-gray-600">de {totalQuestions} questões</div>
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-600 mb-2">Questões corretas</div>
          <div className="bg-[rgba(246,248,250,1)] p-4 rounded-[10px] text-center">
            <div className="text-2xl font-bold text-[rgba(38,47,60,1)]">{totalCorrectAnswers}</div>
            <div className="text-sm text-gray-600">de {totalQuestions} questões</div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {subjects.map((subject) => (
          <div key={subject.name} className="bg-[rgba(246,248,250,1)] rounded-[10px]">
            <div 
              className="p-4 cursor-pointer"
              onClick={() => setExpandedSubject(expandedSubject === subject.name ? null : subject.name)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="relative">
                    {renderDonutChart(subject.progress)}
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                      {subject.progress}%
                    </span>
                  </div>
                  <span className="font-medium text-[rgba(38,47,60,1)]">{subject.name}</span>
                </div>
                {expandedSubject === subject.name ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
            </div>
            
            {expandedSubject === subject.name && (
              <div className="px-4 pb-4 space-y-2">
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="bg-white p-2 rounded">
                    <div className="text-gray-600">Total</div>
                    <div className="font-semibold">{subject.questionsTotal}</div>
                  </div>
                  <div className="bg-white p-2 rounded">
                    <div className="text-green-600">Acertos</div>
                    <div className="font-semibold text-green-600">{subject.questionsCorrect}</div>
                  </div>
                  <div className="bg-white p-2 rounded">
                    <div className="text-red-600">Erros</div>
                    <div className="font-semibold text-red-600">{subject.questionsWrong}</div>
                  </div>
                </div>
                <div className="bg-white p-2 rounded text-sm">
                  <div className="text-gray-600">Aproveitamento</div>
                  <div className="font-semibold">
                    {calculatePerformance(subject.questionsCorrect, subject.questionsTotal)}%
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
