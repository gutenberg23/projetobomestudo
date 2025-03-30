import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { QuestionItemType, QuestionOption } from "../../types";
import { Json } from "@/integrations/supabase/types";

export const useFetchQuestionsActions = (state: ReturnType<typeof import("../useQuestionsState").useQuestionsState>) => {
  // Função para converter options do banco para o formato esperado
  const parseOptions = (options: Json | null): QuestionOption[] => {
    if (!options) return [];
    
    // Verificar se options é um array
    if (Array.isArray(options)) {
      return options.map((option: any) => ({
        id: option.id || `option-${Math.random().toString(36).substr(2, 9)}`,
        text: option.text || '',
        isCorrect: Boolean(option.isCorrect)
      }));
    }
    
    return [];
  };

  const fetchQuestionsAndRelatedData = async () => {
    try {
      // Buscar todas as questões
      const { data, error } = await supabase
        .from('questoes')
        .select('*');
      
      if (error) {
        throw error;
      }
      
      // Transformar os dados para o formato esperado pelo componente
      const formattedQuestions: QuestionItemType[] = data.map(q => ({
        id: q.id,
        year: q.year,
        institution: q.institution,
        organization: q.organization,
        role: q.role,
        discipline: q.discipline,
        level: q.level,
        difficulty: q.difficulty,
        questionType: q.questiontype,
        content: q.content,
        teacherExplanation: q.teacherexplanation,
        aiExplanation: q.aiexplanation || "",
        expandableContent: q.expandablecontent || "",
        options: parseOptions(q.options),
        topicos: Array.isArray(q.topicos) ? q.topicos : []
      }));
      
      state.setQuestions(formattedQuestions);
      
      // Extrair valores únicos para cada dropdown
      const institutions = [...new Set(data.map(q => q.institution))].filter(Boolean).sort();
      const organizations = [...new Set(data.map(q => q.organization))].filter(Boolean).sort();
      const roles = [...new Set(data.map(q => q.role))].filter(Boolean).sort();
      const disciplines = [...new Set(data.map(q => q.discipline))].filter(Boolean).sort();
      const levels = [...new Set(data.map(q => q.level))].filter(Boolean).sort();
      const difficulties = [...new Set(data.map(q => q.difficulty))].filter(Boolean).sort();
      const questionTypes = [...new Set(data.map(q => q.questiontype))].filter(Boolean).sort();
      const years = [...new Set(data.map(q => q.year))].filter(Boolean).sort((a, b) => b.localeCompare(a));

      // Atualizar o estado com os valores extraídos
      state.setInstitutions(institutions);
      state.setOrganizations(organizations);
      state.setRoles(roles);
      state.setDisciplines(disciplines);
      state.setLevels(levels);
      state.setDifficulties(difficulties);
      state.setQuestionTypes(questionTypes);
      state.setYears(years);
    } catch (error) {
      console.error('Erro ao carregar questões:', error);
      toast.error('Erro ao carregar questões. Tente novamente.');
    }
  };

  return {
    fetchQuestionsAndRelatedData
  };
}; 