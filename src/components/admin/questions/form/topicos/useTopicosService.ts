
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Topico } from "../../types";
import { toast } from "sonner";

export const useTopicosService = (disciplina: string, selectedTopicos: string[], setSelectedTopicos: (topicos: string[]) => void) => {
  const [topicosList, setTopicosList] = useState<Topico[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentTopico, setCurrentTopico] = useState<Topico | null>(null);
  const [newTopicoNome, setNewTopicoNome] = useState("");
  
  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fetch topics when discipline changes
  useEffect(() => {
    const fetchTopicos = async () => {
      if (!disciplina) {
        setTopicosList([]);
        return;
      }

      setLoading(true);
      try {
        console.log("Buscando tópicos para disciplina:", disciplina);
        const { data, error } = await supabase
          .from('topicos')
          .select('*')
          .eq('disciplina', disciplina);

        if (error) {
          throw error;
        }

        console.log("Tópicos retornados:", data);
        setTopicosList(data || []);
      } catch (error) {
        console.error("Erro ao buscar tópicos:", error);
        toast.error("Erro ao carregar tópicos. Tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchTopicos();
  }, [disciplina]);

  const handleTopicosChange = (topico: string) => {
    if (selectedTopicos.includes(topico)) {
      setSelectedTopicos(selectedTopicos.filter(t => t !== topico));
    } else {
      setSelectedTopicos([...selectedTopicos, topico]);
    }
  };

  const handleAddTopico = async () => {
    if (!newTopicoNome.trim()) {
      toast.error("O nome do tópico não pode estar vazio");
      return;
    }

    try {
      const { data, error } = await supabase
        .from('topicos')
        .insert([{ 
          nome: newTopicoNome, 
          disciplina
        }])
        .select();

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        setTopicosList([...topicosList, data[0]]);
        toast.success("Tópico adicionado com sucesso!");
        setNewTopicoNome("");
        setIsAddDialogOpen(false);
      }
    } catch (error) {
      console.error("Erro ao adicionar tópico:", error);
      toast.error("Erro ao adicionar tópico. Tente novamente.");
    }
  };

  const handleEditTopico = async () => {
    if (!currentTopico || !newTopicoNome.trim()) {
      toast.error("O nome do tópico não pode estar vazio");
      return;
    }

    try {
      const { error } = await supabase
        .from('topicos')
        .update({ 
          nome: newTopicoNome
        })
        .eq('id', currentTopico.id);

      if (error) {
        throw error;
      }

      setTopicosList(topicosList.map(t => 
        t.id === currentTopico.id ? { ...t, nome: newTopicoNome } : t
      ));
      
      // Atualizar também no array de tópicos selecionados
      if (selectedTopicos.includes(currentTopico.nome)) {
        const newTopicos = selectedTopicos.filter(t => t !== currentTopico.nome);
        newTopicos.push(newTopicoNome);
        setSelectedTopicos(newTopicos);
      }

      toast.success("Tópico atualizado com sucesso!");
      setNewTopicoNome("");
      setCurrentTopico(null);
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Erro ao editar tópico:", error);
      toast.error("Erro ao editar tópico. Tente novamente.");
    }
  };

  const handleDeleteTopico = async () => {
    if (!currentTopico) return;

    try {
      const { error } = await supabase
        .from('topicos')
        .delete()
        .eq('id', currentTopico.id);

      if (error) {
        throw error;
      }

      setTopicosList(topicosList.filter(t => t.id !== currentTopico.id));
      
      // Remover do array de tópicos selecionados
      if (selectedTopicos.includes(currentTopico.nome)) {
        setSelectedTopicos(selectedTopicos.filter(t => t !== currentTopico.nome));
      }

      toast.success("Tópico removido com sucesso!");
      setCurrentTopico(null);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Erro ao excluir tópico:", error);
      toast.error("Erro ao excluir tópico. Tente novamente.");
    }
  };

  return {
    topicosList,
    loading,
    currentTopico,
    setCurrentTopico,
    newTopicoNome,
    setNewTopicoNome,
    isAddDialogOpen,
    setIsAddDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    handleTopicosChange,
    handleAddTopico,
    handleEditTopico,
    handleDeleteTopico
  };
};
