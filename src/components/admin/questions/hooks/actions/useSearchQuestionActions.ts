
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const useSearchQuestionActions = (state: ReturnType<typeof import("../useQuestionsState").useQuestionsState>) => {
  // Função para buscar questão
  const handleSearchQuestion = async () => {
    const {
      searchId, questions, setQuestionId, setYear, setInstitution,
      setOrganization, setRole, setDiscipline, setLevel, setDifficulty,
      setQuestionType, setQuestionText, setTeacherExplanation, setOptions,
      setIsEditQuestionCardOpen, setExpandableContent, setAIExplanation, setTopicos
    } = state;

    if (!searchId.trim()) {
      toast.error("Digite o ID da questão para buscar");
      return;
    }

    try {
      // Primeiro, verificar se a questão está no estado local
      let question = questions.find(q => q.id === searchId);
      
      // Se não estiver no estado local, buscar no banco de dados
      if (!question) {
        const { data, error } = await supabase
          .from('questoes')
          .select('*')
          .eq('id', searchId)
          .single();
        
        if (error) {
          if (error.code === 'PGRST116') {
            // PGRST116 é o código para "não encontrado" no supabase
            toast.error("Questão não encontrada!");
            return;
          }
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
          questionType: data.questiontype,
          content: data.content,
          teacherExplanation: data.teacherexplanation,
          aiExplanation: data.aiexplanation,
          expandableContent: data.expandablecontent,
          options: Array.isArray(data.options) ? data.options : [],
          topicos: Array.isArray(data.topicos) ? data.topicos : []
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
        toast.success("Questão encontrada!");
      } else {
        toast.error("Questão não encontrada!");
      }
    } catch (error) {
      console.error("Erro ao buscar questão:", error);
      toast.error("Erro ao buscar questão. Tente novamente.");
    }
  };

  return {
    handleSearchQuestion,
  };
};
