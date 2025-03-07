
import { useState, useEffect } from "react";
import { Aula } from "../AulasTypes";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useAulasActions = () => {
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [descricaoFiltro, setDescricaoFiltro] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [tituloNovaDisciplina, setTituloNovaDisciplina] = useState("");
  const [descricaoNovaDisciplina, setDescricaoNovaDisciplina] = useState("");
  const [isOpenEdit, setIsOpenEdit] = useState(false);
  const [isOpenDelete, setIsOpenDelete] = useState(false);
  const [currentAula, setCurrentAula] = useState<Aula | null>(null);

  const itemsPerPage = 5;

  // Buscar todas as aulas do banco de dados
  const fetchAulas = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('aulas')
        .select('*');
      
      if (error) throw error;
      
      // Transformar os dados do Supabase para o formato usado na aplicação
      const formattedAulas: Aula[] = data?.map(item => ({
        id: item.id,
        titulo: item.titulo,
        descricao: item.descricao || "",
        topicosIds: item.topicos_ids || [],
        questoesIds: item.questoes_ids || [],
        selecionada: false
      })) || [];
      
      setAulas(formattedAulas);
    } catch (error) {
      console.error("Erro ao buscar aulas:", error);
      toast.error("Erro ao carregar as aulas. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // Carregar aulas quando o componente monta
  useEffect(() => {
    fetchAulas();
  }, []);

  // Filtrar aulas com base nos termos de pesquisa
  const aulasFiltradas = aulas.filter((aula) => {
    const matchesTitulo = aula.titulo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDescricao = aula.descricao.toLowerCase().includes(descricaoFiltro.toLowerCase());
    
    return matchesTitulo && matchesDescricao;
  });

  // Paginar as aulas filtradas
  const totalPages = Math.max(1, Math.ceil(aulasFiltradas.length / itemsPerPage));
  const paginatedAulas = aulasFiltradas.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Funções para manipulação de seleção
  const todasSelecionadas = paginatedAulas.length > 0 && paginatedAulas.every(aula => aula.selecionada);

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

  // Funções para abrir modais
  const openEditModal = (aula: Aula) => {
    setCurrentAula(aula);
    setIsOpenEdit(true);
  };

  const openDeleteModal = (aula: Aula) => {
    setCurrentAula(aula);
    setIsOpenDelete(true);
  };

  // Função para salvar aula editada
  const handleSaveAula = async (updatedAula: Aula) => {
    try {
      const { error } = await supabase
        .from('aulas')
        .update({ 
          titulo: updatedAula.titulo,
          descricao: updatedAula.descricao,
          topicos_ids: updatedAula.topicosIds,
          questoes_ids: updatedAula.questoesIds
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

  // Função para excluir aula
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

  // Função para adicionar disciplina
  const handleAdicionarDisciplina = async () => {
    if (!tituloNovaDisciplina.trim()) {
      toast.error("O título da disciplina é obrigatório");
      return;
    }
    
    // Obter as aulas selecionadas
    const aulasSelecionadas = aulas
      .filter(aula => aula.selecionada)
      .map(aula => aula.id);
    
    if (aulasSelecionadas.length === 0) {
      toast.error("Selecione pelo menos uma aula para adicionar a disciplina");
      return;
    }

    try {
      // Cadastrar a disciplina no banco de dados
      const { data, error } = await supabase
        .from('disciplinas')
        .insert([
          {
            titulo: tituloNovaDisciplina,
            descricao: descricaoNovaDisciplina,
            aulas_ids: aulasSelecionadas,
            created_at: new Date().toISOString()
          }
        ])
        .select();
      
      if (error) {
        // Se a tabela não existir, vamos tentar criá-la
        if (error.code === '42P01') { // Código para "relation does not exist"
          toast.error("A tabela 'disciplinas' não existe. Por favor, crie-a primeiro.");
          console.error("Tabela 'disciplinas' não existe. Crie-a no banco de dados");
          return;
        }
        throw error;
      }
      
      // Sucesso ao adicionar a disciplina
      toast.success("Disciplina adicionada com sucesso!");
      
      // Resetar campos após adicionar
      setTituloNovaDisciplina("");
      setDescricaoNovaDisciplina("");
      
      // Desmarcar todas as aulas após adicionar
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
    totalItems: aulasFiltradas.length,
    todasSelecionadas,
    handleSelecaoTodas,
    handleSelecaoAula,
    openEditModal,
    openDeleteModal,
    handleSaveAula,
    handleDeleteAula,
    tituloNovaDisciplina,
    setTituloNovaDisciplina,
    descricaoNovaDisciplina,
    setDescricaoNovaDisciplina,
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
