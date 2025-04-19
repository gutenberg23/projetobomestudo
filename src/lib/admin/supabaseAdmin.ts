import { createClient } from '@supabase/supabase-js';
import { Assunto, Topico } from '../../components/admin/questions/types';

// URL do Supabase e chave de serviço
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '';

// Cliente admin do Supabase com a chave de serviço que ignora RLS
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Funções administrativas para gerenciar assuntos e tópicos
 * Estas funções usam o cliente admin do Supabase que pode ignorar as políticas RLS
 */

// Interface para novos assuntos
interface NovoAssunto {
  nome: string;
  disciplina: string;
}

// Interface para novos tópicos
interface NovoTopico {
  nome: string;
  assunto: string;
  disciplina: string;
}

/**
 * Busca todos os assuntos de uma disciplina
 * @param disciplina Nome da disciplina
 */
export const buscarAssuntos = async (disciplina: string) => {
  try {
    console.log("Buscando assuntos para disciplina:", disciplina);
    
    // Acesso direto à tabela como admin
    const { data, error } = await supabaseAdmin
      .from('assuntos')
      .select('*')
      .eq('disciplina', disciplina);
      
    if (error) {
      console.error('Erro ao buscar assuntos:', error);
      return [];
    }
    
    // Agora vamos buscar também assuntos que possam existir em questões
    // mas que ainda não foram cadastrados na tabela assuntos
    const { data: questoesData, error: questoesError } = await supabaseAdmin
      .from('questoes')
      .select('assuntos')
      .eq('discipline', disciplina)
      .not('assuntos', 'is', null);
    
    if (questoesError) {
      console.error('Erro ao buscar assuntos das questões:', questoesError);
      return data || [];
    }
    
    // Se temos resultados da tabela questoes, vamos extrair os assuntos únicos
    let assuntosFromQuestoes: Assunto[] = [];
    if (questoesData && questoesData.length > 0) {
      // Extrair todos os assuntos de todas as questões
      const todosAssuntos: string[] = [];
      questoesData.forEach(questao => {
        if (questao.assuntos && Array.isArray(questao.assuntos)) {
          todosAssuntos.push(...questao.assuntos);
        }
      });
      
      // Filtrar duplicados
      const assuntosUnicos = [...new Set(todosAssuntos)];
      
      // Verificar quais assuntos ainda não estão na tabela assuntos
      const assuntosExistentes = data ? data.map(a => a.nome) : [];
      const assuntosNovos = assuntosUnicos.filter(a => !assuntosExistentes.includes(a));
      
      // Criar objetos para os novos assuntos
      assuntosFromQuestoes = assuntosNovos.map(nome => ({
        id: `temp-${nome.replace(/\s+/g, '-').toLowerCase()}`,
        nome,
        disciplina
      }));
    }
    
    // Combinar os resultados
    return [...(data || []), ...assuntosFromQuestoes];
  } catch (error) {
    console.error('Erro ao buscar assuntos:', error);
    return [];
  }
};

/**
 * Adiciona um novo assunto
 * @param assunto Dados do novo assunto
 */
export const adicionarAssunto = async (assunto: NovoAssunto) => {
  try {
    // Acesso direto à tabela como admin
    const { data, error } = await supabaseAdmin
      .from('assuntos')
      .insert({
        nome: assunto.nome,
        disciplina: assunto.disciplina
      })
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao adicionar assunto:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Erro ao adicionar assunto:', error);
    throw error;
  }
};

/**
 * Adiciona um novo tópico
 * @param topico Dados do novo tópico
 */
export const adicionarTopico = async (topico: NovoTopico) => {
  try {
    // Acesso direto à tabela como admin
    const { data, error } = await supabaseAdmin
      .from('topicos')
      .insert({
        nome: topico.nome,
        assunto: topico.assunto,
        disciplina: topico.disciplina
      })
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao adicionar tópico:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Erro ao adicionar tópico:', error);
    throw error;
  }
};

/**
 * Atualiza um assunto existente
 * @param id ID do assunto
 * @param nome Novo nome do assunto
 */
export const atualizarAssunto = async (id: string, nome: string) => {
  try {
    // Acesso direto à tabela como admin
    const { error } = await supabaseAdmin
      .from('assuntos')
      .update({ nome })
      .eq('id', id);
    
    if (error) {
      console.error('Erro ao atualizar assunto:', error);
      throw error;
    }
    
    return { id, nome };
  } catch (error) {
    console.error('Erro ao atualizar assunto:', error);
    throw error;
  }
};

/**
 * Remove um assunto existente
 * @param id ID do assunto
 */
export const removerAssunto = async (id: string) => {
  try {
    // Acesso direto à tabela como admin
    const { error } = await supabaseAdmin
      .from('assuntos')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Erro ao remover assunto:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao remover assunto:', error);
    throw error;
  }
};

/**
 * Busca tópicos com base na disciplina e nos assuntos
 * @param disciplina Nome da disciplina
 * @param assuntos Lista de assuntos
 */
export const buscarTopicos = async (disciplina: string, assuntos: string[]) => {
  console.log("Buscando tópicos para disciplina:", disciplina, "e assuntos:", assuntos);
  
  try {
    // Verificar se há disciplina e assuntos válidos
    if (!disciplina || !assuntos || assuntos.length === 0) {
      return { data: [], error: null };
    }

    // Buscar da tabela de tópicos
    const { data: topicosData, error: topicosError } = await supabaseAdmin
      .from('topicos')
      .select('*')
      .eq('disciplina', disciplina)
      .in('assunto', assuntos);

    if (topicosError) {
      console.error("Erro ao buscar tópicos da tabela topicos:", topicosError);
    }

    // Buscar tópicos da tabela questoes
    const { data: questoesData, error: questoesError } = await supabaseAdmin
      .from('questoes')
      .select('topicos')
      .eq('discipline', disciplina)
      .overlaps('assuntos', assuntos)
      .not('topicos', 'is', null);

    if (questoesError) {
      console.error("Erro ao buscar tópicos da tabela questoes:", questoesError);
    }

    // Combinar os resultados
    let todosTopicos: any[] = topicosData || [];
    
    // Adicionar tópicos das questões
    if (questoesData && questoesData.length > 0) {
      const topicosQuestoes = new Set<string>();
      
      // Coletar todos os tópicos únicos
      questoesData.forEach(questao => {
        if (questao.topicos && Array.isArray(questao.topicos)) {
          questao.topicos.forEach((topico: string) => {
            topicosQuestoes.add(topico);
          });
        }
      });
      
      // Filtrar tópicos que já existem na tabela de tópicos
      const topicosExistentes = new Set(todosTopicos.map(t => t.nome));
      
      // Adicionar novos tópicos à lista
      Array.from(topicosQuestoes).forEach(topico => {
        if (!topicosExistentes.has(topico)) {
          todosTopicos.push({
            id: `temp-${topico.replace(/\s+/g, '-').toLowerCase()}`,
            nome: topico,
            assunto: assuntos[0], // Usar o primeiro assunto como padrão
            disciplina
          });
        }
      });
    }

    return { data: todosTopicos, error: null };
  } catch (error) {
    console.error("Erro ao buscar tópicos:", error);
    return { data: [], error };
  }
};

/**
 * Atualiza um tópico existente
 * @param id ID do tópico
 * @param nome Novo nome do tópico
 */
export const atualizarTopico = async (id: string, nome: string) => {
  try {
    // Acesso direto à tabela como admin
    const { error } = await supabaseAdmin
      .from('topicos')
      .update({ nome })
      .eq('id', id);
    
    if (error) {
      console.error('Erro ao atualizar tópico:', error);
      throw error;
    }
    
    return { id, nome };
  } catch (error) {
    console.error('Erro ao atualizar tópico:', error);
    throw error;
  }
};

/**
 * Remove um tópico existente
 * @param id ID do tópico
 */
export const removerTopico = async (id: string) => {
  try {
    // Acesso direto à tabela como admin
    const { error } = await supabaseAdmin
      .from('topicos')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Erro ao remover tópico:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao remover tópico:', error);
    throw error;
  }
};

// Função para buscar assuntos que existem em questões
export const buscarAssuntosFromQuestoes = async (disciplina: string) => {
  try {
    console.log("Buscando assuntos que existem em questões para disciplina:", disciplina);
    
    // Buscar assuntos que possam existir em questões mas que ainda não foram cadastrados
    const { data: questoesData, error: questoesError } = await supabaseAdmin
      .from('questoes')
      .select('assuntos')
      .eq('discipline', disciplina)
      .not('assuntos', 'is', null);
    
    if (questoesError) {
      console.error('Erro ao buscar assuntos das questões:', questoesError);
      return [];
    }
    
    // Se temos resultados da tabela questoes, vamos extrair os assuntos únicos
    let assuntosFromQuestoes: Assunto[] = [];
    if (questoesData && questoesData.length > 0) {
      // Extrair todos os assuntos de todas as questões
      const todosAssuntos: string[] = [];
      questoesData.forEach(questao => {
        if (questao.assuntos && Array.isArray(questao.assuntos)) {
          todosAssuntos.push(...questao.assuntos);
        }
      });
      
      // Filtrar duplicados
      const assuntosUnicos = [...new Set(todosAssuntos)];
      
      // Criar objetos para os assuntos
      assuntosFromQuestoes = assuntosUnicos.map(nome => ({
        id: `temp-${nome.replace(/\s+/g, '-').toLowerCase()}`,
        nome,
        disciplina
      }));
    }
    
    return assuntosFromQuestoes;
  } catch (error) {
    console.error('Erro ao buscar assuntos das questões:', error);
    return [];
  }
};

// Exporte o cliente administrativo
export { supabaseAdmin }; 