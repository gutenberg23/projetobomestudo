import { supabase } from "@/integrations/supabase/client";
import { Popup } from "@/types/popup";

export const popupsService = {
  // Obter todos os popups
  async getAll() {
    try {
      const { data, error } = await supabase
        .from("popups")
        .select("*")
        .order("created_at", { ascending: false });
      
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('popupsService.getAll() error:', error);
      throw error;
    }
  },

  // Obter popup por ID
  async getById(id: string) {
    try {
      const { data, error } = await supabase
        .from("popups")
        .select("*")
        .eq("id", id)
        .single();
      
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('popupsService.getById() error:', error);
      throw error;
    }
  },

  // Criar novo popup
  async create(popup: Omit<Popup, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from("popups")
        .insert([popup])
        .select()
        .single();
      
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('popupsService.create() error:', error);
      throw error;
    }
  },

  // Atualizar popup
  async update(id: string, popup: Partial<Omit<Popup, 'id' | 'created_at' | 'updated_at'>>) {
    try {
      const updateData = {
        ...popup,
        updated_at: new Date().toISOString()
      };
      
      // Remover propriedades undefined
      Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof typeof updateData] === undefined) {
          delete updateData[key as keyof typeof updateData];
        }
      });
      
      const { data, error } = await supabase
        .from("popups")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();
      
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('popupsService.update() error:', error);
      throw error;
    }
  },

  // Excluir popup
  async delete(id: string) {
    try {
      const { error } = await supabase
        .from("popups")
        .delete()
        .eq("id", id);
      
      
      if (error) throw error;
    } catch (error) {
      console.error('popupsService.delete() error:', error);
      throw error;
    }
  },

  // Alternar status do popup
  async toggleStatus(id: string, currentStatus: boolean) {
    try {
      const { data, error } = await supabase
        .from("popups")
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
      console.error('popupsService.toggleStatus() error:', error);
      throw error;
    }
  },

  // Obter popups ativos por página
  async getActiveByPage(page: string) {
    try {
      const { data, error } = await supabase
        .from("popups")
        .select("*")
        .eq("pagina", page)
        .eq("ativo", true)
        .lte("data_inicio", new Date().toISOString())
        .gte("data_fim", new Date().toISOString())
        .order("ordem", { ascending: true });
      
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('popupsService.getActiveByPage() error:', error);
      throw error;
    }
  },

  // Obter um popup ativo por página
  async getActiveOneByPage(page: string) {
    try {
      const { data, error } = await supabase
        .from("popups")
        .select("*")
        .eq("pagina", page)
        .eq("ativo", true)
        .lte("data_inicio", new Date().toISOString())
        .gte("data_fim", new Date().toISOString())
        .order("ordem", { ascending: true })
        .limit(1)
        .single();
      
      
      if (error && error.code !== "PGRST116") {
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('popupsService.getActiveOneByPage() error:', error);
      throw error;
    }
  }
};