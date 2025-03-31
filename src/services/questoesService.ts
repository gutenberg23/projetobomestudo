import { supabase } from "@/integrations/supabase/client";
import { QuestionItemType, QuestionOption } from "@/components/admin/questions/types";
import { Json } from "@/integrations/supabase/types";

export const ITEMS_PER_PAGE = 20;

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

export const fetchQuestionsData = async (page: number = 1) => {
  try {
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE - 1;

    console.log('Buscando questões:', { page, start, end, ITEMS_PER_PAGE });

    // Buscar questões com paginação
    const { data: questionsData, error: questionsError, count } = await supabase
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
      `, { count: 'exact' })
      .range(start, end)
      .order('created_at', { ascending: false });

    if (questionsError) {
      console.error('Erro ao buscar questões:', questionsError);
      throw questionsError;
    }

    // Buscar todos os dados para os dropdowns em uma única consulta
    const { data: allQuestionsData, error: dropdownError } = await supabase
      .from('questoes')
      .select('year, institution, organization, role, discipline, level, difficulty, questiontype, topicos');

    if (dropdownError) {
      console.error('Erro ao buscar dados para dropdowns:', dropdownError);
      throw dropdownError;
    }

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
      years: Array.from(new Set(allQuestionsData.map(q => q.year).filter(Boolean))).sort((a, b) => b.localeCompare(a)),
      institutions: Array.from(new Set(allQuestionsData.map(q => q.institution).filter(Boolean))).sort(),
      organizations: Array.from(new Set(allQuestionsData.map(q => q.organization).filter(Boolean))).sort(),
      roles: Array.from(new Set(allQuestionsData.map(q => q.role).filter(Boolean))).sort(),
      disciplines: Array.from(new Set(allQuestionsData.map(q => q.discipline).filter(Boolean))).sort(),
      levels: Array.from(new Set(allQuestionsData.map(q => q.level).filter(Boolean))).sort(),
      difficulties: Array.from(new Set(allQuestionsData.map(q => q.difficulty).filter(Boolean))).sort(),
      questionTypes: Array.from(new Set(allQuestionsData.map(q => q.questiontype).filter(Boolean))).sort(),
      topicos: Array.from(new Set(allQuestionsData.flatMap(q => (Array.isArray(q.topicos) ? q.topicos : []).filter(Boolean)))).sort()
    };

    const totalCount = count || 0;
    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    console.log('Resultado da busca:', {
      page,
      start,
      end,
      totalCount,
      totalPages,
      questionsCount: questionsData.length,
      questionsData: questionsData.map(q => q.id)
    });

    return {
      questions: formattedQuestions,
      dropdownData,
      totalCount,
      totalPages,
      currentPage: page
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