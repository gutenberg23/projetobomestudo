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

const API_URL = import.meta.env.VITE_API_URL || '';

export const generateAIResponse = async (questionData: QuestionData): Promise<string> => {
  try {
    if (!API_URL) {
      throw new Error('URL da API não configurada');
    }

    // Construir o prompt baseado nos dados da questão
    const basePrompt = `Você é um assistente especializado em explicar questões de concursos.
A questão é da disciplina ${questionData.discipline}, nível ${questionData.level} e dificuldade ${questionData.difficulty}.
Os tópicos relacionados são: ${questionData.topicos.join(', ')}.

Questão:
${questionData.text}

Alternativas:
${questionData.options.map(opt => `${opt.letter}) ${opt.text}${opt.isCorrect ? ' (CORRETA)' : ''}`).join('\n')}

${questionData.existingExplanation ? `Existe uma explicação anterior:
${questionData.existingExplanation}

Por favor, reescreva a explicação de uma forma diferente, mantendo a mesma estrutura.` : 'Por favor, explique detalhadamente por que a alternativa correta está correta e por que as outras alternativas estão incorretas.'}

${questionData.prompt ? `\nInstruções adicionais:
${questionData.prompt}` : ''}`;

    console.log('Enviando requisição para a API...', API_URL);

    // Fazer a chamada à API
    const response = await fetch(`${API_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: basePrompt,
        max_tokens: 100000,
        temperature: 0.7,
        top_p: 0.9,
        frequency_penalty: 0.5,
        presence_penalty: 0.5,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Erro na resposta da API:', data);
      throw new Error(data.error || data.details || `Erro ao gerar resposta da IA (status: ${response.status})`);
    }
    
    if (!data.choices || !data.choices[0] || !data.choices[0].text) {
      console.error('Resposta inválida da API:', data);
      throw new Error('Resposta inválida da API');
    }

    return data.choices[0].text.trim();
  } catch (error) {
    console.error("Erro ao gerar resposta da IA:", error);
    throw error instanceof Error ? error : new Error('Erro ao gerar resposta da IA');
  }
};