
"use client";

import React from "react";
import { ProgressSummary } from "./components/ProgressSummary";
import { SubjectCard } from "./components/SubjectCard";

export const ProgressPanel = () => {
  const [expandedSubject, setExpandedSubject] = React.useState<string | null>(null);

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

  // Calcula totais com base nos dados das questões
  const totalSections = subjects.reduce((total, subject) => total + 1, 0);
  const totalCompletedSections = subjects.reduce(
    (total, subject) => total + (subject.progress >= 100 ? 1 : 0),
    0
  );
  const progressPercentage = Math.round((totalCompletedSections / totalSections) * 100);

  // Calcula total de questões e respostas corretas
  const totalQuestions = subjects.reduce(
    (total, subject) => total + subject.questionsTotal,
    0
  );
  const totalCorrectAnswers = subjects.reduce(
    (total, subject) => total + subject.questionsCorrect,
    0
  );

  return (
    <div className="bg-white rounded-[10px] space-y-4 p-5">
      <h2 className="text-2xl font-bold text-[rgba(38,47,60,1)]">
        Meu Progresso
      </h2>

      <ProgressSummary
        totalCompletedSections={totalCompletedSections}
        totalSections={totalSections}
        progressPercentage={progressPercentage}
        totalQuestions={totalQuestions}
        totalCorrectAnswers={totalCorrectAnswers}
      />

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
