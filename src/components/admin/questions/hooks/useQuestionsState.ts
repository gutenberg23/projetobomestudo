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
  const [role, setRole] = useState<string[]>([]);
  const [discipline, setDiscipline] = useState('');
  const [level, setLevel] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [questionType, setQuestionType] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [teacherExplanation, setTeacherExplanation] = useState('');
  const [expandableContent, setExpandableContent] = useState('');
  const [aiExplanation, setAIExplanation] = useState('');
  const [options, setOptions] = useState<QuestionOption[]>([]);
  const [assuntos, setAssuntos] = useState<string[]>([]);
  const [topicos, setTopicos] = useState<string[]>([]);
  const [topicosIds, setTopicosIds] = useState<string[]>([]);

  const questions = useQuestionManagementStore((state) => state.questions);
  const setQuestions = useQuestionManagementStore((state) => state.setQuestions);
  const dropdownData = useQuestionManagementStore((state) => state.dropdownData);

  const updateQuestions = (newQuestions: QuestionItemType[], total: number) => {
    setQuestions(newQuestions);
    setTotalCount(total);
    setTotalPages(Math.ceil(total / ITEMS_PER_PAGE));
  };

  const updatePage = (page: number) => {
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
    if (questionType === 'Múltipla Escolha' && options.length === 0) {
      const initialOptions = Array(5).fill(0).map((_, i) => ({
        id: `option-${Math.random().toString(36).substr(2, 9)}`,
        text: '',
        isCorrect: false
      }));
      setOptions(initialOptions);
    } else if (questionType === 'Certo ou Errado' && options.length === 0) {
      setOptions([
        {
          id: `option-${Math.random().toString(36).substr(2, 9)}`,
          text: 'Certo',
          isCorrect: false
        },
        {
          id: `option-${Math.random().toString(36).substr(2, 9)}`,
          text: 'Errado',
          isCorrect: false
        }
      ]);
    }
  }, [questionType]);

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
    assuntos,
    setAssuntos,
    topicos,
    setTopicos,
    topicosIds,
    setTopicosIds,
    dropdownData
  };
};
