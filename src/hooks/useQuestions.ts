import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Question, QuestionOption } from '@/components/new/types';
import { toast } from 'sonner';

type UseQuestionsResult = {
  questions: Question[];
  isLoading: boolean;
  error: Error | null;
  refetch: (sectionId: string) => Promise<void>;
};

/**
 * Hook para carregar questões de um tópico específico
 */
export function useQuestions(initialSectionId?: string): UseQuestionsResult {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const convertToQuestionOptions = (options: any): QuestionOption[] => {
    if (!options) return [];
    let optionsArray: any[] = [];
    
    if (Array.isArray(options)) {
      optionsArray = options;
    } else if (typeof options === 'object') {
      optionsArray = Object.values(options);
    } else {
      return [];
    }
    
    return optionsArray.map(opt => {
      if (typeof opt === 'string') {
        return {
          id: `opt-${Math.random().toString(36).substring(2, 9)}`,
          text: opt,
          isCorrect: false
        };
      }
      return {
        id: typeof opt.id === 'string' ? opt.id : `opt-${Math.random().toString(36).substring(2, 9)}`,
        text: typeof opt.text === 'string' ? opt.text : opt.text || '',
        isCorrect: Boolean(opt.isCorrect)
      };
    });
  };

  const fetchQuestions = async (sectionId: string) => {
    if (!sectionId) return;
    
    setIsLoading(true);
    setError(null);
    setQuestions([]);

    try {
      console.log("Buscando tópico:", sectionId);
      
      // 1. Buscar o tópico para obter os IDs das questões
      const { data: topicoData, error: topicoError } = await supabase
        .from('topicos')
        .select('*')
        .eq('id', sectionId)
        .single();
      
      if (topicoError) {
        console.error("Erro ao buscar tópico:", topicoError);
        if (topicoError.code !== 'PGRST116') { // Não é erro "not found"
          toast.error("Erro ao buscar questões do tópico");
          setError(new Error(topicoError.message));
        }
        setIsLoading(false);
        return;
      }
      
      console.log("Dados do tópico:", topicoData);

      // 2. Verificar se o tópico tem questões associadas
      if (!topicoData.questoes_ids || 
          (Array.isArray(topicoData.questoes_ids) && topicoData.questoes_ids.length === 0) ||
          (typeof topicoData.questoes_ids === 'object' && Object.keys(topicoData.questoes_ids).length === 0)) {
        console.log("Tópico não tem questões vinculadas");
        setIsLoading(false);
        return;
      }

      // 3. Extrair IDs das questões em um formato consistente
      let questoesIds: string[] = [];
      
      if (Array.isArray(topicoData.questoes_ids)) {
        questoesIds = topicoData.questoes_ids.filter(id => id).map(id => String(id));
      } else if (typeof topicoData.questoes_ids === 'object') {
        questoesIds = Object.values(topicoData.questoes_ids).filter(id => id).map(id => String(id));
      } else if (typeof topicoData.questoes_ids === 'string') {
        questoesIds = [topicoData.questoes_ids];
      }
      
      if (questoesIds.length === 0) {
        console.log("Não foi possível extrair IDs de questões válidos");
        setIsLoading(false);
        return;
      }

      // 4. Buscar as questões na tabela 'questoes'
      console.log("Buscando questões com IDs:", questoesIds);
      const { data: questoesData, error: questoesError } = await supabase
        .from('questoes')
        .select('*')
        .in('id', questoesIds);
      
      if (questoesError) {
        console.error("Erro ao buscar questões:", questoesError);
        setError(new Error(questoesError.message));
        setIsLoading(false);
        return;
      }
      
      // 5. Se encontrou questões na tabela 'questoes', formatar e retornar
      if (questoesData && questoesData.length > 0) {
        console.log("Questões encontradas na tabela 'questoes':", questoesData);
        
        const formattedQuestions: Question[] = questoesData.map(q => {
          // Tratando cada campo individualmente para evitar erros de tipo
          return {
            id: q.id,
            year: q.year || "",
            institution: q.institution || "",
            organization: q.organization || "",
            role: q.role || "",
            content: q.content || "",
            additionalContent: q.expandablecontent || undefined,
            teacherExplanation: q.teacherexplanation || undefined,
            aiExplanation: q.aiexplanation || undefined,
            options: convertToQuestionOptions(q.options),
            comments: [],
            // Verificar se o campo images existe antes de tentar acessá-lo
            images: Array.isArray(q.images) ? q.images : []
          };
        });
        
        setQuestions(formattedQuestions);
      } else {
        console.log("Nenhuma questão encontrada para este tópico");
        
        // Verificar se há questões embutidas diretamente no objeto do tópico
        const topicoDataAny = topicoData as any; // Usar any para evitar erros de tipo
        if (topicoDataAny.questoes && 
            Array.isArray(topicoDataAny.questoes) && 
            topicoDataAny.questoes.length > 0) {
          
          console.log("Encontradas questões embutidas no tópico:", topicoDataAny.questoes);
          
          const formattedQuestions: Question[] = topicoDataAny.questoes.map((q: any, index: number) => {
            // Garantir que temos um objeto válido para cada questão
            return {
              id: q.id || `embedded-${index}`,
              year: q.year || q.ano || "",
              institution: q.institution || q.instituicao || "",
              organization: q.organization || q.organizacao || q.banca || "",
              role: q.role || q.cargo || "",
              content: q.content || q.texto || q.conteudo || "",
              additionalContent: q.expandablecontent || q.conteudo_expandido || undefined,
              teacherExplanation: q.teacherexplanation || q.explicacao_professor || undefined,
              aiExplanation: q.aiexplanation || q.explicacao_ia || undefined,
              options: convertToQuestionOptions(q.options || q.alternativas || []),
              comments: [],
              images: Array.isArray(q.images) ? q.images : 
                     Array.isArray(q.imagens) ? q.imagens : []
            };
          });
          
          setQuestions(formattedQuestions);
        }
      }
    } catch (error) {
      console.error("Erro ao buscar questões:", error);
      setError(error instanceof Error ? error : new Error('Erro desconhecido ao buscar questões'));
      toast.error("Erro ao carregar questões");
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar questões iniciais se um ID de seção for fornecido
  useEffect(() => {
    if (initialSectionId) {
      fetchQuestions(initialSectionId);
    }
  }, [initialSectionId]);

  return {
    questions,
    isLoading,
    error,
    refetch: fetchQuestions
  };
}
