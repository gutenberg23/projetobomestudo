import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";
import { QuestionItemType } from "../../types";
import { useQuestionManagementStore } from "@/stores/questionManagementStore";
import { fetchQuestionById } from "@/services/questoesService";

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
    setAssuntos,
    setTopicos,
    setIsEditQuestionCardOpen,
    clearSelectedQuestions
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
      
      // Remover todas as questões selecionadas ao excluir uma
      clearSelectedQuestions();

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
      console.log("Iniciando edição da questão ID:", question.id);
      
      // Buscar diretamente do banco de dados para garantir consistência
      const questionData = await fetchQuestionById(question.id);
      
      console.log("Dados recebidos do banco para edição:", {
        id: questionData.id,
        content: questionData.content,
        teacherExplanation: questionData.teacherexplanation,
        expandableContent: questionData.expandablecontent,
        aiExplanation: questionData.aiexplanation,
        assuntos: questionData.assuntos,
        topicos: questionData.topicos
      });
      
      // Atualizar o estado com os dados da questão obtidos do banco
      setQuestionId(questionData.id);
      setYear(questionData.year || '');
      setInstitution(questionData.institution || '');
      setOrganization(questionData.organization || '');
      setRole(Array.isArray(questionData.role) ? questionData.role : []);
      setDiscipline(questionData.discipline || '');
      setLevel(questionData.level || '');
      setDifficulty(questionData.difficulty || '');
      setQuestionType(questionData.questiontype || '');
      setQuestionText(questionData.content || '');

      // Garantir que os campos TipTap sejam preenchidos corretamente
      const tExplanation = questionData.teacherexplanation || '';
      const eContent = questionData.expandablecontent || '';
      const aExplanation = questionData.aiexplanation || '';
      
      console.log("Definindo campos TipTap:", {
        teacherExplanation: tExplanation,
        expandableContent: eContent,
        aiExplanation: aExplanation
      });
      
      setTeacherExplanation(tExplanation);
      setExpandableContent(eContent);
      setAIExplanation(aExplanation);
      
      // Garantir que options, assuntos e tópicos sejam arrays
      const safeOptions = Array.isArray(questionData.options) ? questionData.options : [];
      const safeAssuntos = Array.isArray(questionData.assuntos) ? questionData.assuntos : [];
      const safeTopicos = Array.isArray(questionData.topicos) ? questionData.topicos : [];
      
      console.log("Definindo campos de arrays:", {
        options: safeOptions.length,
        assuntos: safeAssuntos,
        topicos: safeTopicos
      });
      
      setOptions(safeOptions);
      setAssuntos(safeAssuntos);
      setTopicos(safeTopicos);
      
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
