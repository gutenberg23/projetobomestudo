import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Assunto } from "../../types";
import { toast } from "sonner";

export const useAssuntosService = (disciplina: string, selectedAssuntos: string[], setSelectedAssuntos: (assuntos: string[]) => void) => {
  const [assuntosList, setAssuntosList] = useState<Assunto[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentAssunto, setCurrentAssunto] = useState<Assunto | null>(null);
  const [newAssuntoNome, setNewAssuntoNome] = useState("");
  
  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fetch assuntos when discipline changes
  useEffect(() => {
    const fetchAssuntos = async () => {
      if (!disciplina) {
        setAssuntosList([]);
        return;
      }

      setLoading(true);
      try {
        console.log("Buscando assuntos para disciplina:", disciplina);
        const { data, error } = await supabase
          .from('assuntos')
          .select('*')
          .eq('disciplina', disciplina);

        if (error) {
          throw error;
        }

        console.log("Assuntos retornados:", data);
        setAssuntosList(data || []);
      } catch (error) {
        console.error("Erro ao buscar assuntos:", error);
        toast.error("Erro ao carregar assuntos. Tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchAssuntos();
  }, [disciplina]);

  const handleAssuntosChange = (assunto: string) => {
    if (selectedAssuntos.includes(assunto)) {
      setSelectedAssuntos(selectedAssuntos.filter(t => t !== assunto));
    } else {
      setSelectedAssuntos([...selectedAssuntos, assunto]);
    }
  };

  const handleAddAssunto = async () => {
    if (!newAssuntoNome.trim()) {
      toast.error("O nome do assunto não pode estar vazio");
      return;
    }

    try {
      const { data, error } = await supabase
        .from('assuntos')
        .insert([{ 
          nome: newAssuntoNome, 
          disciplina,
          patrocinador: "",
          questoes_ids: []
        }])
        .select();

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        setAssuntosList([...assuntosList, data[0]]);
        toast.success("Assunto adicionado com sucesso!");
        setNewAssuntoNome("");
        setIsAddDialogOpen(false);
      }
    } catch (error) {
      console.error("Erro ao adicionar assunto:", error);
      toast.error("Erro ao adicionar assunto. Tente novamente.");
    }
  };

  const handleEditAssunto = async () => {
    if (!currentAssunto || !newAssuntoNome.trim()) {
      toast.error("O nome do assunto não pode estar vazio");
      return;
    }

    try {
      const { error } = await supabase
        .from('assuntos')
        .update({ 
          nome: newAssuntoNome
        })
        .eq('id', currentAssunto.id);

      if (error) {
        throw error;
      }

      setAssuntosList(assuntosList.map(t => 
        t.id === currentAssunto.id ? { ...t, nome: newAssuntoNome } : t
      ));
      
      // Atualizar também no array de assuntos selecionados
      if (selectedAssuntos.includes(currentAssunto.nome)) {
        const newAssuntos = selectedAssuntos.filter(t => t !== currentAssunto.nome);
        newAssuntos.push(newAssuntoNome);
        setSelectedAssuntos(newAssuntos);
      }

      toast.success("Assunto atualizado com sucesso!");
      setNewAssuntoNome("");
      setCurrentAssunto(null);
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Erro ao editar assunto:", error);
      toast.error("Erro ao editar assunto. Tente novamente.");
    }
  };

  const handleDeleteAssunto = async () => {
    if (!currentAssunto) return;

    try {
      const { error } = await supabase
        .from('assuntos')
        .delete()
        .eq('id', currentAssunto.id);

      if (error) {
        throw error;
      }

      setAssuntosList(assuntosList.filter(t => t.id !== currentAssunto.id));
      
      // Remover do array de assuntos selecionados
      if (selectedAssuntos.includes(currentAssunto.nome)) {
        setSelectedAssuntos(selectedAssuntos.filter(t => t !== currentAssunto.nome));
      }

      toast.success("Assunto removido com sucesso!");
      setCurrentAssunto(null);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Erro ao excluir assunto:", error);
      toast.error("Erro ao excluir assunto. Tente novamente.");
    }
  };

  return {
    assuntosList,
    loading,
    currentAssunto,
    setCurrentAssunto,
    newAssuntoNome,
    setNewAssuntoNome,
    isAddDialogOpen,
    setIsAddDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    handleAssuntosChange,
    handleAddAssunto,
    handleEditAssunto,
    handleDeleteAssunto
  };
};
