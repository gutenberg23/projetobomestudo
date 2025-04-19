import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Json } from "@/integrations/supabase/types";

export const useSaveQuestionActions = (state: ReturnType<typeof import("../useQuestionsState").useQuestionsState>) => {
  const { user } = useAuth();

  // Função para salvar questão
  const handleSaveQuestion = async () => {
    const {
      year, institution, organization, role, discipline,
      level, difficulty, questionType, questionText, teacherExplanation,
      aiExplanation, expandableContent, options, setQuestionText, 
      setTeacherExplanation, setAIExplanation, setOptions, assuntos, setAssuntos, topicos, setTopicos, setExpandableContent,
      setYear, setInstitution, setOrganization, setRole, setDiscipline, setLevel, setDifficulty, setQuestionType
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
      // Gerar UUID para a questão
      const uuid = crypto.randomUUID();

      // Construir objeto para salvar no banco de dados
      const questionData = {
        id: uuid,
        user_id: user.id,
        year,
        institution,
        organization,
        role: role || [],
        discipline,
        level: level || "",
        difficulty: difficulty || "",
        questiontype: questionType,
        content: questionText,
        teacherexplanation: teacherExplanation || "",
        aiexplanation: aiExplanation || "",
        expandablecontent: expandableContent || "",
        options: options as unknown as Json,
        assuntos: assuntos || [],
        topicos: topicos || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Inserir no banco de dados
      const { error } = await supabase
        .from('questoes')
        .insert(questionData);

      if (error) {
        console.error("Erro ao salvar questão:", error);
        if (error.code === '23505') {
          toast.error("Já existe uma questão com este ID. Tente novamente.");
        } else if (error.code === '23502') {
          toast.error("Campos obrigatórios não preenchidos. Verifique todos os campos e tente novamente.");
        } else if (error.code === '23503') {
          toast.error("Erro de referência. Verifique se todos os campos selecionados são válidos.");
        } else {
          toast.error(`Erro ao salvar questão: ${error.message}`);
        }
        return;
      }

      toast.success("Questão salva com sucesso!");

      // Limpar campos
      setYear("");
      setInstitution("");
      setOrganization("");
      setRole([]);
      setDiscipline("");
      setLevel("");
      setDifficulty("");
      setQuestionType("");
      setQuestionText("");
      setTeacherExplanation("");
      setAIExplanation("");
      setExpandableContent("");
      setOptions([]);
      setAssuntos([]);
      setTopicos([]);

    } catch (error) {
      console.error("Erro ao salvar questão:", error);
      if (error instanceof Error) {
        toast.error(`Erro ao salvar questão: ${error.message}`);
      } else {
        toast.error("Erro desconhecido ao salvar questão. Tente novamente.");
      }
    }
  };

  return {
    handleSaveQuestion,
  };
};
