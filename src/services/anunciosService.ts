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
    try {
      const { data, error } = await supabase
        .from("anuncios")
        .select("*")
        .order("created_at", { ascending: false });
      
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('anunciosService.getAll() error:', error);
      throw error;
    }
  },

  // Obter anúncio por ID
  async getById(id: string) {
    try {
      const { data, error } = await supabase
        .from("anuncios")
        .select("*")
        .eq("id", id)
        .single();
      
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('anunciosService.getById() error:', error);
      throw error;
    }
  },

  // Criar novo anúncio
  async create(anuncio: TablesInsert<"anuncios">) {
    try {
      const { data, error } = await supabase
        .from("anuncios")
        .insert([anuncio])
        .select()
        .single();
      
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('anunciosService.create() error:', error);
      throw error;
    }
  },

  // Atualizar anúncio
  async update(id: string, anuncio: Partial<TablesInsert<"anuncios">>) {
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
      
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('anunciosService.update() error:', error);
      throw error;
    }
  },

  // Excluir anúncio
  async delete(id: string) {
    try {
      const { error } = await supabase
        .from("anuncios")
        .delete()
        .eq("id", id);
      
      
      if (error) throw error;
    } catch (error) {
      console.error('anunciosService.delete() error:', error);
      throw error;
    }
  },

  // Alternar status do anúncio
  async toggleStatus(id: string, currentStatus: boolean) {
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
      
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('anunciosService.toggleStatus() error:', error);
      throw error;
    }
  },

  // Obter anúncios ativos por posição
  async getActiveByPosition(position: string) {
    try {
      const { data, error } = await supabase
        .from("anuncios")
        .select("*")
        .eq("posicao", position)
        .order("ordem", { ascending: true });
      
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('anunciosService.getActiveByPosition() error:', error);
      throw error;
    }
  },

  // Obter um anúncio ativo por posição
  async getActiveOneByPosition(position: string) {
    try {
      const { data, error } = await supabase
        .from("anuncios")
        .select("*")
        .eq("posicao", position)
        .order("ordem", { ascending: true })
        .limit(1)
        .single();
      
      
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