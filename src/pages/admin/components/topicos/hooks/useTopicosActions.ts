import { Topico } from "../TopicosTypes";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  const handleSaveTopico = async (updatedTopico: Topico) => {
    try {
      // Atualizar no Supabase
      const { error } = await supabase
        .from('topicos')
        .update({ 
          nome: updatedTopico.titulo,
          disciplina: updatedTopico.disciplina,
          patrocinador: updatedTopico.patrocinador,
          questoes_ids: updatedTopico.questoesIds
        })
        .eq('id', updatedTopico.id);

      if (error) throw error;
      
      // Atualizar na interface
      setTopicos(topicos.map(topico => 
        topico.id === updatedTopico.id ? updatedTopico : topico
      ));
      setIsOpenEdit(false);
      toast.success("Tópico atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar tópico:", error);
      toast.error("Erro ao atualizar o tópico. Tente novamente.");
    }
  };

  // Função para excluir tópico
  const handleDeleteTopico = async (id: string) => {
    try {
      const { error } = await supabase
        .from('topicos')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setTopicos(topicos.filter(topico => topico.id !== id));
      setIsOpenDelete(false);
      toast.success("Tópico excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir tópico:", error);
      toast.error("Erro ao excluir o tópico. Tente novamente.");
    }
  };

  // Função para adicionar aula
  const handleAdicionarAula = async (tituloNovaAula: string, descricaoNovaAula: string) => {
    if (!tituloNovaAula.trim()) {
      toast.error("O título da aula é obrigatório");
      return;
    }
    
    // Obter os tópicos selecionados
    const topicosSelecionados = topicos
      .filter(topico => topico.selecionado)
      .map(topico => topico.id);
    
    if (topicosSelecionados.length === 0) {
      toast.error("Selecione pelo menos um tópico para adicionar a aula");
      return;
    }

    try {
      // Cadastrar a aula no banco de dados usando o método insert correto
      const { data, error } = await supabase
        .from('aulas')
        .insert([
          {
            titulo: tituloNovaAula,
            descricao: descricaoNovaAula,
            topicos_ids: topicosSelecionados,
            status: 'ativo',
            created_at: new Date().toISOString()
          }
        ])
        .select();
      
      if (error) throw error;
      
      // Sucesso ao adicionar a aula
      toast.success("Aula adicionada com sucesso!");
      
      // Resetar campos após adicionar
      setTituloNovaAula("");
      setDescricaoNovaAula("");
      
      // Desmarcar todos os tópicos após adicionar
      setTopicos(topicos.map(topico => ({...topico, selecionado: false})));
    } catch (error: any) {
      console.error("Erro ao adicionar aula:", error);
      toast.error("Erro ao adicionar a aula. Tente novamente.");
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
