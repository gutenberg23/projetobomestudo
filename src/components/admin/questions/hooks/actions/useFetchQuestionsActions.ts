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

  const fetchQuestionsAndRelatedData = async (page: number) => {
    try {
      state.setLoading(true);
      const response = await fetchQuestionsData(page);
      
      setQuestions(response.questions);
      setDropdownData(response.dropdownData);
      state.updateQuestions(response.questions, response.totalCount);
      state.updatePage(page);
    } catch (error) {
      console.error('Erro ao buscar questões:', error);
      toast.error('Erro ao carregar questões. Tente novamente.');
      throw error;
    } finally {
      state.setLoading(false);
    }
  };

  return {
    fetchQuestionsAndRelatedData,
  };
}; 