import { useState, useEffect } from "react";
import { Aula } from "../AulasTypes";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAulasFiltrados, calcularTotalQuestoes } from "./useAulasFiltrados";

export const useAulasActions = () => {
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [descricaoFiltro, setDescricaoFiltro] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [tituloNovaDisciplina, setTituloNovaDisciplina] = useState("");
  const [descricaoNovaDisciplina, setDescricaoNovaDisciplina] = useState("");
  const [bancaNovaDisciplina, setBancaNovaDisciplina] = useState("");
  const [isOpenEdit, setIsOpenEdit] = useState(false);
  const [isOpenDelete, setIsOpenDelete] = useState(false);
  const [currentAula, setCurrentAula] = useState<Aula | null>(null);

  const itemsPerPage = 5;

  const fetchAulas = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('aulas')
        .select('*');
      
      if (error) throw error;
      
      const formattedAulas: Aula[] = await Promise.all((data || []).map(async (item) => {
        const totalQuestoes = await calcularTotalQuestoes({
          id: item.id,
          titulo: item.titulo,
          descricao: item.descricao || "",
          topicosIds: Array.isArray(item.topicos_ids) ? item.topicos_ids : [],
          questoesIds: Array.isArray(item.questoes_ids) ? item.questoes_ids : [],
          selecionada: false,
          totalQuestoes: 0
        });
        
        return {
          id: item.id,
          titulo: item.titulo,
          descricao: item.descricao || "",
          topicosIds: Array.isArray(item.topicos_ids) ? item.topicos_ids : [],
          questoesIds: Array.isArray(item.questoes_ids) ? item.questoes_ids : [],
          selecionada: false,
          totalQuestoes: totalQuestoes
        };
      }));
      
      setAulas(formattedAulas);
    } catch (error) {
      console.error("Erro ao buscar aulas:", error);
      toast.error("Erro ao carregar as aulas. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAulas();
  }, []);

  const { 
    aulasFiltradas: paginatedAulas, 
    todasSelecionadas, 
    totalPages, 
    totalItems 
  } = useAulasFiltrados(
    aulas, 
    searchTerm, 
    descricaoFiltro, 
    currentPage, 
    itemsPerPage
  );

  const handleSelecaoTodas = () => {
    setAulas(aulas.map(aula => {
      if (paginatedAulas.some(aulaFiltrada => aulaFiltrada.id === aula.id)) {
        return { ...aula, selecionada: !todasSelecionadas };
      }
      return aula;
    }));
  };

  const handleSelecaoAula = (id: string) => {
    setAulas(aulas.map(aula => 
      aula.id === id ? { ...aula, selecionada: !aula.selecionada } : aula
    ));
  };

  const openEditModal = (aula: Aula) => {
    setCurrentAula(aula);
    setIsOpenEdit(true);
  };

  const openDeleteModal = (aula: Aula) => {
    setCurrentAula(aula);
    setIsOpenDelete(true);
  };

  const handleSaveAula = async (updatedAula: Aula) => {
    try {
      const { error } = await supabase
        .from('aulas')
        .update({ 
          titulo: updatedAula.titulo,
          descricao: updatedAula.descricao,
          topicos_ids: Array.isArray(updatedAula.topicosIds) ? updatedAula.topicosIds : [],
          questoes_ids: Array.isArray(updatedAula.questoesIds) ? updatedAula.questoesIds : []
        })
        .eq('id', updatedAula.id);

      if (error) throw error;
      
      setAulas(aulas.map(aula => 
        aula.id === updatedAula.id ? updatedAula : aula
      ));
      setIsOpenEdit(false);
      toast.success("Aula atualizada com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar aula:", error);
      toast.error("Erro ao atualizar a aula. Tente novamente.");
    }
  };

  const handleDeleteAula = async (id: string) => {
    try {
      const { error } = await supabase
        .from('aulas')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setAulas(aulas.filter(aula => aula.id !== id));
      setIsOpenDelete(false);
      toast.success("Aula excluída com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir aula:", error);
      toast.error("Erro ao excluir a aula. Tente novamente.");
    }
  };

  const handleDuplicarAula = async (aula: Aula) => {
    try {
      const novaAula = {
        titulo: `${aula.titulo} (Cópia)`,
        descricao: aula.descricao,
        topicos_ids: aula.topicosIds,
        questoes_ids: aula.questoesIds
      };

      const { data, error } = await supabase
        .from('aulas')
        .insert([novaAula])
        .select()
        .single();

      if (error) throw error;

      const aulaFormatada: Aula = {
        id: data.id,
        titulo: data.titulo,
        descricao: data.descricao || "",
        topicosIds: data.topicos_ids || [],
        questoesIds: data.questoes_ids || [],
        selecionada: false,
        totalQuestoes: aula.totalQuestoes
      };

      setAulas([...aulas, aulaFormatada]);
      toast.success("Aula duplicada com sucesso!");
    } catch (error) {
      console.error("Erro ao duplicar aula:", error);
      toast.error("Erro ao duplicar a aula. Tente novamente.");
    }
  };

  const handleAdicionarDisciplina = async () => {
    if (!tituloNovaDisciplina.trim()) {
      toast.error("O título da disciplina é obrigatório");
      return;
    }
    
    const aulasSelecionadas = aulas
      .filter(aula => aula.selecionada)
      .map(aula => aula.id);
    
    if (aulasSelecionadas.length === 0) {
      toast.error("Selecione pelo menos uma aula para adicionar a disciplina");
      return;
    }

    try {
      const { data, error } = await supabase
        .from('disciplinas')
        .insert([
          {
            titulo: tituloNovaDisciplina,
            descricao: descricaoNovaDisciplina,
            banca: bancaNovaDisciplina,
            aulas_ids: aulasSelecionadas,
            created_at: new Date().toISOString()
          }
        ])
        .select();
      
      if (error) throw error;
      
      toast.success("Disciplina adicionada com sucesso!");
      
      setTituloNovaDisciplina("");
      setDescricaoNovaDisciplina("");
      setBancaNovaDisciplina("");
      
      setAulas(aulas.map(aula => ({...aula, selecionada: false})));
    } catch (error: any) {
      console.error("Erro ao adicionar disciplina:", error);
      toast.error("Erro ao adicionar a disciplina: " + (error.message || "Tente novamente."));
    }
  };

  return {
    aulas: paginatedAulas,
    loading,
    searchTerm,
    setSearchTerm,
    descricaoFiltro,
    setDescricaoFiltro,
    currentPage,
    setCurrentPage,
    totalPages,
    itemsPerPage,
    totalItems,
    todasSelecionadas,
    handleSelecaoTodas,
    handleSelecaoAula,
    openEditModal,
    openDeleteModal,
    handleSaveAula,
    handleDeleteAula,
    handleDuplicarAula,
    tituloNovaDisciplina,
    setTituloNovaDisciplina,
    descricaoNovaDisciplina,
    setDescricaoNovaDisciplina,
    bancaNovaDisciplina,
    setBancaNovaDisciplina,
    handleAdicionarDisciplina,
    isOpenEdit,
    setIsOpenEdit,
    isOpenDelete,
    setIsOpenDelete,
    currentAula,
    setCurrentAula,
    temAulasSelecionadas: aulas.some(aula => aula.selecionada)
  };
};
