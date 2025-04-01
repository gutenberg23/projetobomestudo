import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { KanbanItem, KanbanColumn, ItemType } from '@/types/kanban';
import { toast } from 'sonner';

export const useKanban = () => {
  const [columns, setColumns] = useState<KanbanColumn[]>([]);
  const [items, setItems] = useState<KanbanItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar colunas e itens
  const fetchKanban = async () => {
    try {
      setLoading(true);
      
      // Buscar colunas
      const { data: columnsData, error: columnsError } = await supabase
        .from('kanban_columns')
        .select('*')
        .order('order');

      if (columnsError) throw columnsError;

      // Buscar itens
      const { data: itemsData, error: itemsError } = await supabase
        .from('kanban_items')
        .select('*');

      if (itemsError) throw itemsError;

      setColumns(columnsData);
      setItems(itemsData);
    } catch (error) {
      console.error('Erro ao carregar kanban:', error);
      toast.error('Erro ao carregar o kanban');
    } finally {
      setLoading(false);
    }
  };

  // Adicionar item
  const addItem = async (columnId: string, title: string, type: ItemType) => {
    try {
      const newItem: Omit<KanbanItem, 'id' | 'created_at'> = {
        title,
        type,
        votes: 0,
        comments: 0,
        upvotes: 0,
        column_id: columnId,
      };

      const { data, error } = await supabase
        .from('kanban_items')
        .insert([newItem])
        .select()
        .single();

      if (error) throw error;

      setItems(prev => [...prev, data]);
      toast.success('Item adicionado com sucesso');
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      toast.error('Erro ao adicionar item');
    }
  };

  // Mover item
  const moveItem = async (itemId: string, newColumnId: string) => {
    try {
      const { error } = await supabase
        .from('kanban_items')
        .update({ column_id: newColumnId })
        .eq('id', itemId);

      if (error) throw error;

      setItems(prev => prev.map(item => 
        item.id === itemId ? { ...item, column_id: newColumnId } : item
      ));
    } catch (error) {
      console.error('Erro ao mover item:', error);
      toast.error('Erro ao mover item');
    }
  };

  // Excluir item
  const deleteItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('kanban_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      setItems(prev => prev.filter(item => item.id !== itemId));
      toast.success('Item excluído com sucesso');
    } catch (error) {
      console.error('Erro ao excluir item:', error);
      toast.error('Erro ao excluir item');
    }
  };

  // Carregar dados ao montar o componente
  useEffect(() => {
    fetchKanban();
  }, []);

  return {
    columns,
    items,
    loading,
    addItem,
    moveItem,
    deleteItem,
  };
}; 