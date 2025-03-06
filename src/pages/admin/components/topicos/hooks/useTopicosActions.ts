
import { Topico } from "../TopicosTypes";

export const useTopicosActions = (
  topicos: Topico[],
  setTopicos: React.Dispatch<React.SetStateAction<Topico[]>>,
  setIsOpenEdit: (isOpen: boolean) => void,
  setIsOpenDelete: (isOpen: boolean) => void,
  setCurrentTopico: React.Dispatch<React.SetStateAction<Topico | null>>,
  setTituloNovaAula: (titulo: string) => void,
  setDescricaoNovaAula: (descricao: string) => void
) => {
  // Funções para manipulação de seleção
  const handleSelecaoTodos = (topicosFiltrados: Topico[], todosSelecionados: boolean) => {
    setTopicos(topicos.map(topico => {
      if (topicosFiltrados.some(topicoFiltrado => topicoFiltrado.id === topico.id)) {
        return { ...topico, selecionado: !todosSelecionados };
      }
      return topico;
    }));
  };

  const handleSelecaoTopico = (id: string) => {
    setTopicos(topicos.map(topico => 
      topico.id === id ? { ...topico, selecionado: !topico.selecionado } : topico
    ));
  };

  // Funções para abrir modais
  const openEditModal = (topico: Topico) => {
    setCurrentTopico(topico);
    setIsOpenEdit(true);
  };

  const openDeleteModal = (topico: Topico) => {
    setCurrentTopico(topico);
    setIsOpenDelete(true);
  };

  // Função para salvar tópico editado
  const handleSaveTopico = (updatedTopico: Topico) => {
    setTopicos(topicos.map(topico => 
      topico.id === updatedTopico.id ? updatedTopico : topico
    ));
    setIsOpenEdit(false);
  };

  // Função para excluir tópico
  const handleDeleteTopico = (id: string) => {
    setTopicos(topicos.filter(topico => topico.id !== id));
    setIsOpenDelete(false);
  };

  // Função para adicionar aula
  const handleAdicionarAula = (tituloNovaAula: string, descricaoNovaAula: string) => {
    if (tituloNovaAula.trim()) {
      // Lógica para adicionar aula com os tópicos selecionados
      const topicosSelecionados = topicos
        .filter(topico => topico.selecionado)
        .map(topico => topico.id);
      
      console.log("Adicionando aula:", {
        titulo: tituloNovaAula,
        descricao: descricaoNovaAula,
        topicosIds: topicosSelecionados
      });
      
      // Resetar campos após adicionar
      setTituloNovaAula("");
      setDescricaoNovaAula("");
      
      // Desmarcar todos os tópicos após adicionar
      setTopicos(topicos.map(topico => ({...topico, selecionado: false})));
    }
  };

  return {
    handleSelecaoTodos,
    handleSelecaoTopico,
    openEditModal,
    openDeleteModal,
    handleSaveTopico,
    handleDeleteTopico,
    handleAdicionarAula
  };
};
