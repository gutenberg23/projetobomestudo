
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

  const handleClearQuestionStats = async (id: string) => {
    try {
      console.log(`Iniciando limpeza de estatísticas para questão ${id}`);
      
      // Chamar a função RPC que limpa as estatísticas da questão
      const { error } = await supabase
        .rpc('clear_question_stats', { question_id: id });

      if (error) {
        console.error("Erro ao limpar estatísticas:", error);
        throw error;
      }

      // Disparar evento para atualizar os componentes que exibem estatísticas
      if (typeof window !== 'undefined') {
        console.log(`Disparando evento questionStatsCleared para questão ${id}`);
        window.dispatchEvent(new CustomEvent('questionStatsCleared', { 
          detail: { questionId: id } 
        }));
      }

      toast.success("Estatísticas da questão removidas com sucesso!");
      console.log(`Estatísticas da questão ${id} removidas com sucesso`);
    } catch (error) {
      console.error("Erro ao limpar estatísticas da questão:", error);
      toast.error("Erro ao limpar estatísticas. Tente novamente.");
    }
  };

  const handleClearAllQuestionStats = async () => {
    try {
      console.log("Iniciando limpeza de todas as estatísticas");
      
      // Chamar a função RPC que limpa todas as estatísticas
      const { error } = await supabase
        .rpc('clear_all_question_stats');

      if (error) {
        console.error("Erro ao limpar todas as estatísticas:", error);
        throw error;
      }

      // Disparar evento para atualizar os componentes que exibem estatísticas
      if (typeof window !== 'undefined') {
        console.log("Disparando evento questionStatsCleared para todas as questões");
        window.dispatchEvent(new CustomEvent('questionStatsCleared', { 
          detail: { questionId: 'all' } 
        }));
      }

      toast.success("Todas as estatísticas de questões foram removidas com sucesso!");
      console.log("Todas as estatísticas de questões foram removidas com sucesso");
    } catch (error) {
      console.error("Erro ao limpar todas as estatísticas:", error);
      toast.error("Erro ao limpar todas as estatísticas. Tente novamente.");
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
    handleClearQuestionStats,
    handleClearAllQuestionStats
  };
};
