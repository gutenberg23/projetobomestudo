
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { QuestionItemType } from "../../types";
import { useAuth } from "@/contexts/AuthContext";
import { Json } from "@/integrations/supabase/types";

export const useSaveQuestionActions = (state: ReturnType<typeof import("../useQuestionsState").useQuestionsState>) => {
  const { user } = useAuth();

  // Função para salvar questão
  const handleSaveQuestion = async () => {
    const {
      questionId, year, institution, organization, role, discipline,
      level, difficulty, questionType, questionText, teacherExplanation,
      aiExplanation, expandableContent, options, questions, setQuestions, 
      setQuestionId, setYear, setInstitution, setOrganization, setRole, 
      setDiscipline, setLevel, setDifficulty, setQuestionType, setQuestionText, 
      setTeacherExplanation, setAIExplanation, setOptions, topicos, setTopicos, setExpandableContent
    } = state;

    if (
      !year || 
      !institution || 
      !organization || 
      !role || 
      !discipline || 
      !level || 
      !difficulty || 
      !questionType || 
      !questionText
    ) {
      toast.error("Preencha todos os campos obrigatórios!");
      return;
    }

    // Verificar se as opções estão preenchidas para tipos de questão que precisam delas
    if (["Múltipla Escolha", "Certo ou Errado"].includes(questionType)) {
      if (options.length === 0) {
        toast.error("Adicione as alternativas para a questão!");
        return;
      }

      if (questionType === "Múltipla Escolha") {
        // Verificar se todas as alternativas têm texto para múltipla escolha
        const emptyOptions = options.filter(o => !o.text.trim());
        if (emptyOptions.length > 0) {
          toast.error("Todas as alternativas devem ter um texto!");
          return;
        }
      }

      // Verificar se tem pelo menos uma alternativa correta
      if (!options.some(o => o.isCorrect)) {
        toast.error("Selecione a alternativa correta!");
        return;
      }
    }

    if (!user?.id) {
      toast.error("Você precisa estar logado para salvar questões!");
      return;
    }

    try {
      // Construir objeto para salvar no banco de dados
      const questionData = {
        id: questionId,
        year,
        institution,
        organization,
        role,
        discipline,
        level,
        difficulty,
        questiontype: questionType,
        content: questionText,
        teacherexplanation: teacherExplanation,
        aiexplanation: aiExplanation,
        expandablecontent: expandableContent,
        options: options as unknown as Json, // Forçar a conversão para Json
        topicos,
        user_id: user.id
      };

      // Inserir no banco de dados
      const { error } = await supabase
        .from('questoes')
        .insert(questionData);

      if (error) {
        throw error;
      }

      // Atualizar estado local
      const newQuestion: QuestionItemType = {
        id: questionId,
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
      };

      setQuestions([...questions, newQuestion]);

      // Gerar um novo ID para a próxima questão
      const now = new Date();
      const newId = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
      setQuestionId(newId);

      // Limpar campos
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

      toast.success("Questão salva com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar questão:", error);
      toast.error("Erro ao salvar questão. Tente novamente.");
    }
  };

  return {
    handleSaveQuestion,
  };
};
