import { useState, useEffect } from 'react';
import { QuestionOption } from '../types';
import { useQuestionManagementStore } from '@/stores/questionManagementStore';

export const useQuestionsState = () => {
  const dropdownData = useQuestionManagementStore((state) => state.dropdownData);
  
  const [questionId, setQuestionId] = useState('');
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
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [isEditQuestionCardOpen, setIsEditQuestionCardOpen] = useState(false);
  const [isSimuladoModalOpen, setIsSimuladoModalOpen] = useState(false);

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
    selectedQuestions,
    setSelectedQuestions,
    isEditQuestionCardOpen,
    setIsEditQuestionCardOpen,
    isSimuladoModalOpen,
    setIsSimuladoModalOpen,
    // Dados dos dropdowns
    institutions: dropdownData.institutions,
    organizations: dropdownData.organizations,
    roles: dropdownData.roles,
    disciplines: dropdownData.disciplines,
    levels: dropdownData.levels,
    difficulties: dropdownData.difficulties,
    questionTypes: dropdownData.questionTypes,
    years: dropdownData.years
  };
};
