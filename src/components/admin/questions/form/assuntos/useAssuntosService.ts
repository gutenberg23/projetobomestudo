import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Assunto } from "../../types";
import { toast } from "sonner";
import { buscarAssuntos, adicionarAssunto, atualizarAssunto, removerAssunto } from "@/lib/admin/supabaseAdmin";

export const useAssuntosService = (disciplina: string, selectedAssuntos: string[], setSelectedAssuntos: (assuntos: string[]) => void) => {
  const [assuntosList, setAssuntosList] = useState<Assunto[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentAssunto, setCurrentAssunto] = useState<Assunto | null>(null);
  const [newAssuntoNome, setNewAssuntoNome] = useState("");
  
  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Referência para evitar chamadas duplicadas
  const previousDisciplina = useRef<string>('');

  // Garantir que setSelectedAssuntos é sempre uma função válida
  const safeSetSelectedAssuntos = useCallback((assuntos: string[]) => {
    if (typeof setSelectedAssuntos === 'function') {
      setSelectedAssuntos(assuntos);
    } else {
      console.error('useAssuntosService: setSelectedAssuntos não é uma função', setSelectedAssuntos);
    }
  }, [setSelectedAssuntos]);

  // Fetch assuntos when discipline changes
  useEffect(() => {
    // Evita re-fetch desnecessário
    if (disciplina === previousDisciplina.current) {
      return;
    }
    
    previousDisciplina.current = disciplina;

    const fetchAssuntos = async () => {
      if (!disciplina) {
        setAssuntosList([]);
        return;
      }

      setLoading(true);
      try {
        console.log("Buscando assuntos para disciplina:", disciplina);
        
        // Usar a função administrativa para buscar assuntos
        const data = await buscarAssuntos(disciplina);
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

  const handleAssuntosChange = useCallback((assunto: string, checked?: boolean) => {
    // Garantir que selectedAssuntos seja sempre um array
    const safeSelectedAssuntos = Array.isArray(selectedAssuntos) ? selectedAssuntos : [];
    
    // Se checked foi passado, usamos ele diretamente
    if (checked !== undefined) {
      if (checked) {
        // Adicionar
        if (!safeSelectedAssuntos.includes(assunto)) {
          safeSetSelectedAssuntos([...safeSelectedAssuntos, assunto]);
        }
      } else {
        // Remover
        safeSetSelectedAssuntos(safeSelectedAssuntos.filter(t => t !== assunto));
      }
    } else {
      // Comportamento toggle (antigo)
      if (safeSelectedAssuntos.includes(assunto)) {
        safeSetSelectedAssuntos(safeSelectedAssuntos.filter(t => t !== assunto));
      } else {
        safeSetSelectedAssuntos([...safeSelectedAssuntos, assunto]);
      }
    }
  }, [selectedAssuntos, safeSetSelectedAssuntos]);

  const handleAddAssunto = async () => {
    if (!newAssuntoNome.trim()) {
      toast.error("O nome do assunto não pode estar vazio");
      return;
    }

    try {
      // Usar a função administrativa para adicionar assunto
      const data = await adicionarAssunto({
        nome: newAssuntoNome,
        disciplina
      });

      // Adicionar o novo assunto à lista local
      setAssuntosList(prevList => [...prevList, data]);
      toast.success("Assunto adicionado com sucesso!");
      setNewAssuntoNome("");
      setIsAddDialogOpen(false);
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
      // Usar a função administrativa para atualizar assunto
      await atualizarAssunto(currentAssunto.id, newAssuntoNome);
      
      // Atualizar o assunto na lista local
      setAssuntosList(prevList => 
        prevList.map(t => t.id === currentAssunto.id ? { ...t, nome: newAssuntoNome } : t)
      );
      
      // Atualizar também no array de assuntos selecionados
      if (selectedAssuntos.includes(currentAssunto.nome)) {
        const newAssuntos = selectedAssuntos.filter(t => t !== currentAssunto.nome);
        newAssuntos.push(newAssuntoNome);
        safeSetSelectedAssuntos(newAssuntos);
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
      // Usar a função administrativa para remover assunto
      await removerAssunto(currentAssunto.id);
      
      // Remover o assunto da lista local
      setAssuntosList(prevList => prevList.filter(t => t.id !== currentAssunto.id));
      
      // Remover do array de assuntos selecionados
      if (selectedAssuntos.includes(currentAssunto.nome)) {
        safeSetSelectedAssuntos(selectedAssuntos.filter(t => t !== currentAssunto.nome));
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
