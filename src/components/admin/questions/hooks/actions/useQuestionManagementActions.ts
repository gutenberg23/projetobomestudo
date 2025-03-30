import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { QuestionItemType } from "../../types";
import { useQuestionManagementStore } from "@/stores/questionManagementStore";

export const useQuestionManagementActions = (state: ReturnType<typeof import("../useQuestionsState").useQuestionsState>) => {
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
    setExpandableContent,
    setAIExplanation,
    setOptions,
    setTopicos,
    setIsEditQuestionCardOpen,
    setSelectedQuestions,
  } = state;

  const setQuestions = useQuestionManagementStore((state) => state.setQuestions);
  const questions = useQuestionManagementStore((state) => state.questions);

  const handleRemoveQuestion = async (id: string) => {
    try {
      const { error } = await supabase
        .from("questoes")
        .delete()
        .eq("id", id);

      if (error) throw error;

      // Atualizar o estado local
      setQuestions(questions.filter(q => q.id !== id));
      
      // Remover a questão da lista de questões selecionadas
      setSelectedQuestions(prev => prev.filter(selectedId => selectedId !== id));

      toast.success("Questão removida com sucesso!");
    } catch (error) {
      console.error("Erro ao remover questão:", error);
      toast.error("Erro ao remover questão.");
    }
  };

  const handleClearQuestionStats = async (id: string) => {
    try {
      const { error } = await supabase.rpc('clear_question_stats', { question_id: id });

      if (error) throw error;

      toast.success("Estatísticas da questão resetadas com sucesso!");
    } catch (error) {
      console.error("Erro ao resetar estatísticas:", error);
      toast.error("Erro ao resetar estatísticas da questão.");
    }
  };

  const handleClearAllQuestionStats = async () => {
    try {
      const { error } = await supabase.rpc('clear_all_question_stats');

      if (error) throw error;

      toast.success("Estatísticas de todas as questões resetadas com sucesso!");
    } catch (error) {
      console.error("Erro ao resetar todas as estatísticas:", error);
      toast.error("Erro ao resetar estatísticas de todas as questões.");
    }
  };

  const handleEditQuestion = async (question: QuestionItemType) => {
    try {
      // Atualizar o estado com os dados da questão
      setQuestionId(question.id);
      setYear(question.year || '');
      setInstitution(question.institution || '');
      setOrganization(question.organization || '');
      setRole(question.role || '');
      setDiscipline(question.discipline || '');
      setLevel(question.level || '');
      setDifficulty(question.difficulty || '');
      setQuestionType(question.questionType || '');
      setQuestionText(question.content || '');
      setTeacherExplanation(question.teacherExplanation || '');
      setExpandableContent(question.expandableContent || '');
      setAIExplanation(question.aiExplanation || '');
      setOptions(question.options || []);
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
    handleClearQuestionStats,
    handleClearAllQuestionStats
  };
};
