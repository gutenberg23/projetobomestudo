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

export const fetchQuestionsData = async () => {
  try {
    // Buscar todas as questões ordenadas por data de criação (mais recentes primeiro)
    const { data: questoes, error: questoesError } = await supabase
      .from('questoes')
      .select('*')
      .order('created_at', { ascending: false });

    if (questoesError) throw questoesError;

    // Buscar dados para os dropdowns
    const { data: dropdownData, error: dropdownError } = await supabase
      .from('questoes')
      .select('year, institution, organization, role, discipline, level, difficulty, questiontype, assuntos, topicos');

    if (dropdownError) throw dropdownError;

    // Formatar as questões
    const formattedQuestions: QuestionItemType[] = questoes.map(questao => ({
      id: questao.id,
      year: questao.year || '',
      institution: questao.institution || '',
      organization: questao.organization || '',
      role: Array.isArray(questao.role) ? questao.role : [],
      discipline: questao.discipline || '',
      level: questao.level || '',
      difficulty: questao.difficulty || '',
      questionType: questao.questiontype || '',
      content: questao.content || '',
      teacherExplanation: questao.teacherexplanation || '',
      aiExplanation: questao.aiexplanation || '',
      expandableContent: questao.expandablecontent || '',
      options: parseOptions(questao.options || []),
      assuntos: questao.assuntos || [],
      topicos: questao.topicos || []
    }));

    // Formatar dados para os dropdowns
    const formattedDropdownData = {
      years: [...new Set(dropdownData.map(q => q.year))].filter(Boolean),
      institutions: [...new Set(dropdownData.map(q => q.institution))].filter(Boolean),
      organizations: [...new Set(dropdownData.map(q => q.organization))].filter(Boolean),
      roles: [...new Set(dropdownData.flatMap(q => Array.isArray(q.role) ? q.role : []).filter(Boolean))],
      disciplines: [...new Set(dropdownData.map(q => q.discipline))].filter(Boolean),
      levels: [...new Set(dropdownData.map(q => q.level))].filter(Boolean),
      difficulties: [...new Set(dropdownData.map(q => q.difficulty))].filter(Boolean),
      questionTypes: [...new Set(dropdownData.map(q => q.questiontype))].filter(Boolean),
      assuntos: [...new Set(dropdownData.flatMap(q => (Array.isArray(q.assuntos) ? q.assuntos : []).filter(Boolean)))],
      topicos: [...new Set(dropdownData.flatMap(q => (Array.isArray(q.topicos) ? q.topicos : []).filter(Boolean)))]
    };

    return {
      questions: formattedQuestions,
      dropdownData: formattedDropdownData
    };
  } catch (error) {
    console.error('Erro ao buscar questões:', error);
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

    console.log("Dados brutos da questão do banco:", data);
    
    console.log("Campos TipTap da questão:", {
      content: data.content || '',
      teacherExplanation: data.teacherexplanation || '',
      expandableContent: data.expandablecontent || '',
      aiExplanation: data.aiexplanation || ''
    });

    // Retornar os dados formatados para a aplicação
    return {
      ...data,
      options: parseOptions(data.options),
      role: Array.isArray(data.role) ? data.role : [],
      assuntos: Array.isArray(data.assuntos) ? data.assuntos : [],
      topicos: Array.isArray(data.topicos) ? data.topicos : [],
      // Garantindo que os campos TipTap tenham valores corretos
      teacherexplanation: data.teacherexplanation || '',
      aiexplanation: data.aiexplanation || '',
      expandablecontent: data.expandablecontent || ''
    };
  } catch (error) {
    console.error('Erro ao buscar questão:', error);
    throw error;
  }
}; 