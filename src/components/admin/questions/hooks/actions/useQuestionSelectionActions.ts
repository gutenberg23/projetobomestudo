
import { toast } from "sonner";

export const useQuestionSelectionActions = (state: ReturnType<typeof import("../useQuestionsState").useQuestionsState>) => {
  const toggleQuestionSelection = (id: string) => {
    const { selectedQuestions, setSelectedQuestions } = state;
    
    if (id === '') {
      // Desmarcar todas
      setSelectedQuestions([]);
      return;
    }
    
    if (id.includes(',')) {
      // Selecionar várias
      setSelectedQuestions(id.split(','));
      return;
    }
    
    if (selectedQuestions.includes(id)) {
      setSelectedQuestions(selectedQuestions.filter(qId => qId !== id));
    } else {
      setSelectedQuestions([...selectedQuestions, id]);
    }
  };

  const handleCreateSimulado = () => {
    const { selectedQuestions, setIsSimuladoModalOpen } = state;
    
    if (selectedQuestions.length === 0) {
      toast.error("Selecione pelo menos uma questão para criar o simulado.");
      return;
    }
    
    // Abrir o modal ao invés de apenas mostrar um toast
    setIsSimuladoModalOpen(true);
  };

  return {
    toggleQuestionSelection,
    handleCreateSimulado,
  };
};
