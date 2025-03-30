import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";
import { useQuestionManagementStore } from "@/stores/questionManagementStore";

export const useUpdateQuestionActions = (state: ReturnType<typeof import("../useQuestionsState").useQuestionsState>) => {
  const questions = useQuestionManagementStore((state) => state.questions);
  const setQuestions = useQuestionManagementStore((state) => state.setQuestions);

  const handleUpdateQuestion = async () => {
    const {
      questionId, year, institution, organization, role, discipline,
      level, difficulty, questionType, questionText, teacherExplanation,
      aiExplanation, expandableContent, options, setIsEditQuestionCardOpen, 
      setQuestionId, setYear, setInstitution, setOrganization, setRole, 
      setDiscipline, setLevel, setDifficulty, setQuestionType, setQuestionText, 
      setTeacherExplanation, setAIExplanation, setExpandableContent, setOptions, 
      topicos, setTopicos
    } = state;

    // Validar apenas campos obrigatórios
    if (!year || !institution || !organization || !discipline || !questionType || !questionText) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    // Verificar se as opções estão preenchidas para tipos de questão que precisam delas
    if (["Múltipla Escolha", "Certo ou Errado"].includes(questionType)) {
      if (options.length === 0) {
        toast.error("Adicione as alternativas para a questão!");
        return;
      }

      if (questionType === "Múltipla Escolha") {
        // Verificar apenas as 4 primeiras alternativas
        const requiredOptions = options.slice(0, 4);
        if (!requiredOptions.every(opt => opt.text.trim())) {
          toast.error("As 4 primeiras alternativas são obrigatórias");
          return;
        }
      }

      // Verificar se tem pelo menos uma alternativa correta
      if (!options.some(o => o.isCorrect)) {
        toast.error("Selecione a alternativa correta!");
        return;
      }
    }

    try {
      // Construir objeto para atualizar no banco de dados
      const questionData = {
        year,
        institution,
        organization,
        role: role || null,
        discipline,
        level: level || null,
        difficulty: difficulty || null,
        questiontype: questionType,
        content: questionText,
        teacherexplanation: teacherExplanation || null,
        aiexplanation: aiExplanation || null,
        expandablecontent: expandableContent || null,
        options: options as unknown as Json,
        topicos: topicos || [],
        updated_at: new Date().toISOString()
      };

      // Atualizar no banco de dados
      const { error } = await supabase
        .from('questoes')
        .update(questionData)
        .eq('id', questionId);

      if (error) {
        throw error;
      }

      // Atualizar o estado local
      const updatedQuestions = questions.map(q => q.id === questionId ? {
        ...q,
        year,
        institution,
        organization,
        role,
        discipline,
        level,
        difficulty,
        questionType,
        content: questionText,
        teacherExplanation,
        aiExplanation,
        expandableContent,
        options,
        topicos
      } : q);
      
      setQuestions(updatedQuestions);
      setIsEditQuestionCardOpen(false);
      toast.success("Questão atualizada com sucesso!");
      
      // Limpar campos e gerar novo ID
      const now = new Date();
      const newId = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
      setQuestionId(newId);
      setYear("");
      setInstitution("");
      setOrganization("");
      setRole("");
      setDiscipline("");
      setLevel("");
      setDifficulty("");
      setQuestionType("");
      setQuestionText("");
      setTeacherExplanation("");
      setAIExplanation("");
      setExpandableContent("");
      setOptions([]);
      setTopicos([]);
    } catch (error) {
      console.error("Erro ao atualizar questão:", error);
      toast.error("Erro ao atualizar questão. Tente novamente.");
    }
  };

  return {
    handleUpdateQuestion,
  };
};
