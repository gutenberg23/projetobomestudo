
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const useQuestionManagementActions = (state: ReturnType<typeof import("../useQuestionsState").useQuestionsState>) => {
  // Função para remover questão
  const handleRemoveQuestion = async (id: string) => {
    const { questions, setQuestions } = state;
    
    if (!confirm("Tem certeza que deseja remover esta questão?")) {
      return;
    }
    
    try {
      // Remover do banco de dados
      const { error } = await supabase
        .from('questoes')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      // Remover do estado local
      setQuestions(questions.filter(q => q.id !== id));
      toast.success("Questão removida com sucesso!");
    } catch (error) {
      console.error("Erro ao remover questão:", error);
      toast.error("Erro ao remover questão. Tente novamente.");
    }
  };

  // Função para editar questão
  const handleEditQuestion = async (id: string) => {
    const {
      questions, setQuestionId, setYear, setInstitution,
      setOrganization, setRole, setDiscipline, setLevel,
      setDifficulty, setQuestionType, setQuestionText,
      setTeacherExplanation, setOptions, setIsEditQuestionCardOpen,
      setExpandableContent, setAIExplanation, setTopicos
    } = state;

    try {
      // Buscar questão no estado local
      let question = questions.find(q => q.id === id);
      
      // Se não estiver no estado local, buscar no banco de dados
      if (!question) {
        const { data, error } = await supabase
          .from('questoes')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) {
          throw error;
        }
        
        // Formatar dados para o formato esperado
        question = {
          id: data.id,
          year: data.year,
          institution: data.institution,
          organization: data.organization,
          role: data.role,
          discipline: data.discipline,
          level: data.level,
          difficulty: data.difficulty,
          questionType: data.questionType || data.questiontype,
          content: data.content,
          teacherExplanation: data.teacherExplanation || data.teacherexplanation,
          aiExplanation: data.aiExplanation || data.aiexplanation,
          expandableContent: data.expandableContent || data.expandablecontent,
          options: data.options || [],
          topicos: data.topicos || []
        };
      }

      if (question) {
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
        setExpandableContent(question.expandableContent || "");
        setAIExplanation(question.aiExplanation || "");
        setOptions(question.options || []);
        setTopicos(question.topicos || []);
        setIsEditQuestionCardOpen(true);
      }
    } catch (error) {
      console.error("Erro ao editar questão:", error);
      toast.error("Erro ao carregar questão para edição. Tente novamente.");
    }
  };

  return {
    handleRemoveQuestion,
    handleEditQuestion
  };
};
