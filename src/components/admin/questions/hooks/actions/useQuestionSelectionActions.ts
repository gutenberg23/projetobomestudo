
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
    const { selectedQuestions, setSelectedQuestions } = state;
    
    if (selectedQuestions.length === 0) {
      toast.error("Selecione pelo menos uma questão para criar o simulado.");
      return;
    }
    
    toast.success(`Simulado criado com ${selectedQuestions.length} questões!`);
    setSelectedQuestions([]);
  };

  return {
    toggleQuestionSelection,
    handleCreateSimulado,
  };
};
