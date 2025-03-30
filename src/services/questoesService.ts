import { supabase } from "@/integrations/supabase/client";
import { QuestionItemType, QuestionOption } from "@/components/admin/questions/types";
import { Json } from "@/integrations/supabase/types";

const parseOptions = (options: Json | null): QuestionOption[] => {
  if (!options) return [];
  
  if (Array.isArray(options)) {
    return options.map((option: any) => ({
      id: option.id || `option-${Math.random().toString(36).substr(2, 9)}`,
      text: option.text || '',
      isCorrect: Boolean(option.isCorrect)
    }));
  }
  
  return [];
};

export const fetchQuestionsData = async () => {
  try {
    // Buscar todas as questões com seus dados
    const { data: questionsData, error: questionsError } = await supabase
      .from('questoes')
      .select(`
        id,
        year,
        institution,
        organization,
        role,
        discipline,
        level,
        difficulty,
        questiontype,
        content,
        teacherexplanation,
        aiexplanation,
        expandablecontent,
        options,
        topicos
      `);

    if (questionsError) throw questionsError;

    // Formatar as questões
    const formattedQuestions: QuestionItemType[] = questionsData.map(q => ({
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

    // Extrair valores únicos para os dropdowns
    const dropdownData = {
      years: [...new Set(questionsData.map(q => q.year))].filter(Boolean).sort((a, b) => b.localeCompare(a)),
      institutions: [...new Set(questionsData.map(q => q.institution))].filter(Boolean).sort(),
      organizations: [...new Set(questionsData.map(q => q.organization))].filter(Boolean).sort(),
      roles: [...new Set(questionsData.map(q => q.role))].filter(Boolean).sort(),
      disciplines: [...new Set(questionsData.map(q => q.discipline))].filter(Boolean).sort(),
      levels: [...new Set(questionsData.map(q => q.level))].filter(Boolean).sort(),
      difficulties: [...new Set(questionsData.map(q => q.difficulty))].filter(Boolean).sort(),
      questionTypes: [...new Set(questionsData.map(q => q.questiontype))].filter(Boolean).sort(),
      topicos: [...new Set(questionsData.flatMap(q => q.topicos || []))].filter(Boolean).sort()
    };

    return {
      questions: formattedQuestions,
      dropdownData
    };
  } catch (error) {
    console.error('Erro ao buscar dados das questões:', error);
    throw error;
  }
};

export const fetchQuestionById = async (questionId: string) => {
  try {
    const { data, error } = await supabase
      .from('questoes')
      .select('*')
      .eq('id', questionId)
      .single();

    if (error) throw error;

    return {
      ...data,
      options: parseOptions(data.options),
      topicos: Array.isArray(data.topicos) ? data.topicos : []
    };
  } catch (error) {
    console.error('Erro ao buscar questão:', error);
    throw error;
  }
}; 