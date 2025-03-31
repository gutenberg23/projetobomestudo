import { useState, useEffect } from 'react';
import { QuestionOption, QuestionItemType } from '../types';
import { useQuestionManagementStore } from '@/stores/questionManagementStore';
import { ITEMS_PER_PAGE } from "@/services/questoesService";

export const useQuestionsState = () => {
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isEditQuestionCardOpen, setIsEditQuestionCardOpen] = useState(false);
  const [isSimuladoModalOpen, setIsSimuladoModalOpen] = useState(false);
  const [questionId, setQuestionId] = useState<string>('');
  const [year, setYear] = useState('');
  const [institution, setInstitution] = useState('');
  const [organization, setOrganization] = useState('');
  const [role, setRole] = useState('');
  const [discipline, setDiscipline] = useState('');
  const [level, setLevel] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [questionType, setQuestionType] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [teacherExplanation, setTeacherExplanation] = useState('');
  const [expandableContent, setExpandableContent] = useState('');
  const [aiExplanation, setAIExplanation] = useState('');
  const [options, setOptions] = useState<QuestionOption[]>([]);
  const [topicos, setTopicos] = useState<string[]>([]);

  const questions = useQuestionManagementStore((state) => state.questions);
  const setQuestions = useQuestionManagementStore((state) => state.setQuestions);
  const dropdownData = useQuestionManagementStore((state) => state.dropdownData);

  const updateQuestions = (newQuestions: QuestionItemType[], total: number) => {
    console.log('Atualizando questões:', { total, newQuestionsLength: newQuestions.length });
    setQuestions(newQuestions);
    setTotalCount(total);
    setTotalPages(Math.ceil(total / ITEMS_PER_PAGE));
  };

  const updatePage = (page: number) => {
    console.log('Atualizando página:', page);
    setCurrentPage(page);
  };

  const toggleQuestionSelection = (questionId: string) => {
    setSelectedQuestions(prev => {
      if (prev.includes(questionId)) {
        return prev.filter(id => id !== questionId);
      }
      return [...prev, questionId];
    });
  };

  const clearSelectedQuestions = () => {
    setSelectedQuestions([]);
  };

  // Limpar as opções quando o tipo de questão mudar
  useEffect(() => {
    if (questionType === 'Múltipla Escolha') {
      setOptions([]);
    }
  }, [questionType]);

  // Garantir que sempre existam 5 opções para questões de múltipla escolha
  useEffect(() => {
    if (questionType === 'Múltipla Escolha') {
      const currentOptions = [...options];
      while (currentOptions.length < 5) {
        currentOptions.push({
          id: `option-${Math.random().toString(36).substr(2, 9)}`,
          text: '',
          isCorrect: false
        });
      }
      setOptions(currentOptions);
    }
  }, [questionType, options]);

  return {
    questions,
    selectedQuestions,
    currentPage,
    totalPages,
    totalCount,
    loading,
    setLoading,
    updateQuestions,
    updatePage,
    toggleQuestionSelection,
    clearSelectedQuestions,
    isEditQuestionCardOpen,
    setIsEditQuestionCardOpen,
    isSimuladoModalOpen,
    setIsSimuladoModalOpen,
    questionId,
    setQuestionId,
    year,
    setYear,
    institution,
    setInstitution,
    organization,
    setOrganization,
    role,
    setRole,
    discipline,
    setDiscipline,
    level,
    setLevel,
    difficulty,
    setDifficulty,
    questionType,
    setQuestionType,
    questionText,
    setQuestionText,
    teacherExplanation,
    setTeacherExplanation,
    expandableContent,
    setExpandableContent,
    aiExplanation,
    setAIExplanation,
    options,
    setOptions,
    topicos,
    setTopicos,
    dropdownData
  };
};
