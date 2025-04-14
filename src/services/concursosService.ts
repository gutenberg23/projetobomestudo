import { supabase } from '@/lib/supabase';
import { Concurso, ConcursoFormData } from '@/types/concurso';

// Funções auxiliares para convertrer entre formato do banco e da interface
const dbToConcurso = (concurso: any): Concurso => ({
  id: concurso.id,
  titulo: concurso.titulo,
  dataInicioInscricao: concurso.data_inicio_inscricao,
  dataFimInscricao: concurso.data_fim_inscricao,
  prorrogado: concurso.prorrogado || false,
  niveis: concurso.niveis || [],
  cargos: concurso.cargos || [],
  vagas: concurso.vagas,
  salario: concurso.salario,
  estados: concurso.estados || [],
  postId: concurso.post_id,
  createdAt: concurso.created_at,
  updatedAt: concurso.updated_at
});

const concursoToDb = (formData: ConcursoFormData) => ({
  titulo: formData.titulo,
  data_inicio_inscricao: formData.dataInicioInscricao,
  data_fim_inscricao: formData.dataFimInscricao,
  prorrogado: formData.prorrogado,
  niveis: formData.niveis,
  cargos: formData.cargos,
  vagas: formData.vagas,
  salario: formData.salario,
  estados: formData.estados,
  post_id: formData.postId || null
});

/**
 * Serviço para gerenciar operações relacionadas a concursos
 */
export const concursosService = {
  /**
   * Buscar todos os concursos ordenados por data de início
   * @param apenasAtivos Retorna apenas concursos com inscrição em aberto
   */
  async listarConcursos(apenasAtivos: boolean = false): Promise<Concurso[]> {
    console.log('Buscando concursos...', apenasAtivos ? 'Apenas ativos' : 'Todos');
    
    try {
      let query = supabase
        .from('concursos')
        .select('*')
        .order('data_inicio_inscricao', { ascending: false });

      if (apenasAtivos) {
        const hoje = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        query = query.gte('data_fim_inscricao', hoje);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar concursos:', error);
        throw new Error(`Erro ao buscar concursos: ${error.message}`);
      }

      if (!data || data.length === 0) {
        console.log('Nenhum concurso encontrado');
        return [];
      }

      console.log(`${data.length} concursos encontrados`);
      return data.map(dbToConcurso);
    } catch (error) {
      console.error('Exceção ao buscar concursos:', error);
      throw error;
    }
  },

  /**
   * Buscar um concurso pelo ID
   */
  async buscarConcurso(id: string): Promise<Concurso | null> {
    console.log(`Buscando concurso com ID: ${id}`);
    
    try {
      const { data, error } = await supabase
        .from('concursos')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error(`Erro ao buscar concurso ${id}:`, error);
        throw new Error(`Erro ao buscar concurso: ${error.message}`);
      }

      return data ? dbToConcurso(data) : null;
    } catch (error) {
      console.error(`Exceção ao buscar concurso ${id}:`, error);
      throw error;
    }
  },

  /**
   * Criar um novo concurso
   */
  async criarConcurso(formData: ConcursoFormData): Promise<Concurso> {
    console.log('Criando novo concurso:', formData.titulo);
    
    try {
      const concursoDb = concursoToDb(formData);

      const { data, error } = await supabase
        .from('concursos')
        .insert(concursoDb)
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar concurso:', error);
        throw new Error(`Erro ao criar concurso: ${error.message}`);
      }

      if (!data) {
        throw new Error('Erro ao criar concurso: Nenhum dado retornado');
      }

      console.log('Concurso criado com sucesso, ID:', data.id);
      return dbToConcurso(data);
    } catch (error) {
      console.error('Exceção ao criar concurso:', error);
      throw error;
    }
  },

  /**
   * Atualizar um concurso existente
   */
  async atualizarConcurso(id: string, formData: ConcursoFormData): Promise<void> {
    console.log(`Atualizando concurso ${id}:`, formData.titulo);
    
    try {
      const concursoDb = concursoToDb(formData);

      const { error } = await supabase
        .from('concursos')
        .update(concursoDb)
        .eq('id', id);

      if (error) {
        console.error(`Erro ao atualizar concurso ${id}:`, error);
        throw new Error(`Erro ao atualizar concurso: ${error.message}`);
      }

      console.log(`Concurso ${id} atualizado com sucesso`);
    } catch (error) {
      console.error(`Exceção ao atualizar concurso ${id}:`, error);
      throw error;
    }
  },

  /**
   * Excluir um concurso pelo ID
   */
  async excluirConcurso(id: string): Promise<void> {
    console.log(`Excluindo concurso ${id}`);
    
    try {
      const { error } = await supabase
        .from('concursos')
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`Erro ao excluir concurso ${id}:`, error);
        throw new Error(`Erro ao excluir concurso: ${error.message}`);
      }

      console.log(`Concurso ${id} excluído com sucesso`);
    } catch (error) {
      console.error(`Exceção ao excluir concurso ${id}:`, error);
      throw error;
    }
  },

  /**
   * Buscar posts do blog para vincular a concursos
   * @param apenasAutorAtual Se true, retorna apenas posts do autor atual (para jornalistas)
   */
  async listarPostsBlog(apenasAutorAtual: boolean = false): Promise<any[]> {
    console.log('Buscando posts do blog...', apenasAutorAtual ? 'Apenas do autor atual' : 'Todos');
    
    try {
      let query = supabase
        .from('blog_posts')
        .select('id, title, category, author')
        .order('created_at', { ascending: false });

      if (apenasAutorAtual) {
        // Obter informações do usuário atual
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Buscar o perfil para obter o nome do autor
          const { data: perfil } = await supabase
            .from('profiles')
            .select('nome')
            .eq('id', user.id)
            .single();
            
          if (perfil?.nome) {
            console.log(`Filtrando posts do autor: ${perfil.nome}`);
            query = query.eq('author', perfil.nome);
          }
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar posts do blog:', error);
        throw new Error(`Erro ao buscar posts do blog: ${error.message}`);
      }

      console.log(`${data?.length || 0} posts encontrados`);
      return data || [];
    } catch (error) {
      console.error('Exceção ao buscar posts do blog:', error);
      throw error;
    }
  }
};

export default concursosService; 