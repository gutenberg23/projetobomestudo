import { supabase } from "@/integrations/supabase/client";
import { Popup } from "@/types/popup";

export const popupsService = {
  // Obter todos os popups
  async getAll() {
    console.log('popupsService.getAll() called');
    try {
      const { data, error } = await supabase
        .from("popups")
        .select("*")
        .order("created_at", { ascending: false });
      
      console.log('popupsService.getAll() response:', { data, error });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('popupsService.getAll() error:', error);
      throw error;
    }
  },

  // Obter popup por ID
  async getById(id: string) {
    console.log('popupsService.getById() called with id:', id);
    try {
      const { data, error } = await supabase
        .from("popups")
        .select("*")
        .eq("id", id)
        .single();
      
      console.log('popupsService.getById() response:', { data, error });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('popupsService.getById() error:', error);
      throw error;
    }
  },

  // Criar novo popup
  async create(popup: Omit<Popup, 'id' | 'created_at' | 'updated_at'>) {
    console.log('popupsService.create() called with:', popup);
    try {
      const { data, error } = await supabase
        .from("popups")
        .insert([popup])
        .select()
        .single();
      
      console.log('popupsService.create() response:', { data, error });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('popupsService.create() error:', error);
      throw error;
    }
  },

  // Atualizar popup
  async update(id: string, popup: Partial<Omit<Popup, 'id' | 'created_at' | 'updated_at'>>) {
    console.log('popupsService.update() called with id:', id, 'and data:', popup);
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
      
      console.log('popupsService.update() response:', { data, error });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('popupsService.update() error:', error);
      throw error;
    }
  },

  // Excluir popup
  async delete(id: string) {
    console.log('popupsService.delete() called with id:', id);
    try {
      const { error } = await supabase
        .from("popups")
        .delete()
        .eq("id", id);
      
      console.log('popupsService.delete() response:', { error });
      
      if (error) throw error;
    } catch (error) {
      console.error('popupsService.delete() error:', error);
      throw error;
    }
  },

  // Alternar status do popup
  async toggleStatus(id: string, currentStatus: boolean) {
    console.log('popupsService.toggleStatus() called with id:', id, 'and currentStatus:', currentStatus);
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
      
      console.log('popupsService.toggleStatus() response:', { data, error });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('popupsService.toggleStatus() error:', error);
      throw error;
    }
  },

  // Obter popups ativos por página
  async getActiveByPage(page: string) {
    console.log('popupsService.getActiveByPage() called with page:', page);
    try {
      const { data, error } = await supabase
        .from("popups")
        .select("*")
        .eq("pagina", page)
        .eq("ativo", true)
        .lte("data_inicio", new Date().toISOString())
        .gte("data_fim", new Date().toISOString())
        .order("ordem", { ascending: true });
      
      console.log('popupsService.getActiveByPage() response:', { data, error });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('popupsService.getActiveByPage() error:', error);
      throw error;
    }
  },

  // Obter um popup ativo por página
  async getActiveOneByPage(page: string) {
    console.log('popupsService.getActiveOneByPage() called with page:', page);
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
      
      console.log('popupsService.getActiveOneByPage() response:', { data, error });
      
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