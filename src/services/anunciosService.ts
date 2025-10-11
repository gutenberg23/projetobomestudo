import { supabase } from "@/integrations/supabase/client";
import { TablesInsert } from "@/integrations/supabase/types";

export interface Anuncio {
  id?: string;
  created_at?: string;
  updated_at?: string;
  titulo: string;
  imagem_url?: string | null;
  link_destino?: string | null;
  data_inicio: string;
  data_fim: string;
  posicao: string;
  ativo?: boolean | null;
  ordem?: number | null;
}

export const anunciosService = {
  // Obter todos os anúncios
  async getAll() {
    console.log('anunciosService.getAll() called');
    try {
      const { data, error } = await supabase
        .from("anuncios")
        .select("*")
        .order("created_at", { ascending: false });
      
      console.log('anunciosService.getAll() response:', { data, error });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('anunciosService.getAll() error:', error);
      throw error;
    }
  },

  // Obter anúncio por ID
  async getById(id: string) {
    console.log('anunciosService.getById() called with id:', id);
    try {
      const { data, error } = await supabase
        .from("anuncios")
        .select("*")
        .eq("id", id)
        .single();
      
      console.log('anunciosService.getById() response:', { data, error });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('anunciosService.getById() error:', error);
      throw error;
    }
  },

  // Criar novo anúncio
  async create(anuncio: TablesInsert<"anuncios">) {
    console.log('anunciosService.create() called with:', anuncio);
    try {
      const { data, error } = await supabase
        .from("anuncios")
        .insert([anuncio])
        .select()
        .single();
      
      console.log('anunciosService.create() response:', { data, error });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('anunciosService.create() error:', error);
      throw error;
    }
  },

  // Atualizar anúncio
  async update(id: string, anuncio: Partial<TablesInsert<"anuncios">>) {
    console.log('anunciosService.update() called with id:', id, 'and data:', anuncio);
    try {
      const { data, error } = await supabase
        .from("anuncios")
        .update({
          ...anuncio,
          updated_at: new Date().toISOString()
        })
        .eq("id", id)
        .select()
        .single();
      
      console.log('anunciosService.update() response:', { data, error });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('anunciosService.update() error:', error);
      throw error;
    }
  },

  // Excluir anúncio
  async delete(id: string) {
    console.log('anunciosService.delete() called with id:', id);
    try {
      const { error } = await supabase
        .from("anuncios")
        .delete()
        .eq("id", id);
      
      console.log('anunciosService.delete() response:', { error });
      
      if (error) throw error;
    } catch (error) {
      console.error('anunciosService.delete() error:', error);
      throw error;
    }
  },

  // Alternar status do anúncio
  async toggleStatus(id: string, currentStatus: boolean) {
    console.log('anunciosService.toggleStatus() called with id:', id, 'and currentStatus:', currentStatus);
    try {
      const { data, error } = await supabase
        .from("anuncios")
        .update({ 
          ativo: !currentStatus,
          updated_at: new Date().toISOString()
        })
        .eq("id", id)
        .select()
        .single();
      
      console.log('anunciosService.toggleStatus() response:', { data, error });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('anunciosService.toggleStatus() error:', error);
      throw error;
    }
  },

  // Obter anúncios ativos por posição
  async getActiveByPosition(position: string) {
    console.log('anunciosService.getActiveByPosition() called with position:', position);
    try {
      const { data, error } = await supabase
        .from("anuncios")
        .select("*")
        .eq("posicao", position)
        .order("ordem", { ascending: true });
      
      console.log('anunciosService.getActiveByPosition() response:', { data, error });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('anunciosService.getActiveByPosition() error:', error);
      throw error;
    }
  },

  // Obter um anúncio ativo por posição
  async getActiveOneByPosition(position: string) {
    console.log('anunciosService.getActiveOneByPosition() called with position:', position);
    try {
      const { data, error } = await supabase
        .from("anuncios")
        .select("*")
        .eq("posicao", position)
        .order("ordem", { ascending: true })
        .limit(1)
        .single();
      
      console.log('anunciosService.getActiveOneByPosition() response:', { data, error });
      
      if (error && error.code !== "PGRST116") {
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('anunciosService.getActiveOneByPosition() error:', error);
      throw error;
    }
  }
};