import { useQuestionManagementStore } from "@/stores/questionManagementStore";
import { fetchQuestionsData } from "@/services/questoesService";
import { toast } from "sonner";
import { QuestionItemType, QuestionOption } from "../../types";
import { Json } from "@/integrations/supabase/types";

export const useFetchQuestionsActions = () => {
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

  const fetchQuestionsAndRelatedData = async (page: number = 1) => {
    try {
      const { questions, dropdownData } = await fetchQuestionsData(page);
      
      setQuestions(questions);
      setDropdownData(dropdownData);
    } catch (error) {
      console.error('Erro ao buscar questões e dados relacionados:', error);
      toast.error('Erro ao carregar questões. Tente novamente.');
      throw error;
    }
  };

  return {
    fetchQuestionsAndRelatedData,
  };
}; 