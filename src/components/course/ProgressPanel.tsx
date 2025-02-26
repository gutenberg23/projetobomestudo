"use client";

import React, { useEffect, useState } from "react";
import { ProgressSummary } from "./components/ProgressSummary";
import { SubjectCard } from "./components/SubjectCard";

interface SubjectProgress {
  completedSections: number;
  totalSections: number;
  answeredQuestions: number;
  correctAnswers: number;
}

export const ProgressPanel = () => {
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const [subjectsProgress, setSubjectsProgress] = useState<Record<string, SubjectProgress>>({});

  useEffect(() => {
    const handleProgressUpdate = (event: CustomEvent) => {
      const { subjectId, completedSections, totalSections, answeredQuestions, correctAnswers } = event.detail;
      
      setSubjectsProgress(prev => ({
        ...prev,
        [subjectId]: {
          completedSections,
          totalSections,
          answeredQuestions,
          correctAnswers
        }
      }));
    };

    const handleProgressCleanup = (event: CustomEvent) => {
      const { subjectId } = event.detail;
      setSubjectsProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[subjectId];
        return newProgress;
      });
    };

    window.addEventListener('progressUpdate', handleProgressUpdate as EventListener);
    window.addEventListener('progressCleanup', handleProgressCleanup as EventListener);
    
    return () => {
      window.removeEventListener('progressUpdate', handleProgressUpdate as EventListener);
      window.removeEventListener('progressCleanup', handleProgressCleanup as EventListener);
    };
  }, []);

  const totalProgress = Object.values(subjectsProgress).reduce((acc, curr) => ({
    completedSections: acc.completedSections + curr.completedSections,
    totalSections: acc.totalSections + curr.totalSections,
    answeredQuestions: acc.answeredQuestions + curr.answeredQuestions,
    correctAnswers: acc.correctAnswers + curr.correctAnswers
  }), {
    completedSections: 0,
    totalSections: 0,
    answeredQuestions: 0,
    correctAnswers: 0
  });

  const progressPercentage = Math.round((totalProgress.completedSections / totalProgress.totalSections) * 100) || 0;

  const subjects = [{
    name: "Língua Portuguesa",
    rating: 10,
    progress: 75,
    questionsTotal: totalProgress.answeredQuestions,
    questionsCorrect: totalProgress.correctAnswers,
    questionsWrong: totalProgress.answeredQuestions - totalProgress.correctAnswers
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

  return (
    <div className="bg-white rounded-[10px] space-y-4 p-5">
      <h2 className="text-2xl font-bold text-[rgba(38,47,60,1)]">
        Meu Progresso
      </h2>

      <ProgressSummary
        totalCompletedSections={totalProgress.completedSections}
        totalSections={totalProgress.totalSections}
        progressPercentage={progressPercentage}
        totalQuestions={totalProgress.answeredQuestions}
        totalCorrectAnswers={totalProgress.correctAnswers}
        totalWrongAnswers={totalProgress.answeredQuestions - totalProgress.correctAnswers}
      />

      {progressPercentage === 100 && (
        <button 
          className="w-full bg-[#F11CE3] text-white py-3 rounded-xl font-medium hover:bg-[#D10AC1] transition-colors"
        >
          Imprimir Certificado
        </button>
      )}

      <div className="space-y-2">
        {subjects.map(subject => (
          <SubjectCard
            key={subject.name}
            subject={subject}
            isExpanded={expandedSubject === subject.name}
            onToggle={() => setExpandedSubject(expandedSubject === subject.name ? null : subject.name)}
          />
        ))}
      </div>
    </div>
  );
};
