
import { toast } from "sonner";
import { QuestionItemType } from "../../types";
import { supabase } from "@/integrations/supabase/client";

export const useQuestionManagementActions = (state: ReturnType<typeof import("../useQuestionsState").useQuestionsState>) => {
  const handleRemoveQuestion = async (id: string) => {
    try {
      const { questions, setQuestions, setSelectedQuestions } = state;

      // Remover a questão do banco de dados
      const { error } = await supabase
        .from('questoes')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      // Remover a questão do estado local
      const updatedQuestions = questions.filter(q => q.id !== id);
      setQuestions(updatedQuestions);

      // Remover a questão da lista de questões selecionadas, se estiver presente
      const updatedSelectedQuestions = state.selectedQuestions.filter(selectedId => selectedId !== id);
      setSelectedQuestions(updatedSelectedQuestions);

      toast.success("Questão removida com sucesso!");
    } catch (error) {
      console.error("Erro ao remover questão:", error);
      toast.error("Erro ao remover questão. Tente novamente.");
    }
  };

  const handleEditQuestion = async (question: QuestionItemType) => {
    try {
      const {
        setQuestionId,
        setYear,
        setInstitution,
        setOrganization,
        setRole,
        setDiscipline,
        setLevel,
        setDifficulty,
        setQuestionType,
        setQuestionText,
        setTeacherExplanation,
        setAIExplanation,
        setExpandableContent,
        setOptions,
        setTopicos,
        setIsEditQuestionCardOpen
      } = state;

      // Configurar os campos do formulário com os dados da questão
      setQuestionId(question.id);
      setYear(question.year);
      setInstitution(question.institution);
      setOrganization(question.organization);
      setRole(question.role);
      setDiscipline(question.discipline);
      setLevel(question.level);
      setDifficulty(question.difficulty);
      setQuestionType(question.questionType);
      setQuestionText(question.content);
      setTeacherExplanation(question.teacherExplanation);
      setAIExplanation(question.aiExplanation || "");
      setExpandableContent(question.expandableContent || "");
      setOptions(question.options);
      setTopicos(question.topicos || []);
      
      // Abrir o card de edição
      setIsEditQuestionCardOpen(true);
      
      // Rolar para o topo da página
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error("Erro ao editar questão:", error);
      toast.error("Erro ao carregar dados da questão para edição.");
    }
  };
  
  return {
    handleRemoveQuestion,
    handleEditQuestion,
  };
};
