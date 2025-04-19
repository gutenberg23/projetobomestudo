import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Topico } from "../../types";
import { toast } from "sonner";
import { buscarTopicos, adicionarTopico, atualizarTopico, removerTopico } from "@/lib/admin/supabaseAdmin";

export const useTopicosService = (
  disciplina: string,
  assuntos: string[],
  selectedTopicos: string[],
  setSelectedTopicos: (topicos: string[]) => void
) => {
  const [topicosList, setTopicosList] = useState<Topico[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentTopico, setCurrentTopico] = useState<Topico | null>(null);
  const [newTopicoNome, setNewTopicoNome] = useState("");
  
  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Referência para evitar chamadas duplicadas
  const prevDisciplinaRef = useRef<string>('');
  const prevAssuntosRef = useRef<string[]>([]);

  // Garantir que setSelectedTopicos é sempre uma função válida
  const safeSetSelectedTopicos = useCallback((topicos: string[]) => {
    if (typeof setSelectedTopicos === 'function') {
      setSelectedTopicos(topicos);
    } else {
      console.error('useTopicosService: setSelectedTopicos não é uma função', setSelectedTopicos);
    }
  }, [setSelectedTopicos]);

  // Fetch tópicos quando disciplina ou assuntos mudam
  useEffect(() => {
    // Verificar se os assuntos realmente mudaram para evitar re-fetchs desnecessários
    const prevAssuntosStr = JSON.stringify(prevAssuntosRef.current.sort());
    const currentAssuntosStr = JSON.stringify([...(assuntos || [])].sort());
    
    // Evita re-fetch desnecessário
    if (
      disciplina === prevDisciplinaRef.current && 
      prevAssuntosStr === currentAssuntosStr
    ) {
      return;
    }
    
    // Atualizar as referências
    prevDisciplinaRef.current = disciplina;
    prevAssuntosRef.current = [...(assuntos || [])];

    const fetchTopicos = async () => {
      // Se não temos disciplina ou assuntos, resetamos a lista
      if (!disciplina || !assuntos || !Array.isArray(assuntos) || assuntos.length === 0) {
        setTopicosList([]);
        return;
      }

      setLoading(true);
      try {
        console.log("Buscando tópicos para disciplina:", disciplina, "e assuntos:", assuntos);
        
        // Usar a função administrativa para buscar tópicos
        const data = await buscarTopicos(disciplina, assuntos);

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
  }, [disciplina, assuntos]);

  const handleTopicosChange = useCallback((topico: string, checked?: boolean) => {
    // Garantir que selectedTopicos seja sempre um array
    const safeSelectedTopicos = Array.isArray(selectedTopicos) ? selectedTopicos : [];
    
    // Se checked foi passado, usamos ele diretamente
    if (checked !== undefined) {
      if (checked) {
        // Adicionar
        if (!safeSelectedTopicos.includes(topico)) {
          safeSetSelectedTopicos([...safeSelectedTopicos, topico]);
        }
      } else {
        // Remover
        safeSetSelectedTopicos(safeSelectedTopicos.filter(t => t !== topico));
      }
    } else {
      // Comportamento toggle (antigo)
      if (safeSelectedTopicos.includes(topico)) {
        safeSetSelectedTopicos(safeSelectedTopicos.filter(t => t !== topico));
      } else {
        safeSetSelectedTopicos([...safeSelectedTopicos, topico]);
      }
    }
  }, [selectedTopicos, safeSetSelectedTopicos]);

  const handleAddTopico = async () => {
    if (!newTopicoNome.trim()) {
      toast.error("O nome do tópico não pode estar vazio");
      return;
    }

    if (!assuntos || !Array.isArray(assuntos) || assuntos.length === 0) {
      toast.error("Selecione pelo menos um assunto antes de adicionar um tópico");
      return;
    }

    try {
      // Usamos o primeiro assunto selecionado para o novo tópico
      const assunto = assuntos[0];
      
      // Usar a função administrativa para adicionar tópico
      const data = await adicionarTopico({
        nome: newTopicoNome,
        assunto,
        disciplina
      });

      // Adicionar o novo tópico à lista local
      setTopicosList(prevList => [...prevList, data]);
      toast.success("Tópico adicionado com sucesso!");
      setNewTopicoNome("");
      setIsAddDialogOpen(false);
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
      // Usar a função administrativa para atualizar tópico
      await atualizarTopico(currentTopico.id, newTopicoNome);

      // Atualizar o tópico na lista local
      setTopicosList(prevList => 
        prevList.map(t => t.id === currentTopico.id ? { ...t, nome: newTopicoNome } : t)
      );
      
      // Atualizar também no array de tópicos selecionados
      const safeSelectedTopicos = Array.isArray(selectedTopicos) ? selectedTopicos : [];
      if (safeSelectedTopicos.includes(currentTopico.nome)) {
        const newTopicos = safeSelectedTopicos.filter(t => t !== currentTopico.nome);
        newTopicos.push(newTopicoNome);
        safeSetSelectedTopicos(newTopicos);
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
      // Usar a função administrativa para remover tópico
      await removerTopico(currentTopico.id);

      // Remover o tópico da lista local
      setTopicosList(prevList => prevList.filter(t => t.id !== currentTopico.id));
      
      // Remover do array de tópicos selecionados
      const safeSelectedTopicos = Array.isArray(selectedTopicos) ? selectedTopicos : [];
      if (safeSelectedTopicos.includes(currentTopico.nome)) {
        safeSetSelectedTopicos(safeSelectedTopicos.filter(t => t !== currentTopico.nome));
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
