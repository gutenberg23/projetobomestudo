import { useQuestionsState } from '../useQuestionsState';
import { fetchQuestionsData } from '@/services/questoesService';
import { useQuestionManagementStore } from '@/stores/questionManagementStore';
import { toast } from "sonner";
import { QuestionItemType, QuestionOption } from "../../types";
import { Json } from "@/integrations/supabase/types";

export const useFetchQuestionsActions = () => {
  const state = useQuestionsState();
  const setQuestions = useQuestionManagementStore((state) => state.setQuestions);
  const setDropdownData = useQuestionManagementStore((state) => state.setDropdownData);

  // Função para converter options do banco para o formato esperado
  const parseOptions = (options: Json | null): QuestionOption[] => {
    if (!options) return [];
    
    // Verificar se options é um array
    if (Array.isArray(options)) {
      return options.map((option: any) => ({
        id: option.id || `option-${Math.random().toString(36).substr(2, 9)}`,
        text: option.text || '',
        isCorrect: Boolean(option.isCorrect)
      }));
    }
    
    return [];
  };

  const fetchQuestionsAndRelatedData = async () => {
    try {
      console.log("Iniciando busca de questões e dados relacionados...");
      const { questions, dropdownData } = await fetchQuestionsData();
      
      console.log("Dados de dropdown recebidos:", {
        years: dropdownData.years?.length || 0,
        institutions: dropdownData.institutions?.length || 0,
        organizations: dropdownData.organizations?.length || 0,
        roles: dropdownData.roles?.length || 0,
        disciplines: dropdownData.disciplines?.length || 0,
        levels: dropdownData.levels?.length || 0,
        difficulties: dropdownData.difficulties?.length || 0,
        questionTypes: dropdownData.questionTypes?.length || 0,
        assuntos: dropdownData.assuntos?.length || 0,
        topicos: dropdownData.topicos?.length || 0
      });
      
      const formattedQuestions = questions.map(questao => ({
        id: questao.id,
        year: questao.year || '',
        institution: questao.institution || '',
        organization: questao.organization || '',
        role: questao.role || '',
        discipline: questao.discipline || '',
        level: questao.level || '',
        difficulty: questao.difficulty || '',
        questionType: questao.questiontype || '',
        content: questao.content || '',
        teacherExplanation: questao.teacherexplanation || '',
        aiExplanation: questao.aiexplanation || '',
        expandableContent: questao.expandablecontent || '',
        options: parseOptions(questao.options || []),
        assuntos: questao.assuntos || [],
        topicos: questao.topicos || []
      }));
      setQuestions(formattedQuestions);
      setDropdownData(dropdownData);
      console.log("Dados salvos no store com sucesso!");
    } catch (error) {
      console.error('Erro ao buscar questões:', error);
      throw error;
    }
  };

  return {
    fetchQuestionsAndRelatedData,
  };
}; 