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
        console.log("Buscando tópicos para disciplina:", disciplina);
        const { data, error } = await supabase
          .from('questoes')
          .select('topicos')
          .eq('discipline', disciplina);

        if (error) {
          throw error;
        }

        // Extrair tópicos únicos de todas as questões
        const topicos = data
          .flatMap(q => q.topicos || [])
          .filter((value, index, self) => self.indexOf(value) === index)
          .sort();

        console.log("Tópicos retornados:", topicos);
        setAssuntosList(topicos.map(nome => ({ id: nome, nome, disciplina })));
      } catch (error) {
        console.error("Erro ao buscar tópicos:", error);
        toast.error("Erro ao carregar tópicos. Tente novamente.");
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
      toast.error("O nome do tópico não pode estar vazio");
      return;
    }

    try {
      // Adicionar o novo tópico à lista local
      const newAssunto = { id: newAssuntoNome, nome: newAssuntoNome, disciplina };
      setAssuntosList([...assuntosList, newAssunto]);
      toast.success("Tópico adicionado com sucesso!");
      setNewAssuntoNome("");
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error("Erro ao adicionar tópico:", error);
      toast.error("Erro ao adicionar tópico. Tente novamente.");
    }
  };

  const handleEditAssunto = async () => {
    if (!currentAssunto || !newAssuntoNome.trim()) {
      toast.error("O nome do tópico não pode estar vazio");
      return;
    }

    try {
      // Atualizar o tópico na lista local
      setAssuntosList(assuntosList.map(t => 
        t.id === currentAssunto.id ? { ...t, nome: newAssuntoNome } : t
      ));
      
      // Atualizar também no array de tópicos selecionados
      if (selectedAssuntos.includes(currentAssunto.nome)) {
        const newAssuntos = selectedAssuntos.filter(t => t !== currentAssunto.nome);
        newAssuntos.push(newAssuntoNome);
        setSelectedAssuntos(newAssuntos);
      }

      toast.success("Tópico atualizado com sucesso!");
      setNewAssuntoNome("");
      setCurrentAssunto(null);
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Erro ao editar tópico:", error);
      toast.error("Erro ao editar tópico. Tente novamente.");
    }
  };

  const handleDeleteAssunto = async () => {
    if (!currentAssunto) return;

    try {
      // Remover o tópico da lista local
      setAssuntosList(assuntosList.filter(t => t.id !== currentAssunto.id));
      
      // Remover do array de tópicos selecionados
      if (selectedAssuntos.includes(currentAssunto.nome)) {
        setSelectedAssuntos(selectedAssuntos.filter(t => t !== currentAssunto.nome));
      }

      toast.success("Tópico removido com sucesso!");
      setCurrentAssunto(null);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Erro ao excluir tópico:", error);
      toast.error("Erro ao excluir tópico. Tente novamente.");
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
