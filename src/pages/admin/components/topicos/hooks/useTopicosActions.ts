
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
      // Cadastrar a aula no banco de dados
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
      
      if (error) {
        if (error.code === '42P01') {
          // Tabela não existe, vamos criar
          const createTableError = await supabase.rpc('create_aulas_table');
          if (createTableError.error) {
            throw createTableError.error;
          }
          
          // Tentar inserir novamente após criar a tabela
          const secondAttempt = await supabase
            .from('aulas')
            .insert([
              {
                titulo: tituloNovaAula,
                descricao: descricaoNovaAula,
                topicos_ids: topicosSelecionados,
                status: 'ativo',
                created_at: new Date().toISOString()
              }
            ]);
          
          if (secondAttempt.error) throw secondAttempt.error;
        } else {
          throw error;
        }
      }
      
      // Sucesso ao adicionar a aula
      toast.success("Aula adicionada com sucesso!");
      
      // Resetar campos após adicionar
      setTituloNovaAula("");
      setDescricaoNovaAula("");
      
      // Desmarcar todos os tópicos após adicionar
      setTopicos(topicos.map(topico => ({...topico, selecionado: false})));
    } catch (error: any) {
      console.error("Erro ao adicionar aula:", error);
      
      // Verificar se o erro é porque a tabela não existe
      if (error.code === '42P01') {
        toast.error("Erro ao adicionar aula: A tabela de aulas não existe. Por favor, contate o administrador do sistema.");
      } else {
        toast.error("Erro ao adicionar a aula. Tente novamente.");
      }
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
