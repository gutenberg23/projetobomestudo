
import { useState, useEffect } from "react";
import { QuestionItemType } from "../types";
import { toast } from "sonner";

export const useQuestionsState = () => {
  // Estado para informações da questão
  const [questionId, setQuestionId] = useState<string>("");
  const [year, setYear] = useState<string>("");
  const [institution, setInstitution] = useState<string>("");
  const [organization, setOrganization] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [discipline, setDiscipline] = useState<string>("");
  const [level, setLevel] = useState<string>("");
  const [difficulty, setDifficulty] = useState<string>("");
  const [questionType, setQuestionType] = useState<string>("");
  const [questionText, setQuestionText] = useState<string>("");
  const [teacherExplanation, setTeacherExplanation] = useState<string>("");
  
  // Estado para busca e edição
  const [searchId, setSearchId] = useState<string>("");
  const [questions, setQuestions] = useState<QuestionItemType[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [isEditQuestionCardOpen, setIsEditQuestionCardOpen] = useState<boolean>(false);
  
  // Estado para os filtros
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [filters, setFilters] = useState({
    id: "",
    year: "",
    institution: "",
    organization: "",
    role: "",
    discipline: "",
    level: "",
    difficulty: "",
    questionType: ""
  });
  
  // Estado para opções selecionáveis
  const [institutions, setInstitutions] = useState<string[]>(["IDECAN", "CESPE", "FGV", "VUNESP"]);
  const [roles, setRoles] = useState<string[]>(["Analista", "Técnico", "Auditor", "Escrivão"]);
  const [levels, setLevels] = useState<string[]>(["Básico", "Intermediário", "Avançado"]);
  const [difficulties, setDifficulties] = useState<string[]>(["Fácil", "Médio", "Difícil"]);
  const [disciplines, setDisciplines] = useState<string[]>(["Português", "Matemática", "Direito Constitucional", "Informática"]);
  const [questionTypes, setQuestionTypes] = useState<string[]>(["Múltipla Escolha", "Verdadeiro/Falso", "Discursiva"]);
  const [years, setYears] = useState<string[]>(["2024", "2023", "2022", "2021", "2020", "2019", "2018"]);
  const [organizations, setOrganizations] = useState<string[]>(["Tribunal de Justiça", "Ministério Público", "Polícia Federal", "Receita Federal"]);
  
  // Gerar ID automático para a questão
  useEffect(() => {
    const generateQuestionId = () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      
      return `${year}${month}${day}${hours}${minutes}${seconds}`;
    };
    
    if (!questionId) {
      setQuestionId(generateQuestionId());
    }
  }, [questionId]);

  return {
    // Basic question state
    questionId, setQuestionId,
    year, setYear,
    institution, setInstitution,
    organization, setOrganization,
    role, setRole,
    discipline, setDiscipline,
    level, setLevel,
    difficulty, setDifficulty,
    questionType, setQuestionType,
    questionText, setQuestionText,
    teacherExplanation, setTeacherExplanation,
    
    // Search and edit state
    searchId, setSearchId,
    questions, setQuestions,
    selectedQuestions, setSelectedQuestions,
    isEditQuestionCardOpen, setIsEditQuestionCardOpen,
    
    // Filter state
    showFilters, setShowFilters,
    filters, setFilters,
    
    // Options state
    institutions, setInstitutions,
    roles, setRoles,
    levels, setLevels,
    difficulties, setDifficulties,
    disciplines, setDisciplines,
    questionTypes, setQuestionTypes,
    years, setYears,
    organizations, setOrganizations,
  };
};
