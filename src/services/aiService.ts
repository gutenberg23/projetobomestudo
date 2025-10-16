import { supabase } from "@/integrations/supabase/client";

interface QuestionData {
  text: string;
  options: {
    letter: string;
    text: string;
    isCorrect: boolean;
  }[];
  discipline: string;
  level: string;
  difficulty: string;
  topicos: string[];
  existingExplanation?: string;
  prompt?: string;
}

export const generateAIResponse = async (questionData: QuestionData): Promise<string> => {
  try {
    // Construir o prompt baseado nos dados da questão
    let basePrompt = '';
    
    // Se o usuário forneceu um prompt personalizado, usá-lo como principal
    if (questionData.prompt && questionData.prompt.trim()) {
      basePrompt = `Você é um assistente especializado em explicar questões de concursos.

IMPORTANTE: Formate sua resposta usando HTML válido com as seguintes tags:
- Use <strong> para texto em negrito
- Use <em> para texto em itálico
- Use <u> para texto sublinhado
- Use <h3> para títulos de seções
- Use <p> para parágrafos
- Use <ul> e <li> para listas com marcadores
- Use <ol> e <li> para listas numeradas
- Não use Markdown (asteriscos, underscores, etc.)
- Não use backticks ou código formatado

${questionData.prompt}

CONTEXTO DA QUESTÃO:
Disciplina: ${questionData.discipline}
Nível: ${questionData.level}
Dificuldade: ${questionData.difficulty}
Tópicos: ${questionData.topicos.join('; ')}

Questão:
${questionData.text}

Alternativas:
${questionData.options.map(opt => `${opt.letter}) ${opt.text}${opt.isCorrect ? ' (CORRETA)' : ''}`).join('\n')}

${questionData.existingExplanation ? `\nExplicação existente:\n${questionData.existingExplanation}` : ''}`;
    } else {
      // Prompt padrão caso o usuário não forneça um
      basePrompt = `Você é um assistente especializado em explicar questões de concursos.

IMPORTANTE: Formate sua resposta usando HTML válido com as seguintes tags:
- Use <strong> para texto em negrito
- Use <em> para texto em itálico
- Use <u> para texto sublinhado
- Use <h3> para títulos de seções
- Use <p> para parágrafos
- Use <ul> e <li> para listas com marcadores
- Use <ol> e <li> para listas numeradas
- Não use Markdown (asteriscos, underscores, etc.)
- Não use backticks ou código formatado

A questão é da disciplina ${questionData.discipline}, nível ${questionData.level} e dificuldade ${questionData.difficulty}.
Os tópicos relacionados são: ${questionData.topicos.join('; ')}.

Questão:
${questionData.text}

Alternativas:
${questionData.options.map(opt => `${opt.letter}) ${opt.text}${opt.isCorrect ? ' (CORRETA)' : ''}`).join('\n')}

${questionData.existingExplanation ? `Existe uma explicação anterior:
${questionData.existingExplanation}

Por favor, reescreva a explicação de uma forma diferente, mantendo a mesma estrutura e usando HTML para formatação.` : 'Por favor, explique detalhadamente por que a alternativa correta está correta e por que as outras alternativas estão incorretas. Use HTML para formatação.'}`;
    }

    console.log('Enviando requisição para Google Gemini via Supabase Edge Function...');

    // Fazer a chamada à Edge Function do Supabase
    const { data, error } = await supabase.functions.invoke('generate-question-explanation', {
      body: { prompt: basePrompt }
    });

    if (error) {
      console.error('Erro ao chamar Edge Function:', error);
      throw new Error(error.message || 'Erro ao gerar resposta da IA');
    }

    if (!data || !data.text) {
      console.error('Resposta inválida da API:', data);
      throw new Error('Resposta inválida da API');
    }

    return data.text.trim();
  } catch (error) {
    console.error("Erro ao gerar resposta da IA:", error);
    throw error instanceof Error ? error : new Error('Erro ao gerar resposta da IA');
  }
};