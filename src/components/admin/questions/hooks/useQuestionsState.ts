
import { useState, useEffect } from "react";
import { QuestionItemType, QuestionOption } from "../types";
import { Filters } from "./actions/useFilterActions";

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
  const [expandableContent, setExpandableContent] = useState<string>("");
  const [aiExplanation, setAIExplanation] = useState<string>("");
  const [options, setOptions] = useState<QuestionOption[]>([]);
  const [topicos, setTopicos] = useState<string[]>([]);
  
  // Estado para busca e edição
  const [searchId, setSearchId] = useState<string>("");
  const [questions, setQuestions] = useState<QuestionItemType[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [isEditQuestionCardOpen, setIsEditQuestionCardOpen] = useState<boolean>(false);
  
  // Estado para os filtros com a estrutura correta
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [filters, setFilters] = useState<Filters>({
    disciplina: { key: 'disciplina', isActive: false, value: '' },
    nivel: { key: 'nivel', isActive: false, value: '' },
    institution: { key: 'institution', isActive: false, value: '' },
    organization: { key: 'organization', isActive: false, value: '' },
    role: { key: 'role', isActive: false, value: '' },
    ano: { key: 'ano', isActive: false, value: '' },
    dificuldade: { key: 'dificuldade', isActive: false, value: '' },
    questionType: { key: 'questionType', isActive: false, value: '' }
  });
  
  // Estado para o modal de criar simulado
  const [isSimuladoModalOpen, setIsSimuladoModalOpen] = useState<boolean>(false);
  
  // Estado para opções selecionáveis
  const [institutions, setInstitutions] = useState<string[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [levels, setLevels] = useState<string[]>([]);
  const [difficulties, setDifficulties] = useState<string[]>([]);
  const [disciplines, setDisciplines] = useState<string[]>([]);
  const [questionTypes, setQuestionTypes] = useState<string[]>([]);
  const [years, setYears] = useState<string[]>([]);
  const [organizations, setOrganizations] = useState<string[]>([]);
  
  // Limpar as opções quando o tipo de questão mudar
  useEffect(() => {
    if (!questionType) {
      setOptions([]);
    }
  }, [questionType]);
  
  // Limpar os tópicos quando a disciplina mudar
  useEffect(() => {
    if (!discipline) {
      setTopicos([]);
    }
  }, [discipline]);
  
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
    expandableContent, setExpandableContent,
    aiExplanation, setAIExplanation,
    options, setOptions,
    topicos, setTopicos,
    
    // Search and edit state
    searchId, setSearchId,
    questions, setQuestions,
    selectedQuestions, setSelectedQuestions,
    isEditQuestionCardOpen, setIsEditQuestionCardOpen,
    
    // Filter state
    showFilters, setShowFilters,
    filters, setFilters,
    
    // Simulado modal state
    isSimuladoModalOpen, setIsSimuladoModalOpen,
    
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
