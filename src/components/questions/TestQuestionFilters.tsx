import React, { useState } from "react";
import QuestionFiltersPanelCopy from "./QuestionFiltersPanelCopy";

const TestQuestionFilters: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState({
    disciplines: [] as string[],
    topics: [] as string[],
    institutions: [] as string[],
    organizations: [] as string[],
    roles: [] as string[],
    years: [] as string[],
    educationLevels: [] as string[],
    difficulty: [] as string[],
    subtopics: [] as string[]
  });
  const [questionsPerPage, setQuestionsPerPage] = useState("10");

  const handleFilterChange = (
    category: "topics" | "disciplines" | "institutions" | "organizations" | "roles" | "years" | "educationLevels" | "difficulty" | "subtopics",
    value: string
  ) => {
    setSelectedFilters(prev => {
      const newFilters = { ...prev };
      if (newFilters[category].includes(value)) {
        newFilters[category] = newFilters[category].filter(item => item !== value);
      } else {
        newFilters[category] = [...newFilters[category], value];
      }
      return newFilters;
    });
  };

  const handleApplyFilters = () => {
    console.log("Filtros aplicados:", selectedFilters);
  };

  const filterOptions = {
    disciplines: ["Matemática", "Português", "História", "Geografia"],
    topics: ["Álgebra", "Geometria", "Gramática", "Literatura"],
    institutions: ["CESPE", "FGV", "CESGRANRIO", "INSTITUTO AOCP"],
    organizations: ["Prefeitura", "Tribunal", "Ministério"],
    roles: ["Analista", "Técnico", "Auditor"],
    years: ["2023", "2022", "2021", "2020"],
    educationLevels: ["Superior", "Médio", "Fundamental"],
    difficulty: ["Fácil", "Médio", "Difícil"]
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Teste de Filtros</h1>
      <QuestionFiltersPanelCopy
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedFilters={selectedFilters}
        handleFilterChange={handleFilterChange}
        handleApplyFilters={handleApplyFilters}
        questionsPerPage={questionsPerPage}
        setQuestionsPerPage={setQuestionsPerPage}
        filterOptions={filterOptions}
      />
    </div>
  );
};

export default TestQuestionFilters;